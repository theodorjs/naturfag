/* Periode eller gruppe? Bygger periodesystemet som klosser inne i #periode-og-gruppe. Ingen avhengigheter. */
(function () {
const root = document.getElementById("periode-og-gruppe");
if (!root) return;
const N = {1:"H Hydrogen",2:"He Helium",3:"Li Litium",4:"Be Beryllium",5:"B Bor",6:"C Karbon",7:"N Nitrogen",8:"O Oksygen",9:"F Fluor",10:"Ne Neon",11:"Na Natrium",12:"Mg Magnesium",13:"Al Aluminium",14:"Si Silisium",15:"P Fosfor",16:"S Svovel",17:"Cl Klor",18:"Ar Argon",19:"K Kalium",20:"Ca Kalsium",21:"Sc Scandium",22:"Ti Titan",23:"V Vanadium",24:"Cr Krom",25:"Mn Mangan",26:"Fe Jern",27:"Co Kobolt",28:"Ni Nikkel",29:"Cu Kobber",30:"Zn Sink",31:"Ga Gallium",32:"Ge Germanium",33:"As Arsen",34:"Se Selen",35:"Br Brom",36:"Kr Krypton",37:"Rb Rubidium",38:"Sr Strontium",39:"Y Yttrium",40:"Zr Zirkonium",41:"Nb Niob",42:"Mo Molybden",43:"Tc Technetium",44:"Ru Ruthenium",45:"Rh Rhodium",46:"Pd Palladium",47:"Ag Sølv",48:"Cd Kadmium",49:"In Indium",50:"Sn Tinn",51:"Sb Antimon",52:"Te Tellur",53:"I Jod",54:"Xe Xenon",55:"Cs Cesium",56:"Ba Barium",72:"Hf Hafnium",73:"Ta Tantal",74:"W Wolfram",75:"Re Rhenium",76:"Os Osmium",77:"Ir Iridium",78:"Pt Platina",79:"Au Gull",80:"Hg Kvikksølv",81:"Tl Thallium",82:"Pb Bly",83:"Bi Vismut",84:"Po Polonium",85:"At Astat",86:"Rn Radon",87:"Fr Francium",88:"Ra Radium",104:"Rf Rutherfordium",105:"Db Dubnium",106:"Sg Seaborgium",107:"Bh Bohrium",108:"Hs Hassium",109:"Mt Meitnerium",110:"Ds Darmstadtium",111:"Rg Røntgenium",112:"Cn Copernicium",113:"Nh Nihonium",114:"Fl Flerovium",115:"Mc Moscovium",116:"Lv Livermorium",117:"Ts Tenness",118:"Og Oganesson"};

// Elektroner per skall (n = 1, 2, 3 ...) i grunntilstanden.
// Kilder: NIST Atomic Spectra Database (1 til 108) og PubChem (109 til 118), kontrollert mot periodesystemet.no.
// 104 til 118 er beregnet, ikke målt. For 110 og 111 oppgir periodesystemet.no 1 elektron i ytterste skall, NIST-tabeller og PubChem 2.
const E = {1:"1",2:"2",3:"2,1",4:"2,2",5:"2,3",6:"2,4",7:"2,5",8:"2,6",9:"2,7",10:"2,8",11:"2,8,1",12:"2,8,2",13:"2,8,3",14:"2,8,4",15:"2,8,5",16:"2,8,6",17:"2,8,7",18:"2,8,8",19:"2,8,8,1",20:"2,8,8,2",21:"2,8,9,2",22:"2,8,10,2",23:"2,8,11,2",24:"2,8,13,1",25:"2,8,13,2",26:"2,8,14,2",27:"2,8,15,2",28:"2,8,16,2",29:"2,8,18,1",30:"2,8,18,2",31:"2,8,18,3",32:"2,8,18,4",33:"2,8,18,5",34:"2,8,18,6",35:"2,8,18,7",36:"2,8,18,8",37:"2,8,18,8,1",38:"2,8,18,8,2",39:"2,8,18,9,2",40:"2,8,18,10,2",41:"2,8,18,12,1",42:"2,8,18,13,1",43:"2,8,18,13,2",44:"2,8,18,15,1",45:"2,8,18,16,1",46:"2,8,18,18",47:"2,8,18,18,1",48:"2,8,18,18,2",49:"2,8,18,18,3",50:"2,8,18,18,4",51:"2,8,18,18,5",52:"2,8,18,18,6",53:"2,8,18,18,7",54:"2,8,18,18,8",55:"2,8,18,18,8,1",56:"2,8,18,18,8,2",72:"2,8,18,32,10,2",73:"2,8,18,32,11,2",74:"2,8,18,32,12,2",75:"2,8,18,32,13,2",76:"2,8,18,32,14,2",77:"2,8,18,32,15,2",78:"2,8,18,32,17,1",79:"2,8,18,32,18,1",80:"2,8,18,32,18,2",81:"2,8,18,32,18,3",82:"2,8,18,32,18,4",83:"2,8,18,32,18,5",84:"2,8,18,32,18,6",85:"2,8,18,32,18,7",86:"2,8,18,32,18,8",87:"2,8,18,32,18,8,1",88:"2,8,18,32,18,8,2",104:"2,8,18,32,32,10,2",105:"2,8,18,32,32,11,2",106:"2,8,18,32,32,12,2",107:"2,8,18,32,32,13,2",108:"2,8,18,32,32,14,2",109:"2,8,18,32,32,15,2",110:"2,8,18,32,32,16,2",111:"2,8,18,32,32,17,2",112:"2,8,18,32,32,18,2",113:"2,8,18,32,32,18,3",114:"2,8,18,32,32,18,4",115:"2,8,18,32,32,18,5",116:"2,8,18,32,32,18,6",117:"2,8,18,32,32,18,7",118:"2,8,18,32,32,18,8"};

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
  const brk = !it.ph && (breaksOuter(it) || breaksShells(it));
  if (brk) c.classList.add("pg-x");
  const brkText = !brk ? "" : breaksOuter(it) && breaksShells(it) ? ", følger ikke reglene for antall skall og ytterelektroner" : breaksShells(it) ? ", følger ikke regelen for antall skall" : ", følger ikke regelen for ytterelektroner";
  c.setAttribute("aria-label", it.ph ? it.name + ", periode " + it.p : it.name + ", periode " + it.p + ", gruppe " + it.g + brkText);
  c.addEventListener("click", () => show({ item: it }));
  table.appendChild(c); cells.push({ el: c, it });
}

function shells(it) { return E[it.z].split(",").map(Number); }
function outer(it) { const sh = shells(it); return sh[sh.length - 1]; }
// Regelen elevene lærer: gruppe 1 og 2 = nummeret, gruppe 13 til 18 = bakerste siffer. Gruppe 3 til 12 har ingen regel.
function ruleOuter(it) { return it.g <= 2 ? it.g : it.g >= 13 ? it.g - 10 : null; }
function breaksOuter(it) { return !it.ph && ruleOuter(it) !== outer(it); }
function breaksShells(it) { return !it.ph && shells(it).length !== it.p; }
function predicted(it) { return it.z >= 104; }
function ytter(n) { return n + ' ytterelektron' + (n === 1 ? '' : 'er'); }
const ORD = ["", "første", "andre", "tredje", "fjerde", "femte", "sjette", "sjuende"];
function list(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " og " + a[a.length - 1]; }
function lc(it) { return it.name.toLowerCase(); }
function els() { return items.filter(it => !it.ph); }
function xBox(title, text) { return '<div class="pg-fact pg-fx"><b class="pg-x-t">' + title + '</b><p>' + text + '</p></div>'; }
function shellsText(it) { return it.name + ' står i periode ' + it.p + ', men har elektroner i bare ' + shells(it).length + ' skall. Det ' + ORD[it.p] + ' skallet er tomt.'; }
function outerText(it) {
  const r = ruleOuter(it);
  return r === null
    ? 'Regelen gjelder bare gruppe 1, 2 og 13 til 18. ' + it.name + ' står i gruppe ' + it.g + (predicted(it) ? ', blant innskuddsmetallene' : ' og er et innskuddsmetall') + '. Der kan antallet ytterelektroner ikke leses av gruppenummeret.'
    : it.name + ' står i gruppe ' + it.g + ', men har ' + ytter(outer(it)) + ', ikke ' + r + '.' + (it.z === 2 ? ' Det første skallet har bare plass til 2.' : '');
}
function predNote(list_) { return list_.length ? '<p class="pg-note">For ' + list(list_.map(lc)) + ' er dette beregnet, ikke målt.</p>' : ''; }

function shellSvg(it) {
  const sh = shells(it), n = sh.length, oe = sh[n - 1];
  const size = 250, c = size / 2, r0 = 22;
  let s = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" style="max-width:260px" role="img" aria-label="Skallmodell med ' + n + ' skall. Elektroner per skall: ' + sh.join(", ") + '.">';
  for (let i = 1; i <= n; i++) {
    const r = r0 + (c - 14 - r0) * i / n;
    const last = i === n, k = sh[i - 1];
    s += '<circle cx="' + c + '" cy="' + c + '" r="' + r.toFixed(1) + '" fill="none" stroke="var(--' + (last ? 'periode' : 'brick-edge') + ')" stroke-width="' + (last ? 4 : 2.5) + '"/>';
    const dot = last ? (k > 8 ? 5.5 : 8) : (k > 18 ? 2.6 : 3.2);
    for (let e = 0; e < k; e++) {
      const a = -Math.PI / 2 + (e + (last ? 0 : (i % 2) * 0.5)) * 2 * Math.PI / k;
      const x = (c + r * Math.cos(a)).toFixed(1), y = (c + r * Math.sin(a)).toFixed(1);
      s += last
        ? '<circle cx="' + x + '" cy="' + y + '" r="' + dot + '" fill="var(--gruppe)" stroke="var(--surface)" stroke-width="2"/>'
        : '<circle cx="' + x + '" cy="' + y + '" r="' + dot + '" fill="var(--muted)" opacity=".55"/>';
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
    const sh = shells(sel), n = sh.length, oe = sh[n - 1];
    const bo = breaksOuter(sel), bs = breaksShells(sel), pred = predicted(sel);
    const rowX = els().filter(it => it.p === sel.p && it !== sel && breaksShells(it));
    const rowPred = pred ? [] : els().filter(it => it.p === sel.p && predicted(it));
    const colX = els().filter(it => it.g === sel.g && it !== sel && breaksOuter(it));
    const colPred = pred ? [] : els().filter(it => it.g === sel.g && predicted(it));
    const pText = bs
      ? 'Perioden ligger vannrett, bortover. De andre klossene i den oransje raden har elektroner i <b>' + sel.p + ' skall</b>.'
      : 'Perioden ligger vannrett, bortover. Alle klossene i den oransje raden' + (rowX.length ? ' unntatt ' + list(rowX.map(lc)) : '') + ' har elektroner i <b>' + sel.p + ' skall</b>.' +
        (rowPred.length ? ' For grunnstoffene med atomnummer 104 til 118 er dette beregnet, ikke målt.' : '');
    const gText = bs
      ? 'Gruppa står loddrett, nedover. ' + sel.name + ' har <b>' + oe + ' elektroner</b> i det ytterste skallet.'
      : bo
      ? 'Gruppa står loddrett, nedover. ' + sel.name + ' har <b>' + ytter(oe) + '</b>.' + (ruleOuter(sel) !== null ? ' De andre klossene i den blå kolonnen har ' + ruleOuter(sel) + '.' : '')
      : 'Gruppa står loddrett, nedover. Alle klossene i den blå kolonnen' + (colX.length ? ' unntatt ' + list(colX.map(lc)) : '') + ' har <b>' + ytter(oe) + '</b>.' +
        colX.map(it => ' ' + it.name + ' har ' + outer(it) + '.').join('') +
        (colPred.length ? ' For ' + list(colPred.map(lc)) + ' er det beregnet, ikke målt.' : '');
    let x = '';
    if (bs) x += xBox('Følger ikke regelen for antall skall', shellsText(sel));
    if (bo) x += xBox('Følger ikke regelen for ytterelektroner', outerText(sel));
    const cap = 'Elektroner per skall: ' + sh.join(", ") +
      '<br>' + (bs ? n + ' ringer, men periode ' + sel.p : n + (n > 1 ? ' ringer' : ' ring') + ' = periode ' + sel.p) +
      '<br>' + oe + (oe > 1 ? ' blå prikker' : ' blå prikk') + ' ytterst' + (bo || bs ? '' : sel.g <= 2 ? ' = gruppe ' + sel.g : ' = bakerste siffer i gruppe ' + sel.g);
    info.innerHTML =
      '<div><p class="pg-eyebrow">Atomnummer ' + sel.z + '</p><h3>' + sel.name + ' (' + sel.s + ')</h3>' +
      '<div class="pg-facts">' +
        '<div class="pg-fact pg-fp"><b class="pg-p">Periode ' + sel.p + (bs ? '' : ' → ' + sel.p + ' skall') + '</b><p>' + pText + '</p></div>' +
        '<div class="pg-fact pg-fg"><b class="pg-g">Gruppe ' + sel.g + (bo || bs ? '' : ' → ' + ytter(oe)) + '</b><p>' + gText + '</p></div>' +
        x +
      '</div>' +
      (pred ? '<p class="pg-note">Elektronfordelingen for ' + lc(sel) + ' er beregnet, ikke målt. Grunnstoffet er laget i laboratorier, bare noen få atomer om gangen.' +
        (sel.z === 110 || sel.z === 111 ? ' Ulike kilder gir ulike tall for det ytterste skallet. Her bruker vi tallene fra PubChem.' : '') + '</p>' : '') +
      '</div>' +
      '<div>' + shellSvg(sel) + '<p class="pg-note" style="text-align:center;margin-top:4px">' + cap + '</p></div>';
    return;
  }
  if (sel && sel.ph) {
    info.innerHTML = '<div><p class="pg-eyebrow">Atomnummer ' + sel.s + '</p><h3>' + sel.name + '</h3><div class="pg-facts"><div class="pg-fact pg-fp"><b class="pg-p">Periode ' + sel.p + ' → ' + sel.p + ' skall</b><p>Disse grunnstoffene hører til periode ' + sel.p + '. I vanlige periodesystemer står de i en egen rad under tabellen, så den ikke blir for bred. Her er de samlet i én kloss.</p></div></div></div><div></div>';
    return;
  }
  if (row) {
    const rx = els().filter(it => it.p === row && breaksShells(it));
    const ox = els().filter(it => it.p === row && breaksOuter(it) && !breaksShells(it));
    const rp = els().filter(it => it.p === row && predicted(it));
    let x = rx.map(it => xBox(it.name + ' følger ikke regelen for antall skall', shellsText(it))).join('');
    if (ox.length === 1) x += xBox('Lilla stripe: følger ikke regelen for ytterelektroner', ox[0].name + ' har lilla stripe fordi det ikke følger regelen for ytterelektroner. Regelen for antall skall følger det.');
    else if (ox.length > 1) x += xBox('Lilla stripe: følger ikke regelen for ytterelektroner', 'Klossene i gruppe 3 til 12 har lilla stripe fordi de ikke følger regelen for ytterelektroner.' + (rx.length ? '' : ' Regelen for antall skall følger de.'));
    info.innerHTML = '<div><p class="pg-eyebrow">Rad bortover</p><h3 class="pg-p">Periode ' + row + '</h3><div class="pg-facts"><div class="pg-fact pg-fp"><b class="pg-p">Alle' + (rx.length ? ' unntatt ' + list(rx.map(lc)) : '') + ' har ' + row + ' skall</b><p>Klossene i den oransje raden ligger ved siden av hverandre, fra venstre mot høyre. Atomnummeret øker med 1 for hver kloss bortover.' +
      (row === 6 ? ' Unntaket er klossen 57–71, der lantanoidene er samlet. Der hopper atomnummeret fra 56 til 72.' : row === 7 ? ' Unntaket er klossen 89–103, der aktinoidene er samlet. Der hopper atomnummeret fra 88 til 104.' : '') +
      (rp.length ? ' For grunnstoffene med atomnummer 104 til 118 er antallet skall beregnet, ikke målt.' : '') +
      '</p></div>' + x + '</div></div><div></div>';
    return;
  }
  if (col) {
    const ox = els().filter(it => it.g === col && breaksOuter(it) && ruleOuter(it) !== null);
    const sx = els().filter(it => it.g === col && breaksShells(it));
    const cp = els().filter(it => it.g === col && predicted(it));
    const ex = col === 18 ? 'Edelgassene. Alle unntatt helium har 8 ytterelektroner. Helium har 2.'
      : col >= 13 ? 'Alle har ' + (col - 10) + ' ytterelektroner. Bakerste siffer i gruppenummeret gir svaret.'
      : col <= 2 ? 'Alle har ' + ytter(col) + '.'
      : 'Innskuddsmetaller. De har ofte 1 eller 2 ytterelektroner.';
    const why = col === 12
      ? 'Sink, kadmium og kvikksølv er metaller. Om copernicium er et metall, vet vi ikke sikkert.'
      : col >= 3 && col <= 12
      ? 'De er metaller.'
      : col === 18
      ? 'Alle unntatt helium har like mange ytterelektroner. Edelgassene ligner hverandre i egenskaper: de reagerer nesten ikke med andre stoffer.'
      : 'Grunnstoffer i samme gruppe har like mange ytterelektroner, og derfor ligner de ofte hverandre i egenskaper.' + (col === 1 ? ' Hydrogen skiller seg ut: det er en gass og ikke et metall.' : '');
    let x = '';
    if (col >= 3 && col <= 12) x += xBox('Følger ikke regelen for ytterelektroner', 'Regelen gjelder bare gruppe 1, 2 og 13 til 18. I gruppe 3 til 12 kan antallet ytterelektroner ikke leses av gruppenummeret.');
    x += ox.map(it => xBox(it.name + ' følger ikke regelen for ytterelektroner', outerText(it))).join('');
    x += sx.map(it => xBox(it.name + ' følger heller ikke regelen for antall skall', shellsText(it))).join('');
    info.innerHTML = '<div><p class="pg-eyebrow">Kolonne nedover</p><h3 class="pg-g">Gruppe ' + col + '</h3><div class="pg-facts"><div class="pg-fact pg-fg"><b class="pg-g">' + ex + '</b><p>Klossene i den blå kolonnen står oppå hverandre, fra toppen mot bunnen. ' + why + '</p></div>' + x + '</div>' + predNote(cp) + '</div><div></div>';
  }
}

root.querySelectorAll(".pg-chip").forEach(b => b.addEventListener("click", () => {
  const z = +b.dataset.z; const hit = cells.find(c => c.it.z === z && !c.it.ph); if (hit) show({ item: hit.it });
}));
show({ item: cells.find(c => c.it.z === 11).it });
})();
