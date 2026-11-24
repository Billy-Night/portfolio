#!/usr/bin/env python3
# usage: style_compare.py <before-dir> <after-dir> [repeat-dir ...]
# Compares two sets of measurements from style_measure.mjs and lists every element whose box or style changed.
# Each repeat-dir is another measurement of the *before* build: an element that differs between two runs of the
# same build (the hero orbit, the Landes phone) is ignored. SHOW=20 prints up to 20 elements per page.
import sys, os, collections
ref, new = sys.argv[1], sys.argv[2]
noises = sys.argv[3:]
def load(d, f):
    p = os.path.join(d, f)
    return [l for l in open(p).read().split('\n') if l and not l.startswith('  #')] if os.path.exists(p) else None
tot = bad = 0; byfile = collections.OrderedDict()
for f in sorted(os.listdir(ref)):
    if not f.endswith('.txt'): continue
    a, b = load(ref, f), load(new, f)
    if b is None: print('MISSING', f); bad += 1; continue
    ns = [x for x in (load(d, f) for d in noises) if x]
    if len(a) != len(b): byfile[f] = [f'element count {len(a)} -> {len(b)}']; continue
    d = []
    for i, (x, y) in enumerate(zip(a, b)):
        tot += 1
        if x != y and not any(i < len(n) and n[i] != x for n in ns):
            xa, ya = x.split('|'), y.split('|')
            d.append(f'{xa[0]} {xa[1]} box {xa[2]} -> {ya[2]}' + ('' if xa[3] == ya[3] else ' style changed'))
    if d: byfile[f] = d
for f, d in byfile.items():
    print(f'{f}: {len(d)} differing'); [print('   ', l) for l in d[:int(os.environ.get("SHOW", 6))]]
print(f'compared {tot} elements in {len([f for f in os.listdir(ref) if f.endswith(".txt")])} page views: {sum(len(d) for d in byfile.values())} differences in {len(byfile)} views')
