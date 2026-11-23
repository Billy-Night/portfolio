#!/usr/bin/env python3
"""
SEO snapshot & comparison tool (Python stdlib only, no installs needed).

Captures everything search engines care about from a site, either from a folder
of built HTML files or from a live URL, so the Astro migration can be checked
against the current site field by field.

Usage:
  # 1. Baseline of the current site (local files and/or live production)
  python3 scripts/seo_snapshot.py snapshot .                                  seo-baseline/local.json
  python3 scripts/seo_snapshot.py snapshot https://www.billynightingale.com   seo-baseline/live.json

  # 2. After migrating: compare the Astro build or a Netlify deploy preview
  python3 scripts/seo_snapshot.py compare seo-baseline/local.json dist
  python3 scripts/seo_snapshot.py compare seo-baseline/live.json  https://<preview>.netlify.app

  # Sanity checks on a single snapshot (canonicals, hreflang, sitemap, links)
  python3 scripts/seo_snapshot.py check seo-baseline/local.json

Exit code is 1 when differences / problems are found.
"""

import difflib
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

SITE = 'https://www.billynightingale.com'
SKIP_DIRS = {'node_modules', 'dist', 'scripts', 'seo-baseline', '.git', '.netlify', '.astro', 'src'}
SITE_FILES = ['robots.txt', 'sitemap.xml', 'llms.txt', 'fr/llms.txt', '_redirects', '_headers', 'site.webmanifest']
UA = 'seo-snapshot/1.0'


def norm(s):
    return re.sub(r'\s+', ' ', s or '').strip()


# ----------------------------------------------------------------------------
# HTML extraction
# ----------------------------------------------------------------------------

class SEOParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.d = {
            'lang': None, 'title': None, 'meta': {}, 'canonical': [], 'hreflang': {},
            'link_tags': [], 'jsonld': [], 'headings': [], 'images': [], 'links': [], 'text': [],
        }
        self.stack = []          # open tags we care about
        self.buf = None          # text buffer for title / headings / a / jsonld
        self.buf_kind = None
        self.skip = 0            # inside script/style/noscript (non json-ld)
        self.cur_link = None

    def handle_starttag(self, tag, attrs):
        a = {k: (v if v is not None else '') for k, v in attrs}
        d = self.d
        if tag == 'html':
            d['lang'] = a.get('lang')
        elif tag == 'title':
            self.buf, self.buf_kind = [], 'title'
        elif tag == 'meta':
            key = a.get('name') or a.get('property') or a.get('http-equiv') or ('charset' if 'charset' in a else None)
            if key:
                val = a.get('content', a.get('charset', ''))
                d['meta'].setdefault(key.lower(), []).append(norm(val))
        elif tag == 'link':
            rel = a.get('rel', '').lower()
            if rel == 'canonical':
                d['canonical'].append(a.get('href'))
            elif rel == 'alternate' and 'hreflang' in a:
                d['hreflang'][a['hreflang']] = a.get('href')
            elif rel in ('icon', 'manifest', 'apple-touch-icon', 'preload', 'prev', 'next'):
                d['link_tags'].append({k: a.get(k) for k in ('rel', 'href', 'sizes', 'as', 'type') if a.get(k)})
        elif tag == 'script':
            if a.get('type', '').lower() == 'application/ld+json':
                self.buf, self.buf_kind = [], 'jsonld'
            else:
                self.skip += 1
        elif tag in ('style', 'noscript', 'template'):
            self.skip += 1
        elif re.fullmatch(r'h[1-6]', tag):
            self.buf, self.buf_kind = [], tag
        elif tag == 'img':
            d['images'].append({k: a.get(k) for k in ('src', 'alt', 'width', 'height', 'loading') if k in a})
        elif tag == 'a' and 'href' in a:
            self.cur_link = {'href': a['href'], 'rel': a.get('rel') or None, 'text': []}

    def handle_endtag(self, tag):
        d = self.d
        if tag == 'title' and self.buf_kind == 'title':
            d['title'] = norm(''.join(self.buf)); self.buf = self.buf_kind = None
        elif tag == 'script':
            if self.buf_kind == 'jsonld':
                raw = ''.join(self.buf)
                try:
                    d['jsonld'].append(json.loads(raw))
                except ValueError:
                    d['jsonld'].append({'__INVALID_JSON__': norm(raw)})
                self.buf = self.buf_kind = None
            elif self.skip:
                self.skip -= 1
        elif tag in ('style', 'noscript', 'template') and self.skip:
            self.skip -= 1
        elif re.fullmatch(r'h[1-6]', tag) and self.buf_kind == tag:
            d['headings'].append(f'{tag}: {norm("".join(self.buf))}'); self.buf = self.buf_kind = None
        elif tag == 'a' and self.cur_link:
            link = self.cur_link
            link['text'] = norm(''.join(link['text']))
            d['links'].append({k: v for k, v in link.items() if v})
            self.cur_link = None

    def handle_data(self, data):
        if self.buf is not None:
            self.buf.append(data)
        if self.skip or self.buf_kind == 'jsonld':
            return
        if self.cur_link is not None:
            self.cur_link['text'].append(data)
        t = norm(data)
        if t and self.buf_kind != 'title':
            self.d['text'].append(t)


def extract(html):
    p = SEOParser()
    p.feed(html)
    d = p.d
    text = ' '.join(d.pop('text'))
    d['word_count'] = len(text.split())
    d['text'] = text
    d['text_sha1'] = hashlib.sha1(text.encode()).hexdigest()
    return d


# ----------------------------------------------------------------------------
# Sources: local directory or live URL
# ----------------------------------------------------------------------------

def file_to_path(rel):
    rel = rel.replace(os.sep, '/')
    if rel == 'index.html':
        return '/'
    if rel.endswith('/index.html'):
        return '/' + rel[:-len('index.html')]
    return '/' + rel[:-len('.html')]


def snapshot_dir(root):
    pages, site = {}, {}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [x for x in dirnames if x not in SKIP_DIRS and not x.startswith('.')]
        for f in filenames:
            full = os.path.join(dirpath, f)
            rel = os.path.relpath(full, root).replace(os.sep, '/')
            if f.endswith('.html'):
                with open(full, encoding='utf-8') as fh:
                    pages[file_to_path(rel)] = {'status': 200, **extract(fh.read())}
            elif f.endswith('.md') and rel.lower() != 'readme.md' or rel in SITE_FILES:
                with open(full, encoding='utf-8') as fh:
                    site['/' + rel] = fh.read()
    return {'source': os.path.abspath(root), 'pages': pages, 'site_files': site}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def fetch(url, follow=True):
    opener = urllib.request.build_opener() if follow else urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with opener.open(req, timeout=20) as r:
            return r.status, r.geturl(), r.headers, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, url, e.headers, e.read().decode('utf-8', 'replace')


def snapshot_url(base, seed_paths=None):
    base = base.rstrip('/')
    host = urllib.parse.urlparse(base).netloc
    todo = list(seed_paths or ['/', '/fr/'])
    seen, pages, site = set(), {}, {}

    def internal_path(href, from_path):
        u = urllib.parse.urlparse(urllib.parse.urljoin(base + from_path, href))
        if u.netloc not in (host, urllib.parse.urlparse(SITE).netloc):
            return None
        p = u.path or '/'
        ext = os.path.splitext(p)[1]
        return p if ext in ('', '.html') else None

    while todo and len(seen) < 200:
        path = todo.pop(0)
        if path in seen:
            continue
        seen.add(path)
        status, final, headers, body = fetch(base + path, follow=False)
        entry = {'status': status}
        if 300 <= status < 400:
            entry['location'] = headers.get('Location')
        elif status == 200 and 'html' in headers.get('Content-Type', ''):
            entry.update(extract(body))
            entry['x_robots_tag'] = headers.get('X-Robots-Tag')
            for l in entry['links']:
                p = internal_path(l['href'], path)
                if p and p not in seen:
                    todo.append(p)
        pages[path] = entry

    for f in SITE_FILES:
        status, _, _, body = fetch(f'{base}/{f}')
        if status == 200 and not f.startswith('_'):
            site['/' + f] = body
    for md in sorted(set(re.findall(r'\((?:https?://[^/)]+)?(/[^)\s]+\.md)\)', site.get('/llms.txt', '') + site.get('/fr/llms.txt', '')))):
        status, _, _, body = fetch(base + md)
        site[md] = body if status == 200 else f'__HTTP_{status}__'

    # Redirect behaviour of old .html URLs
    redirects = {}
    for p in sorted(pages):
        if pages[p].get('status') == 200:
            old = '/index.html' if p == '/' else (p + 'index.html' if p.endswith('/') else p + '.html')
            s, _, h, _ = fetch(base + old, follow=False)
            redirects[old] = {'status': s, 'location': h.get('Location')}
    return {'source': base, 'pages': pages, 'site_files': site, 'redirects': redirects}


def snapshot(src):
    return snapshot_url(src) if re.match(r'https?://', src) else snapshot_dir(src)


# ----------------------------------------------------------------------------
# Compare & checks
# ----------------------------------------------------------------------------

def strip_host(v, hosts):
    if isinstance(v, str):
        for h in hosts:
            v = v.replace(h, '<HOST>')
        return v
    if isinstance(v, list):
        return [strip_host(x, hosts) for x in v]
    if isinstance(v, dict):
        return {k: strip_host(x, hosts) for k, x in v.items()}
    return v


def compare(base, new):
    problems = []
    hosts = [h for h in {base['source'], new['source']} if h.startswith('http')]

    def out(msg):
        problems.append(msg); print(msg)

    bp, np_ = base['pages'], new['pages']
    for p in sorted(set(bp) - set(np_)):
        out(f'❌ MISSING PAGE {p}')
    for p in sorted(set(np_) - set(bp)):
        out(f'➕ NEW PAGE {p}')

    for p in sorted(set(bp) & set(np_)):
        a, b = bp[p], np_[p]
        for field in sorted(set(a) | set(b)):
            if field in ('text_sha1',):
                continue
            va, vb = a.get(field), b.get(field)
            if field == 'links':   # resolve hrefs like a crawler does: "about" == "/about" on /contact
                def resolved(links):
                    return sorted(json.dumps({**x, 'href': urllib.parse.urljoin(SITE + p, x['href'])}, sort_keys=True)
                                  for x in (links or []))
                va, vb = resolved(va), resolved(vb)
            if field == 'images':  # Astro rewrites src paths; compare alt/dimensions/order
                va = [{k: v for k, v in x.items() if k != 'src'} for x in (va or [])]
                vb = [{k: v for k, v in x.items() if k != 'src'} for x in (vb or [])]
            va, vb = strip_host(va, hosts), strip_host(vb, hosts)
            if va == vb:
                continue
            if field == 'text':
                diff = difflib.unified_diff(
                    re.split(r'(?<=[.!?:])\s+', va or ''), re.split(r'(?<=[.!?:])\s+', vb or ''),
                    'before', 'after', lineterm='', n=0)
                out(f'⚠️  {p} [visible text changed]\n    ' + '\n    '.join(list(diff)[:60]))
            elif isinstance(va, list) and isinstance(vb, list):
                # Lists (links, headings, images, json-ld): show only what was removed / added
                key = lambda x: x if isinstance(x, str) else json.dumps(x, sort_keys=True, ensure_ascii=False)
                ka, kb = [key(x) for x in va], [key(x) for x in vb]
                removed = [x for x in ka if ka.count(x) > kb.count(x)]
                added = [x for x in kb if kb.count(x) > ka.count(x)]
                lines = [f'    - {x[:400]}' for x in dict.fromkeys(removed)] + [f'    + {x[:400]}' for x in dict.fromkeys(added)]
                out(f'⚠️  {p} [{field}]' + ('\n' + '\n'.join(lines) if lines else ' (order changed)'))
            elif isinstance(va, dict) and isinstance(vb, dict):
                lines = []
                for k in sorted(set(va) | set(vb)):
                    if va.get(k) != vb.get(k):
                        lines.append(f'    {k}: {json.dumps(va.get(k), ensure_ascii=False)} -> {json.dumps(vb.get(k), ensure_ascii=False)}')
                out(f'⚠️  {p} [{field}]\n' + '\n'.join(lines))
            else:
                out(f'⚠️  {p} [{field}]\n    before: {json.dumps(va, ensure_ascii=False)[:600]}'
                    f'\n    after:  {json.dumps(vb, ensure_ascii=False)[:600]}')

    bs, ns = base.get('site_files', {}), new.get('site_files', {})
    for f in sorted(set(bs) | set(ns)):
        if f not in ns:
            out(f'❌ MISSING FILE {f}')
        elif f not in bs:
            out(f'➕ NEW FILE {f}')
        elif norm(bs[f]) != norm(ns[f]):
            diff = difflib.unified_diff(bs[f].splitlines(), ns[f].splitlines(), 'before', 'after', lineterm='', n=0)
            out(f'⚠️  FILE {f} changed\n    ' + '\n    '.join(list(diff)[:40]))

    br, nr = base.get('redirects', {}), new.get('redirects', {})
    for r in sorted(set(br) & set(nr)):
        if strip_host(br[r], hosts) != strip_host(nr[r], hosts):
            out(f'⚠️  REDIRECT {r}: before {br[r]} after {nr[r]}')
    return problems


def check(snap):
    issues = []
    pages = {p: d for p, d in snap['pages'].items() if d.get('status') == 200 and 'title' in d}
    sitemap = snap.get('site_files', {}).get('/sitemap.xml', '')
    locs = set(re.findall(r'<loc>\s*(.*?)\s*</loc>', sitemap))
    for p, d in sorted(pages.items()):
        if p.endswith('/404'):  # 404 pages have no canonical, hreflang or sitemap entry
            continue
        expected = SITE + p
        can = d['canonical']
        if len(can) != 1:
            issues.append(f'{p}: {len(can)} canonical tags')
        elif can[0] != expected:
            issues.append(f'{p}: canonical {can[0]} != {expected}')
        if not d['title']:
            issues.append(f'{p}: empty <title>')
        if not d['meta'].get('description'):
            issues.append(f'{p}: no meta description')
        h1 = [h for h in d['headings'] if h.startswith('h1:')]
        if len(h1) != 1:
            issues.append(f'{p}: {len(h1)} <h1> tags')
        if sitemap and expected not in locs and 'noindex' not in ' '.join(d['meta'].get('robots', [])):
            issues.append(f'{p}: indexable but not in sitemap.xml')
        for lang, href in d['hreflang'].items():
            tp = urllib.parse.urlparse(href).path or '/'
            target = pages.get(tp)
            if not target:
                issues.append(f'{p}: hreflang {lang} -> {href} (page not found)')
            elif expected not in target['hreflang'].values():
                issues.append(f'{p}: hreflang {lang} -> {tp}, but {tp} does not link back')
        for img in d['images']:
            if 'alt' not in img:
                issues.append(f'{p}: <img src={img.get("src")}> has no alt attribute')
        for l in d['links']:
            u = urllib.parse.urlparse(urllib.parse.urljoin(SITE + p, l['href']))
            if u.netloc == urllib.parse.urlparse(SITE).netloc and os.path.splitext(u.path)[1] in ('', '.html'):
                tp = u.path or '/'
                if tp.endswith('.html'):
                    clean = file_to_path(tp.lstrip('/'))
                    issues.append(f'{p}: link to {l["href"]} goes through a 301 (use {clean})')
                    tp = clean
                if tp not in snap['pages']:
                    issues.append(f'{p}: internal link to {l["href"]} (no such page)')
    for loc in sorted(locs):
        if urllib.parse.urlparse(loc).path not in pages:
            issues.append(f'sitemap: {loc} has no matching page')
    issues = sorted(set(issues))
    for i in issues:
        print('•', i)
    return issues


def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(2)
    cmd = sys.argv[1]
    if cmd == 'snapshot':
        snap = snapshot(sys.argv[2])
        out = sys.argv[3] if len(sys.argv) > 3 else 'seo-snapshot.json'
        os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
        with open(out, 'w', encoding='utf-8') as fh:
            json.dump(snap, fh, indent=2, ensure_ascii=False, sort_keys=True)
        print(f'Saved {len(snap["pages"])} pages, {len(snap["site_files"])} files -> {out}')
    elif cmd == 'compare':
        with open(sys.argv[2], encoding='utf-8') as fh:
            base = json.load(fh)
        problems = compare(base, snapshot(sys.argv[3]))
        print(f'\n{len(problems)} difference(s).' if problems else '✅ No SEO differences.')
        sys.exit(1 if problems else 0)
    elif cmd == 'check':
        with open(sys.argv[2], encoding='utf-8') as fh:
            issues = check(json.load(fh))
        print(f'\n{len(issues)} issue(s).' if issues else '✅ No issues.')
        sys.exit(1 if issues else 0)
    else:
        print(__doc__); sys.exit(2)


if __name__ == '__main__':
    main()
