#!/usr/bin/env python3
"""htmldiff.py old.html new.html — tag/attribute/text-level diff of two HTML files (whitespace-insensitive)."""
import re,difflib,sys,json
from html.parser import HTMLParser
SVG={'path','line','rect','circle','polygon','polyline','ellipse','stop','use','animate'}
class T(HTMLParser):
    def __init__(s): super().__init__(convert_charrefs=True); s.t=[]; s.ld=False
    def handle_starttag(s,tag,a):
        s.ld = tag=='script' and ('type','application/ld+json') in a
        s.t.append(('<',tag,tuple(sorted((k,' '.join(sorted((v or '').split())) if k=='class' else re.sub(r'\s+',' ',v or '').strip()) for k,v in a if not k.startswith('data-astro-cid')))))
    def handle_startendtag(s,tag,a): s.handle_starttag(tag,a)
    def handle_endtag(s,tag):
        if tag not in SVG: s.t.append(('</',tag))
    def handle_data(s,d):
        if s.ld: s.t.append(('json',json.dumps(json.loads(d),sort_keys=True))); s.ld=False; return
        d=re.sub(r'\s+',' ',d).strip()
        if d: s.t.append(('txt',d))
def toks(f): p=T(); p.feed(open(f,encoding='utf-8').read()); return [repr(x) for x in p.t]
a,b=toks(sys.argv[1]),toks(sys.argv[2])
d=[l for l in difflib.unified_diff(a,b,lineterm='',n=0) if l[:1] in '+-' and l[:3] not in('+++','---')]
print(f'{sys.argv[2]}: {len(a)} tokens, {len(d)} differences'); print('\n'.join('  '+x[:230] for x in d[:40]))
