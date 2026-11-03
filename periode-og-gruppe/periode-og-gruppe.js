/* Periode eller gruppe? Bygger periodesystemet som klosser inne i #periode-og-gruppe. Ingen avhengigheter. */
(function () {
const root = document.getElementById("periode-og-gruppe");
if (!root) return;
const N = {1:"H Hydrogen",2:"He Helium",3:"Li Litium",4:"Be Beryllium",5:"B Bor",6:"C Karbon",7:"N Nitrogen",8:"O Oksygen",9:"F Fluor",10:"Ne Neon",11:"Na Natrium",12:"Mg Magnesium",13:"Al Aluminium",14:"Si Silisium",15:"P Fosfor",16:"S Svovel",17:"Cl Klor",18:"Ar Argon",19:"K Kalium",20:"Ca Kalsium",21:"Sc Scandium",22:"Ti Titan",23:"V Vanadium",24:"Cr Krom",25:"Mn Mangan",26:"Fe Jern",27:"Co Kobolt",28:"Ni Nikkel",29:"Cu Kobber",30:"Zn Sink",31:"Ga Gallium",32:"Ge Germanium",33:"As Arsen",34:"Se Selen",35:"Br Brom",36:"Kr Krypton",37:"Rb Rubidium",38:"Sr Strontium",39:"Y Yttrium",40:"Zr Zirkonium",41:"Nb Niob",42:"Mo Molybden",43:"Tc Technetium",44:"Ru Ruthenium",45:"Rh Rhodium",46:"Pd Palladium",47:"Ag Sølv",48:"Cd Kadmium",49:"In Indium",50:"Sn Tinn",51:"Sb Antimon",52:"Te Tellur",53:"I Jod",54:"Xe Xenon",55:"Cs Cesium",56:"Ba Barium",72:"Hf Hafnium",73:"Ta Tantal",74:"W Wolfram",75:"Re Rhenium",76:"Os Osmium",77:"Ir Iridium",78:"Pt Platina",79:"Au Gull",80:"Hg Kvikksølv",81:"Tl Thallium",82:"Pb Bly",83:"Bi Vismut",84:"Po Polonium",85:"At Astat",86:"Rn Radon",87:"Fr Francium",88:"Ra Radium",104:"Rf Rutherfordium",105:"Db Dubnium",106:"Sg Seaborgium",107:"Bh Bohrium",108:"Hs Hassium",109:"Mt Meitnerium",110:"Ds Darmstadtium",111:"Rg Røntgenium",112:"Cn Copernicium",113:"Nh Nihonium",114:"Fl Flerovium",115:"Mc Moscovium",116:"Lv Livermorium",117:"Ts Tenness",118:"Og Oganesson"};

function place(z) {
  if (z === 1) return [1, 1];
  if (z === 2) return [1, 18];
  const rows = [[3,10,2],[11,18,3]];
  for (const [a,b,p] of rows) if (z >= a && z <= b) { const i = z - a; return [p, i < 2 ? i + 1 : i + 11]; }
  if (z >= 19 && z <= 36) return [4, z - 18];
  if (z >= 37 && z <= 54) return [5, z - 36];
  if (z === 55 || z === 56) return [6, z - 54];
  if (z >= 72 && z <= 86) return [6, z - 68];
  if (z === 87 || z === 88) return [7, z - 86];
  if (z >= 104 && z <= 118) return [7, z - 100];
  return null;
}

const items = [];
for (const z in N) { const [s, name] = N[z].split(" "); const [p, g] = place(+z); items.push({ z: +z, s, name, p, g }); }
items.push({ ph: true, z: 57, s: "57–71", name: "Lantanoidene", p: 6, g: 3 });
items.push({ ph: true, z: 89, s: "89–103", name: "Aktinoidene", p: 7, g: 3 });

const table = document.getElementById("pg-table");
const info = document.getElementById("pg-info");
const cells = [];
const gLabs = [], pLabs = [];

// header row
const corner = document.createElement("div");
corner.className = "pg-corner";
corner.innerHTML = '<span class="pg-g"><b>Gruppe →</b></span>';
corner.style.gridRow = "1"; corner.style.gridColumn = "1";
table.appendChild(corner);
for (let g = 1; g <= 18; g++) {
  const b = document.createElement("button");
  b.type = "button"; b.className = "pg-lab pg-gl"; b.textContent = g; b.id = "g" + g;
  b.setAttribute("aria-label", "Vis gruppe " + g);
  b.style.gridRow = "1"; b.style.gridColumn = String(g + 1);
  b.addEventListener("click", () => show({ group: g }));
  table.appendChild(b); gLabs[g] = b;
}
const corner2 = document.createElement("div");
corner2.className = "pg-corner"; corner2.style.gridRow = "1"; corner2.style.gridColumn = "20";
corner2.innerHTML = '<span class="pg-p"><b>Periode ↓</b></span>';
table.appendChild(corner2);
for (let p = 1; p <= 7; p++) {
  for (const side of [1, 20]) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "pg-lab pg-pl"; b.textContent = p;
    b.setAttribute("aria-label", "Vis periode " + p);
    b.style.gridRow = String(p + 1); b.style.gridColumn = String(side);
    b.addEventListener("click", () => show({ period: p }));
    table.appendChild(b); (pLabs[p] = pLabs[p] || []).push(b);
  }
}
for (const it of items) {
  const c = document.createElement("button");
  c.type = "button"; c.className = "pg-cell" + (it.ph ? " pg-ph" : "");
  c.style.gridRow = String(it.p + 1); c.style.gridColumn = String(it.g + 1);
  c.innerHTML = it.ph ? '<span class="pg-s">' + it.s + '</span>' : '<span class="pg-z">' + it.z + '</span><span class="pg-s">' + it.s + '</span>';
  c.setAttribute("aria-label", it.ph ? it.name + ", periode " + it.p : it.name + ", periode " + it.p + ", gruppe " + it.g);
  c.addEventListener("click", () => show({ item: it }));
  table.appendChild(c); cells.push({ el: c, it });
}

function outer(it) {
  if (it.z === 1) return 1;
  if (it.z === 2) return 2;
  if (it.g === 1 || it.g === 2) return it.g;
  if (it.g >= 13) return it.g - 10;
  return null;
}

function shellSvg(it) {
  const n = it.p, oe = outer(it);
  const size = 250, c = size / 2, r0 = 22, step = (c - 30 - r0) / Math.max(n - 1, 1);
  let s = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" style="max-width:260px" role="img" aria-label="Skallmodell med ' + n + ' skall' + (oe ? ' og ' + oe + ' ytterelektron' + (oe > 1 ? 'er' : '') : '') + '">';
  for (let i = 1; i <= n; i++) {
    const r = r0 + (c - 14 - r0) * i / n;
    const last = i === n;
    s += '<circle cx="' + c + '" cy="' + c + '" r="' + r.toFixed(1) + '" fill="none" stroke="var(--' + (last ? 'periode' : 'brick-edge') + ')" stroke-width="' + (last ? 4 : 2.5) + '"/>';
    if (last && oe) {
      for (let k = 0; k < oe; k++) {
        const a = -Math.PI / 2 + k * 2 * Math.PI / oe;
        s += '<circle cx="' + (c + r * Math.cos(a)).toFixed(1) + '" cy="' + (c + r * Math.sin(a)).toFixed(1) + '" r="8" fill="var(--gruppe)" stroke="var(--surface)" stroke-width="2"/>';
      }
    }
  }
  s += '<circle cx="' + c + '" cy="' + c + '" r="' + (r0 - 4) + '" fill="var(--fg)"/>';
  s += '<text x="' + c + '" y="' + (c + 5) + '" text-anchor="middle" font-size="14" font-weight="800" fill="var(--bg)">' + it.s + '</text>';
  s += '</svg>';
  return s;
}

function show(opt) {
  let row = null, col = null, sel = null;
  if (opt.item) { row = opt.item.p; col = opt.item.ph ? null : opt.item.g; sel = opt.item; }
  if (opt.period) row = opt.period;
  if (opt.group) col = opt.group;
  table.classList.add("pg-dim");
  for (const { el, it } of cells) {
    el.classList.toggle("pg-inrow", row !== null && it.p === row);
    el.classList.toggle("pg-incol", col !== null && it.g === col && !it.ph);
    el.classList.toggle("pg-sel", sel !== null && it === sel && !it.ph);
    el.setAttribute("aria-pressed", sel === it ? "true" : "false");
  }
  for (let g = 1; g <= 18; g++) gLabs[g].classList.toggle("pg-on", g === col);
  for (let p = 1; p <= 7; p++) pLabs[p].forEach(b => b.classList.toggle("pg-on", p === row));
  render(opt, row, col, sel);
}

function render(opt, row, col, sel) {
  if (sel && !sel.ph) {
    const oe = outer(sel);
    const gText = sel.z === 2
      ? '<p>Gruppa står loddrett, nedover. Helium har <b>2 ytterelektroner</b>. De andre klossene i den blå kolonnen har 8.</p>'
      : oe
      ? '<p>Gruppa står loddrett, nedover. Alle klossene i den blå kolonnen har <b>' + oe + ' ytterelektron' + (oe > 1 ? 'er' : '') + '</b>' + (sel.g === 18 ? ' (helium har 2)' : '') + '.</p>'
      : '<p>Gruppa står loddrett, nedover. Gruppe 3 til 12 er innskuddsmetaller. De har ofte 1 eller 2 ytterelektroner, men antallet kan ikke leses av gruppenummeret. Derfor tegner vi dem ikke her.</p>';
    const gHead = sel.z === 2 ? ' → helium har 2 ytterelektroner' : oe ? ' → ' + oe + ' ytterelektron' + (oe > 1 ? 'er' : '') : '';
    info.innerHTML =
      '<div><p class="pg-eyebrow">Atomnummer ' + sel.z + '</p><h3>' + sel.name + ' (' + sel.s + ')</h3>' +
      '<div class="pg-facts">' +
        '<div class="pg-fact pg-fp"><b class="pg-p">Periode ' + sel.p + ' → ' + sel.p + ' skall</b><p>Perioden ligger vannrett, bortover. Alle klossene i den oransje raden har elektroner i <b>' + sel.p + ' skall</b>.</p></div>' +
        '<div class="pg-fact pg-fg"><b class="pg-g">Gruppe ' + sel.g + gHead + '</b>' + gText + '</div>' +
      '</div></div>' +
      '<div>' + shellSvg(sel) + '<p class="pg-note" style="text-align:center;margin-top:4px">' + sel.p + (sel.p > 1 ? ' ringer' : ' ring') + ' = periode ' + sel.p + (oe ? '<br>' + oe + (oe > 1 ? ' blå prikker' : ' blå prikk') + ' ytterst = ' + (sel.z === 2 ? 'helium' : 'gruppe ' + sel.g) : '') + '</p></div>';
    return;
  }
  if (sel && sel.ph) {
    info.innerHTML = '<div><p class="pg-eyebrow">Atomnummer ' + sel.s + '</p><h3>' + sel.name + '</h3><div class="pg-facts"><div class="pg-fact pg-fp"><b class="pg-p">Periode ' + sel.p + ' → ' + sel.p + ' skall</b><p>Disse grunnstoffene hører til periode ' + sel.p + '. I vanlige periodesystemer står de i en egen rad under tabellen, så den ikke blir for bred. Her er de samlet i én kloss.</p></div></div></div><div></div>';
    return;
  }
  if (row) {
    info.innerHTML = '<div><p class="pg-eyebrow">Rad bortover</p><h3 class="pg-p">Periode ' + row + '</h3><div class="pg-facts"><div class="pg-fact pg-fp"><b class="pg-p">Alle har ' + row + ' skall</b><p>Klossene i den oransje raden ligger ved siden av hverandre, fra venstre mot høyre. Atomnummeret øker med 1 for hver kloss bortover.' + (row === 6 ? ' Unntaket er klossen 57–71, der lantanoidene er samlet. Der hopper atomnummeret fra 56 til 72.' : row === 7 ? ' Unntaket er klossen 89–103, der aktinoidene er samlet. Der hopper atomnummeret fra 88 til 104.' : '') + '</p></div></div></div><div></div>';
    return;
  }
  if (col) {
    const ex = col === 18 ? 'Edelgassene. De har fullt ytterste skall, 8 ytterelektroner (helium har 2).'
      : col >= 13 ? 'Alle har ' + (col - 10) + ' ytterelektroner. Bakerste siffer i gruppenummeret gir svaret.'
      : col <= 2 ? 'Alle har ' + col + ' ytterelektron' + (col > 1 ? 'er' : '') + '.'
      : 'Innskuddsmetaller. De har ofte 1 eller 2 ytterelektroner.';
    const why = col >= 3 && col <= 12
      ? 'De er alle metaller.'
      : 'Grunnstoffer i samme gruppe har like mange ytterelektroner, og derfor ligner de ofte hverandre i egenskaper.' + (col === 1 ? ' Hydrogen er et unntak: det er en gass og ikke et metall.' : '');
    info.innerHTML = '<div><p class="pg-eyebrow">Kolonne nedover</p><h3 class="pg-g">Gruppe ' + col + '</h3><div class="pg-facts"><div class="pg-fact pg-fg"><b class="pg-g">' + ex + '</b><p>Klossene i den blå kolonnen står oppå hverandre, fra toppen mot bunnen. ' + why + '</p></div></div></div><div></div>';
  }
}

root.querySelectorAll(".pg-chip").forEach(b => b.addEventListener("click", () => {
  const z = +b.dataset.z; const hit = cells.find(c => c.it.z === z && !c.it.ph); if (hit) show({ item: hit.it });
}));
show({ item: cells.find(c => c.it.z === 11).it });
})();
