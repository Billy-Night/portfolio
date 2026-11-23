#!/usr/bin/env python3
"""pngdiff.py a.png b.png — stdlib-only pixel diff: prints differing pixel count and bounding boxes per 200px band."""
import sys, zlib, struct
def load(p):
    d=open(p,'rb').read(); assert d[:8]==b'\x89PNG\r\n\x1a\n'
    i=8; idat=b''
    while i<len(d):
        n,t=struct.unpack('>I4s',d[i:i+8]); c=d[i+8:i+8+n]; i+=12+n
        if t==b'IHDR': w,h,bd,ct=struct.unpack('>IIBB',c[:10])
        elif t==b'IDAT': idat+=c
    bpp={2:3,6:4}[ct]; raw=zlib.decompress(idat); stride=w*bpp; rows=[]; prev=bytearray(stride); pos=0
    for y in range(h):
        f=raw[pos]; line=bytearray(raw[pos+1:pos+1+stride]); pos+=1+stride
        if f==1:
            for x in range(bpp,stride): line[x]=(line[x]+line[x-bpp])&255
        elif f==2:
            for x in range(stride): line[x]=(line[x]+prev[x])&255
        elif f==3:
            for x in range(stride): line[x]=(line[x]+(((line[x-bpp] if x>=bpp else 0)+prev[x])>>1))&255
        elif f==4:
            for x in range(stride):
                a=line[x-bpp] if x>=bpp else 0; b=prev[x]; c=prev[x-bpp] if x>=bpp else 0
                p=a+b-c; pa,pb,pc=abs(p-a),abs(p-b),abs(p-c)
                line[x]=(line[x]+(a if pa<=pb and pa<=pc else b if pb<=pc else c))&255
        rows.append(bytes(line)); prev=line
    return w,h,bpp,rows
w,h,bpp,A=load(sys.argv[1]); w2,h2,_,B=load(sys.argv[2])
if (w,h)!=(w2,h2): print('size differs',(w,h),(w2,h2)); sys.exit()
tot=0; bands={}
for y in range(h):
    if A[y]==B[y]: continue
    a,b=A[y],B[y]; xs=[x for x in range(w) if a[x*bpp:x*bpp+3]!=b[x*bpp:x*bpp+3]]
    if not xs: continue
    tot+=len(xs); k=y//200; lo,hi,n=bands.get(k,(w,0,0)); bands[k]=(min(lo,xs[0]),max(hi,xs[-1]),n+len(xs))
print(f'{tot} px differ of {w*h} ({100*tot/(w*h):.2f}%)')
for k in sorted(bands): print(f'  y {k*200}-{k*200+199}: x {bands[k][0]}-{bands[k][1]}  ({bands[k][2]} px)')
