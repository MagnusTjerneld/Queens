// Genererar 100 banor till levels.json: 20 st 6x6, 25 st 7x7, 30 st 8x8 och 25 st 9x9, sorterade efter storlek och poäng.
// Varje bana har exakt en lösning och går att lösa med ren logik. Körs med: node scripts/generate-levels.js
const fs = require('fs');
const { generateLevel } = require('../src/queens.js');
const plan = [[6, 20], [7, 25], [8, 30], [9, 25]];
const levels = [];
for (const [n, count] of plan) {
  const batch = [], seen = new Set();
  let seed = 50000 + n * 1000;
  while (batch.length < count) {
    const lv = generateLevel({ n, tier: null, seed: seed++, maxAttempts: 400 });
    if (!lv) continue;
    const key = lv.grid.join('');
    if (seen.has(key)) continue;
    seen.add(key);
    batch.push(lv);
  }
  batch.sort((a, b) => a.score - b.score);
  levels.push(...batch);
  console.log(`n=${n}: ${batch.length} banor, poäng ${batch[0].score}..${batch[batch.length - 1].score}`);
}
// Relabela områdesnummer efter första förekomst (läsordning), så siffrorna inte avslöjar dam-raden.
const out = levels.map((lv, i) => {
  const map = new Map(); let next = 0;
  const grid = lv.grid.map((g) => { if (!map.has(g)) map.set(g, next++); return map.get(g); });
  return { id: i + 1, n: lv.n, tier: lv.tier, score: lv.score, grid, solution: lv.solution };
});
fs.writeFileSync(require('path').join(__dirname, '..', 'levels.json'), JSON.stringify(out));
console.log('skrev', out.length, 'banor');
