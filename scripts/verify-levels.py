# Oberoende kontroll av levels.json: exakt en lösning (brute force), sammanhängande områden, giltig lagrad lösning.
# Körs med: python3 scripts/verify-levels.py
import json, itertools, sys
import os
levels = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'levels.json')))
bad = 0
def count(n, grid):
    # brute force via permutations av kolumner (oberoende av JS-koden)
    c = 0
    for perm in itertools.permutations(range(n)):
        if any(abs(perm[r]-perm[r+1]) <= 1 for r in range(n-1)): continue
        if len({grid[r*n+perm[r]] for r in range(n)}) != n: continue
        c += 1
        if c > 1: break
    return c
for lv in levels:
    n, g, sol = lv['n'], lv['grid'], lv['solution']
    errs = []
    if len(g) != n*n: errs.append('fel storlek')
    if len(set(g)) != n: errs.append('fel antal områden')
    # sammanhängande områden
    for reg in set(g):
        cells = {i for i in range(n*n) if g[i]==reg}
        st=[next(iter(cells))]; seen={st[0]}
        while st:
            x=st.pop(); r,c=divmod(x,n)
            for dr,dc in((1,0),(-1,0),(0,1),(0,-1)):
                rr,cc=r+dr,c+dc
                y=rr*n+cc
                if 0<=rr<n and 0<=cc<n and y in cells and y not in seen: seen.add(y); st.append(y)
        if seen!=cells: errs.append(f'område {reg} ej sammanhängande')
    # lagrad lösning giltig
    if sorted(sol)!=list(range(n)): errs.append('lösning ej permutation')
    if any(abs(sol[r]-sol[r+1])<=1 for r in range(n-1)): errs.append('damer rör varandra')
    if len({g[r*n+sol[r]] for r in range(n)})!=n: errs.append('lösning bryter områdesregel')
    if count(n,g)!=1: errs.append('inte exakt en lösning')
    if errs: bad+=1; print(lv['id'], errs)
print('klara:', len(levels), 'banor, fel:', bad)
sys.exit(1 if bad else 0)
