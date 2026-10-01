// Följer Tips-knappen steg för steg på alla banor och kontrollerar att varje bana blir löst utan fel förslag.
// Kräver playwright. Körs med: node test/hints.test.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 400, height: 700 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + require('path').join(__dirname, '..', 'index.html'));
  const res = await p.evaluate(() => {
    const out = { levels: 0, solved: 0, bad: [], maxSteps: 0, kinds: {} };
    for (let li = 0; li < LEVELS.length; li++) {
      load(li); out.levels++;
      const sol = new Set(lv.solution.map((c, r) => r * n + c));
      let steps = 0, fail = null;
      while (!finished && steps < 400) {
        steps++;
        document.getElementById('hint').click();
        const h = hint;
        out.kinds[h.kind] = (out.kinds[h.kind] || 0) + 1;
        if (!h.cells.size) { fail = 'ingen tips'; break; }
        const next = marks.slice();
        if (h.kind === 'place') { const i = [...h.cells][0]; if (!sol.has(i)) { fail = 'fel dam foreslagen'; break; } next[i] = 2; }
        else if (h.kind === 'elim') { for (const i of h.cells) { if (sol.has(i)) { fail = 'strok losningsruta'; break; } next[i] = 1; } if (fail) break; if (!h.why.size) { fail = 'saknar skal'; break; } }
        else { fail = 'oväntat ' + h.kind; break; }
        setMarks(next);
      }
      if (finished) out.solved++; else out.bad.push([LEVELS[li].id, fail || 'ej klar']);
      out.maxSteps = Math.max(out.maxSteps, steps);
    }
    return out;
  });
  console.log(JSON.stringify(res), errs.join('|'));
  if (res.solved !== res.levels || errs.length) process.exitCode = 1;
  await b.close();
})();
