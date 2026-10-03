// Bygger index.html: stoppar in levels.json i src/app.template.html (en sida, banorna inbäddade).
// Bygger även sw.js med en cacheversion som ändras när någon av de förcachade filerna ändras.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const root = path.join(__dirname, '..');
const tpl = fs.readFileSync(path.join(root, 'src', 'app.template.html'), 'utf8');
const levels = JSON.parse(fs.readFileSync(path.join(root, 'levels.json'), 'utf8'));
// Delningsbilden (og:image) kräver en fullständig adress. Utan SITE_URL blir den relativ, vilket räcker lokalt.
let site = process.env.SITE_URL || '';
if (site && !site.endsWith('/')) site += '/';
// Versionen på startskärmen: datum för senaste commit och dess korta id, t.ex. "2026-10-03 · ea81d8c".
// "-dirty" betyder ocommittade ändringar (lokalt). Utan git blir det "utvecklingsversion".
let appVersion = 'utvecklingsversion';
try {
  const git = (a) => execSync('git ' + a, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  appVersion = `${git('log -1 --format=%cs')} · ${git('describe --always --dirty --abbrev=7')}`;
} catch (e) {}
fs.writeFileSync(path.join(root, 'index.html'), tpl.replace('__LEVELS__', JSON.stringify(levels))
  .replaceAll('__SITE_URL__', site).replace('__APP_VERSION__', 'Version ' + appVersion));
console.log(`index.html byggd med ${levels.length} banor, version ${appVersion}` + (site ? `, adress ${site}` : ', utan SITE_URL'));

// PNG-ikonerna kräver playwright (scripts/build-icons.js). Saknas de lokalt hoppas de över; i Actions byggs de alltid först.
const assets = ['index.html', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png']
  .concat(fs.readdirSync(path.join(root, 'fonts')).map((f) => 'fonts/' + f))
  .filter((a) => fs.existsSync(path.join(root, a)) || console.warn(`varning: ${a} saknas, kör node scripts/build-icons.js`));
const hash = crypto.createHash('sha256');
for (const a of assets) hash.update(a).update(fs.readFileSync(path.join(root, a)));
const version = hash.digest('hex').slice(0, 12);
const files = ['./'].concat(assets.filter((a) => a !== 'index.html'));
const sw = fs.readFileSync(path.join(root, 'src', 'sw.template.js'), 'utf8')
  .replace('__VERSION__', version).replace('__FILES__', JSON.stringify(files, null, 2));
fs.writeFileSync(path.join(root, 'sw.js'), sw);
console.log(`sw.js byggd, version ${version}`);
