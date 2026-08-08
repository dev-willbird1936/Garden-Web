const fs = require('fs');
const path = 'js/garden.js';
let s = fs.readFileSync(path, 'utf8');

if (s.includes('improvedShed.rotation.y = Math.PI;')
  && !s.includes('const sx=-1.95, sz=8.30;')
  && !s.includes('improvedShed.position.set(sx,heightAt(sx,sz),sz);')) {
  console.log('GARDEN_SHED_POSITION_AND_DOOR_PATCH_ALREADY_APPLIED');
  process.exit(0);
}

const fromCoords = 'const sx=-1.95, sz=8.30;';
const toCoords = 'const sx=1.35, sz=4.90;';
if (s.includes(fromCoords)) s = s.replace(fromCoords, toCoords);
else if (!s.includes(toCoords)) throw new Error('Improved shed coordinate marker not found');

const fromPos = 'improvedShed.position.set(sx,heightAt(sx,sz),sz);';
const toPos = 'improvedShed.position.set(sx,heightAt(sx,sz),sz);\n    improvedShed.rotation.y = Math.PI;';
if (s.includes(fromPos)) s = s.replace(fromPos, toPos);
else if (!s.includes(toPos)) throw new Error('Improved shed position marker not found');

if (s !== fs.readFileSync(path, 'utf8')) fs.writeFileSync(path, s);
console.log(s.includes(toPos) && s.includes(toCoords)
  ? 'GARDEN_SHED_POSITION_AND_DOOR_PATCH_OK'
  : 'GARDEN_SHED_POSITION_AND_DOOR_PATCH_ALREADY_APPLIED');
