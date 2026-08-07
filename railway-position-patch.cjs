const fs = require('fs');
const path = 'js/garden.js';
let s = fs.readFileSync(path, 'utf8');
const from = 'const sx=-1.95, sz=8.30;';
const to = 'const sx=1.55, sz=4.90;';
if (!s.includes(from)) throw new Error('Improved shed coordinate marker not found');
s = s.replace(from, to);
fs.writeFileSync(path, s);
console.log('GARDEN_SHED_POSITION_PATCH_OK');
