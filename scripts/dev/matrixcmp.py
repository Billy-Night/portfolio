#!/usr/bin/env python3
"""matrixcmp.py <dir> [tolerance] [--max]

Compare image boxes between two builds at every recorded window width, and report
images that are less sharp than before (file pixels vs displayed pixels).
<dir> holds old_<width>.txt and new_<width>.txt, written by cdp_eval.mjs with imgbox_expr.js.
"""
import re,sys,glob,os
S=sys.argv[1].rstrip('/')+'/'
TOL=int(sys.argv[2]) if len(sys.argv)>2 and sys.argv[2].isdigit() else 2
def load(f):
    pages={}; cur=None
    for l in open(f).read().splitlines():
        if '|' not in l:
            m=re.match(r'(\S+)\s+(h=\d+|TIMEOUT)',l)
            cur=m.group(1) if m and m.group(2)!='TIMEOUT' else None
            if m and m.group(2)=='TIMEOUT': print('   TIMEOUT in',os.path.basename(f),m.group(1))
            if cur: pages[cur]={'__h':int(m.group(2)[2:])}
            continue
        if cur is None: continue
        p=l.split('|'); pages[cur][p[0]]=dict(w=int(p[1]),h=int(p[2]),x=int(p[3]),y=int(p[4]),nw=int(p[5]),ok=p[7],file=p[9])
    return pages
widths=sorted(int(re.search(r'old_(\d+)',f).group(1)) for f in glob.glob(S+'old_*.txt'))
total=bad=soft=0; maxshown={}
for vw in widths:
    if not os.path.exists(f'{S}new_{vw}.txt'): print(f'== {vw}px: no new measurement'); continue
    o,n=load(f'{S}old_{vw}.txt'),load(f'{S}new_{vw}.txt'); diffs=[]; softs=[]; cnt=0
    for page in n:
        if page not in o: continue
        dh=n[page]['__h']-o[page]['__h']
        for k,v in n[page].items():
            if k=='__h': continue
            b=o[page].get(k); cnt+=1
            if b is None: diffs.append(f'{page}: NEW {k[:50]}'); continue
            if v['ok']!='ok': diffs.append(f'{page}: BROKEN {k[:50]}')
            d=[f'{f} {b[f]}->{v[f]}' for f in ('w','h','x','y') if abs(b[f]-v[f])>TOL]
            if d: diffs.append(f'{page[:10]:10} {k[:44]:44} '+', '.join(d))
            if re.search(r'\.webp',v['file']) and v['w']>0 and v['nw']<min(b['nw'],v['w']) and v['nw']<v['w']*0.98: softs.append(f'{page[:10]:10} {k[:44]:44} shown {v["w"]}px from a {v["nw"]}px file (before: {b["nw"]}px)')
            maxshown[k]=max(maxshown.get(k,0),b['w'])
        if abs(dh)>TOL+2: diffs.append(f'{page}: page height {o[page]["__h"]} -> {n[page]["__h"]}')
    total+=cnt; bad+=len(diffs); soft+=len(softs)
    print(f'== window {vw}px: {cnt} images, {len(diffs)} moved or resized, {len(softs)} less sharp than before')
    for d in diffs[:8]: print('     '+d)
    for s in softs[:6]: print('     SOFT '+s)
print(f'TOTAL: {total} image boxes compared across {len(widths)} widths; {bad} differ by more than {TOL}px; {soft} less sharp')
if '--max' in sys.argv:
    print('\nlargest displayed width per image (old build, any window width):')
    for k,v in sorted(maxshown.items(),key=lambda kv:kv[0]): print(f'  {v:>5}px  {k[:80]}')
