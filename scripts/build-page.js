// Bygger index.html: stoppar in levels.json i src/app.template.html (en enda fil utan externa beroenden).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const tpl = fs.readFileSync(path.join(root, 'src', 'app.template.html'), 'utf8');
const levels = JSON.parse(fs.readFileSync(path.join(root, 'levels.json'), 'utf8'));
fs.writeFileSync(path.join(root, 'index.html'), tpl.replace('__LEVELS__', JSON.stringify(levels)));
console.log(`index.html byggd med ${levels.length} banor`);
