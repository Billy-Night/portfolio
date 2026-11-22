#!/usr/bin/env python3
"""intcmp.py <ref-runs> <new-runs> — compare interaction recordings, ignoring which scroll step the two scroll-timed effects land on."""
import glob,re,os,sys,difflib
def canon(t):
    out=[]
    for l in t.splitlines():
        if not l.strip(): continue
        l2=re.sub(r'\.sections--hidden','',l)
        # image URLs: compare by file name only (the optimised copies have a hash and live in /_astro/)
        l2=re.sub(r'\[src=[^\]]*?/([^/\]]+?)(?:\.[A-Za-z0-9_-]{8}(?:_[A-Za-z0-9_-]+)?)?\.(?:webp|png|jpe?g|svg)\]',r'[src=\1]',l2)
        if '=>' in l2:
            a,b=l2.split(':',1)[1].split('  =>  ')
            if a.strip()==b.strip(): continue
        if 'ts-heading' in l and ('hide-ts-h' in l or 'reveal-text' in l) and '=>' in l: continue
        out.append(l2)
    return '\n'.join(out)
ref,new=sys.argv[1],sys.argv[2]
pages=sorted({os.path.basename(f) for f in glob.glob(ref+'/*/*.txt')}); allok=True
for p in pages:
    refs={canon(open(f).read()) for f in glob.glob(f'{ref}/*/{p}')}
    news=[canon(open(f).read()) for f in sorted(glob.glob(f'{new}/*/{p}'))]
    exact_refs={open(f).read() for f in glob.glob(f'{ref}/*/{p}')}
    exact=sum(open(f).read() in exact_refs for f in sorted(glob.glob(f'{new}/*/{p}')))
    m=sum(n in refs for n in news); ok=m==len(news) and len(news)>0; allok&=ok
    errs={re.search(r'### errors: (.*)',open(f).read()).group(1) for f in glob.glob(f'{new}/*/{p}')}
    print(f'{p:36} matching: {m}/{len(news)} (exact: {exact})  errors: {" ".join(errs)}  {"" if ok else "<-- DIFFERS"}')
    if not ok and news:
        bad=next(n for n in news if n not in refs); best=min(refs,key=lambda r: sum(1 for _ in difflib.unified_diff(r.splitlines(),bad.splitlines(),lineterm='',n=0)))
        for l in list(difflib.unified_diff(best.splitlines(),bad.splitlines(),'reference','new',lineterm='',n=1))[:20]: print('     '+l[:190])
print('ALL MATCH' if allok else 'SOME DIFFER'); sys.exit(0 if allok else 1)
