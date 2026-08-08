const fs=require("fs"),cp=require("child_process");
let g=fs.readFileSync("js/garden.js","utf8"),m=fs.readFileSync("js/main.js","utf8"),h=fs.readFileSync("index.html","utf8");
const need=(s,x,n)=>{if(!s.includes(x))throw Error(n)};

const alreadyPatched = [
  g.includes('const improvedMode = new URLSearchParams(window.location.search).get("improved") === "1";'),
  g.includes('setClutterVisible(visible) { clutterGroup.visible = Boolean(visible); }'),
  m.includes('const clutterToggle=document.getElementById("clutterToggle");'),
  m.includes('const improvedToggle=document.getElementById("improvedToggle");'),
  h.includes('id="improvedToggle"'),
].every(Boolean);
if (alreadyPatched) {
  console.log("GARDEN_BUILD_PATCH_ALREADY_APPLIED");
  process.exit(0);
}

need(g,"  const g = new THREE.Group();\n  scene.add(g);","garden group");
g=g.replace(
  "  const g = new THREE.Group();\n  scene.add(g);",
  `  const g = new THREE.Group();
  scene.add(g);
  const clutterGroup = new THREE.Group();
  clutterGroup.name = "removable-clutter";
  g.add(clutterGroup);
  const CLEAN_KEEP_KINDS = new Set(["shed","telescopicPole","concretePostIvy","flowerPatch","shrub","whiteFrame"]);
  const improvedMode = new URLSearchParams(window.location.search).get("improved") === "1";`
);

g=g.replace(
  "  const soilMat = new THREE.MeshStandardMaterial({ map: MAT.soilTexture(), roughness: 1 });\n  soilMat.map.repeat.set(5, 12);",
  `  const soilMat = new THREE.MeshStandardMaterial({ color: "#6f914f", roughness: 1 });`
);
g=g.replace(
  "    map: MAT.lawnTexture(lawnBounds, dryness, dirtMargin),",
  "    map: MAT.lawnTexture(lawnBounds, () => 0, () => 0),"
);
g=g.replace("  g.add(membrane);","  clutterGroup.add(membrane);");
g=g.replace("    g.add(lump);","    clutterGroup.add(lump);");

{
  const s=g.indexOf("  for (const p of L.PLACEMENTS) {");
  const e=g.indexOf("  /* ---------- washing line",s);
  if(s<0||e<0)throw Error("placements");
  let q=g.slice(s,e);
  q=q.replace(
    "  for (const p of L.PLACEMENTS) {",
    `  for (const p of L.PLACEMENTS) {\n    if (improvedMode && p.kind === "shed") continue;`
  );
  need(q,"    g.add(obj);","placement add");
  q=q.replace(
    "    g.add(obj);",
    "    (CLEAN_KEEP_KINDS.has(p.kind) ? g : clutterGroup).add(obj);"
  );
  const add=`  if (improvedMode) {
    const sx=-1.95, sz=8.30;
    const improvedShed=OBJ.shed(1.8288,2.4384,1.90,0.08);
    improvedShed.position.set(sx,heightAt(sx,sz),sz);
    g.add(improvedShed);
  }

`;
  g=g.slice(0,s)+q+add+g.slice(e);
}

g=g.replace("  for (const t of L.TREES) {","  for (const t of []) {");
g=g.replace("      const dry = dryness(x, z);","      const dry = 0;");
g=g.replace("      const mg = dirtMargin(x, z);","      const mg = 0;");

need(g,"  return {\n    group: g,\n    labels,\n    update(dt) {","return");
g=g.replace(
  "  return {\n    group: g,\n    labels,\n    update(dt) {",
  `  return {
    group: g,
    labels,
    setClutterVisible(visible) { clutterGroup.visible = Boolean(visible); },
    update(dt) {`
);

need(m,"const garden = buildGarden(scene, { quality, clouds: settings.clouds });","main build");
m=m.replace(
  "const garden = buildGarden(scene, { quality, clouds: settings.clouds });",
  `const garden = buildGarden(scene, { quality, clouds: settings.clouds });

const clutterToggle=document.getElementById("clutterToggle");
if(clutterToggle){
  let hide=false;
  try{hide=localStorage.getItem("garden3d.hideClutter")==="1"}catch{}
  clutterToggle.checked=hide;
  garden.setClutterVisible(!hide);
  clutterToggle.addEventListener("change",()=>{
    garden.setClutterVisible(!clutterToggle.checked);
    try{localStorage.setItem("garden3d.hideClutter",clutterToggle.checked?"1":"0")}catch{}
  });
}
const improvedToggle=document.getElementById("improvedToggle");
if(improvedToggle){
  const params=new URLSearchParams(window.location.search);
  improvedToggle.checked=params.get("improved")==="1";
  improvedToggle.addEventListener("change",()=>{
    if(improvedToggle.checked)params.set("improved","1");else params.delete("improved");
    const q=params.toString();
    window.location.href=window.location.pathname+(q?"?"+q:"")+window.location.hash;
  });
}`
);

need(h,"</body>","body");
const ui=`
<style id="garden-mode-toggle-style">
.garden-mode-toggle{position:fixed;z-index:16;left:max(14px,env(safe-area-inset-left));display:inline-flex;align-items:center;gap:9px;min-height:42px;padding:8px 12px;border:1px solid rgba(255,255,255,.14);border-radius:11px;background:rgba(11,20,24,.88);color:#eef4f1;box-shadow:0 6px 18px rgba(0,0,0,.22);backdrop-filter:blur(9px);font:650 13px/1.2 system-ui;cursor:pointer;user-select:none}
.garden-mode-toggle input{width:18px;height:18px;margin:0;accent-color:#58a06a}
.clutter-toggle{top:calc(max(12px,env(safe-area-inset-top)) + 98px)}
.improved-toggle{top:calc(max(12px,env(safe-area-inset-top)) + 150px)}
@media(max-width:680px){
 .garden-mode-toggle{min-height:40px;padding:7px 10px;font-size:12px}
 .clutter-toggle{top:calc(max(10px,env(safe-area-inset-top)) + 94px)}
 .improved-toggle{top:calc(max(10px,env(safe-area-inset-top)) + 144px)}
}
</style>
<label class="garden-mode-toggle clutter-toggle" for="clutterToggle"><input id="clutterToggle" type="checkbox"><span>Remove clutter</span></label>
<label class="garden-mode-toggle improved-toggle" for="improvedToggle"><input id="improvedToggle" type="checkbox"><span>Improved</span></label>
`;
h=h.replace("</body>",ui+"\n</body>");

fs.writeFileSync("js/garden.js",g);
fs.writeFileSync("js/main.js",m);
fs.writeFileSync("index.html",h);

for(const f of ["js/garden.js","js/main.js"]){
  const r=cp.spawnSync(process.execPath,["--check",f],{encoding:"utf8"});
  if(r.status!==0)throw Error(f+": "+(r.stderr||r.stdout));
}
if(!h.includes(`id="improvedToggle"`)||!g.includes("improvedMode")||!g.includes("for (const t of [])"))throw Error("verify");
console.log("GARDEN_BUILD_PATCH_OK");
