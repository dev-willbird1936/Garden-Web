const fs = require('fs');
const path = 'js/garden.js';
let s = fs.readFileSync(path, 'utf8');

const fromCoords = 'const sx=-1.95, sz=8.30;';
const toCoords = 'const sx=1.35, sz=4.90;';
if (!s.includes(fromCoords)) throw new Error('Improved shed coordinate marker not found');
s = s.replace(fromCoords, toCoords);

const fromPos = 'improvedShed.position.set(sx,heightAt(sx,sz),sz);';
const toPos = 'improvedShed.position.set(sx,heightAt(sx,sz),sz);\n    improvedShed.rotation.y = Math.PI;';
if (!s.includes(fromPos)) throw new Error('Improved shed position marker not found');
s = s.replace(fromPos, toPos);

fs.writeFileSync(path, s);
console.log('GARDEN_SHED_POSITION_AND_DOOR_PATCH_OK');
