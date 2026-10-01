// Renderar icons/icon.svg till PNG-ikonerna som manifestet och iOS behöver. Kräver playwright.
// Körs med: node scripts/build-icons.js
const fs = require('fs');
const path = require('path');
const launch = require('./browser');
const dir = path.join(__dirname, '..', 'icons');
const svg = fs.readFileSync(path.join(dir, 'icon.svg'), 'utf8');
const sizes = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180 };
(async () => {
  const b = await launch();
  for (const [name, s] of Object.entries(sizes)) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<style>html,body{margin:0}svg{display:block;width:${s}px;height:${s}px}</style>${svg}`);
    await p.screenshot({ path: path.join(dir, name) });
    await p.close();
    console.log(`${name} (${s}x${s})`);
  }
  await b.close();
})();
