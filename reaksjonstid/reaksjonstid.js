(function(){
  const DURATION = 120000, FEEDBACK_MS = 1000, MIN_DELAY = 1500, MAX_DELAY = 4000;
  const STORE = 'sovn-reaksjonstest-v2', OLD_STORE = 'sovn-reaksjonstest-v1';
  const $ = id => document.getElementById(id);
  const field = $('field'), big = $('bigText'), sub = $('subText');

  let state = 'idle', trials = [], earlies = [], timer = null, tick = null;
  let goAt = 0, runStart = 0, endAt = 0, last = null, lastBlob = null, wakeLock = null;


  // ---------- helpers ----------
  const pad = n => String(n).padStart(2,'0');
  const today = () => { const d = new Date(); return pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.'+d.getFullYear(); };
  const dec = n => (Math.round(n*100)/100).toString().replace('.', ',');
  const median = a => { const s=[...a].sort((x,y)=>x-y), m=s.length>>1; return s.length%2 ? s[m] : (s[m-1]+s[m])/2; };
  const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const parseNum = v => { const t = String(v).trim().replace(',', '.'); if (!/^\d+(\.\d+)?$/.test(t)) return NaN; return Number(t); };
  const tokens = () => { const cs = getComputedStyle(document.documentElement); const g = n => cs.getPropertyValue(n).trim(); return {fg:g('--fg'), muted:g('--muted'), line:g('--line'), accent:g('--accent'), early:g('--early'), bg:g('--surface')}; };
  const fmtClock = ms => { const s = Math.max(0, Math.ceil(ms/1000)); return Math.floor(s/60)+':'+pad(s%60); };

  $('dateBox').textContent = today();

  // ---------- info panel + converter ----------
  $('infoBtn').addEventListener('click', () => {
    const open = $('infoPanel').hidden; $('infoPanel').hidden = !open; $('infoBtn').setAttribute('aria-expanded', String(open));
  });
  function conv(){
    const h = parseNum($('convH').value || '0'), m = parseNum($('convM').value || '0');
    const ok = !isNaN(h) && !isNaN(m) && m < 60 && ($('convH').value || $('convM').value);
    $('convOut').textContent = ok ? dec(h + m/60) : '?';
    $('convUse').disabled = !ok;
    return ok ? Math.round((h + m/60)*100)/100 : null;
  }
  $('convH').addEventListener('input', conv); $('convM').addEventListener('input', conv);
  $('convUse').addEventListener('click', () => { const v = conv(); if (v !== null){ $('sleep').value = dec(v); validate(false); } });

  // ---------- validation ----------
  function readSetup(){
    const name = $('name').value.trim();
    const sleep = parseNum($('sleep').value);
    const alertEl = document.querySelector('input[name=alert]:checked');
    return { name, sleep, alert: alertEl ? Number(alertEl.value) : null };
  }
  function validate(show){
    const s = readSetup();
    const okName = s.name.length > 0, okSleep = !isNaN(s.sleep) && s.sleep >= 0 && s.sleep <= 16, okAlert = s.alert !== null;
    if (show || $('g-name').classList.contains('invalid')) mark('name', okName);
    if (show || $('g-sleep').classList.contains('invalid')) mark('sleep', okSleep);
    if (show || $('g-alert').classList.contains('invalid')) mark('alert', okAlert);
    return okName && okSleep && okAlert;
  }
  function mark(k, ok){ $('g-'+k).classList.toggle('invalid', !ok); $('e-'+k).hidden = ok; }
  ['name','sleep'].forEach(id => $(id).addEventListener('input', () => validate(false)));
  document.querySelectorAll('input[name=alert]').forEach(r => r.addEventListener('change', () => validate(false)));
  try { const n = localStorage.getItem(STORE+'-navn'); if (n) $('name').value = n; } catch(e){}
  $('name').addEventListener('change', () => { try { localStorage.setItem(STORE+'-navn', $('name').value.trim()); } catch(e){} });

  // ---------- test ----------
  function setView(s, title, text, isMs){
    state = s; field.dataset.state = s; big.textContent = title; sub.textContent = text || ''; big.classList.toggle('ms', !!isMs);
  }
  function tryStart(){
    if (!validate(true)){
      setView('idle', 'Trykk for å starte', 'Du må fylle inn navn, søvn og hvor opplagt du er først');
      const firstBad = document.querySelector('.invalid input'); if (firstBad) firstBad.focus();
      return;
    }
    start();
  }
  function start(){
    trials = []; earlies = []; last = null; lastBlob = null; $('resultCard').hidden = true;
    field.classList.add('running'); $('topbar').hidden = false; $('timebar').hidden = false;
    document.activeElement && document.activeElement.blur && document.activeElement.blur();
    field.focus({preventScroll:true});
    // Ikke vent på Wake Lock: state må bli 'wait' med en gang, ellers kan et dobbelttrykk starte testen to ganger.
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { if (field.classList.contains('running')) wakeLock = l; else l.release(); }).catch(() => {}); } catch(e){}
    runStart = performance.now(); endAt = runStart + DURATION;
    tick = setInterval(updateClock, 200); updateClock();
    nextTrial();
  }
  function updateClock(){
    const left = endAt - performance.now();
    $('clock').textContent = fmtClock(left);
    $('timebar').style.width = Math.min(100, 100 * (1 - left/DURATION)) + '%';
  }
  function nextTrial(){
    const now = performance.now(), remaining = endAt - now;
    if (remaining <= 0){ finish(); return; }
    setView('wait', 'Vent …', 'Trykk når skjermen blir grønn');
    const delay = MIN_DELAY + Math.random()*(MAX_DELAY - MIN_DELAY);
    if (delay >= remaining){ timer = setTimeout(finish, remaining); return; }
    timer = setTimeout(() => {
      setView('go', 'TRYKK!', '');
      goAt = performance.now();
      requestAnimationFrame(() => { goAt = performance.now(); });
    }, delay);
  }
  function press(stamp){
    const now = (stamp && stamp > 0 && Math.abs(stamp - performance.now()) < 1000) ? stamp : performance.now();
    if (state === 'idle' || state === 'result'){ tryStart(); return; }
    if (state === 'wait'){
      clearTimeout(timer); earlies.push((now - runStart)/1000);
      setView('early', 'For tidlig!', 'Neste runde starter straks');
      timer = setTimeout(nextTrial, FEEDBACK_MS); return;
    }
    if (state === 'go'){
      const ms = Math.max(1, Math.round(now - goAt));
      trials.push({t:(goAt - runStart)/1000, ms});
      setView('feedback', ms + ' ms', 'Trykk nummer ' + trials.length, true);
      timer = setTimeout(nextTrial, FEEDBACK_MS); return;
    }
    // feedback / early: ignore taps
  }
  function stopRun(){
    clearTimeout(timer); clearInterval(tick);
    field.classList.remove('running'); $('topbar').hidden = true; $('timebar').hidden = true;
    try { if (wakeLock) wakeLock.release(); } catch(e){} wakeLock = null;
  }
  function abort(msg){
    stopRun(); setView('idle', 'Testen ble avbrutt', msg || 'Trykk for å starte på nytt');
  }
  function finish(){
    stopRun();
    if (trials.length === 0){ setView('idle', 'Ingen trykk registrert', 'Trykk for å prøve igjen'); return; }
    const s = readSetup(), ms = trials.map(x=>x.ms);
    const r = {
      navn: s.name, dato: today(), sovn: s.sleep, opplagt: s.alert,
      median: Math.round(median(ms)), snitt: Math.round(ms.reduce((a,b)=>a+b,0)/ms.length),
      raskest: Math.min(...ms), tregest: Math.max(...ms), tidlig: earlies.length,
      antall: ms.length, trials: trials.slice(), earlies: earlies.slice()
    };
    r.bredde = r.tregest - r.raskest;
    last = r;
    setView('result', 'Ferdig!', 'Se resultatet under. Trykk her for å ta testen på nytt.');
    showResult(r); saveRun(r); renderLog();
    $('resultCard').scrollIntoView({behavior:'smooth', block:'start'});
    buildImage(r).then(b => { lastBlob = b; }).catch(()=>{});
  }

  field.addEventListener('pointerdown', e => {
    if (e.target.closest('#abortBtn')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault(); press(e.timeStamp);
  });
  field.addEventListener('keydown', e => { if (e.target.closest('#abortBtn')) return; if ((e.code === 'Space' || e.key === 'Enter') && !e.repeat){ e.preventDefault(); press(e.timeStamp); } });
  $('abortBtn').addEventListener('click', e => { e.stopPropagation(); abort(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && field.classList.contains('running')) abort('Testen stopper hvis du forlater appen. Trykk for å starte på nytt.'); });

  // ---------- results ----------
  const STAT_DEFS = r => [
    [r.median+' ms','Median'],[r.snitt+' ms','Gjennomsnitt'],[r.raskest+' ms','Raskest'],
    [r.tregest+' ms','Tregest'],[r.bredde+' ms','Variasjonsbredde'],[String(r.tidlig),'For tidlige trykk']
  ];
  function showResult(r){
    $('resMeta').innerHTML = '<span><b>'+esc(r.navn)+'</b></span><span>'+r.dato+'</span><span>Søvn i natt: <b>'+dec(r.sovn)+' t</b></span><span>Opplagthet: <b>'+r.opplagt+' av 5</b></span>'+(r.antall!=null?'<span>Antall trykk: <b>'+r.antall+'</b></span>':'');
    $('stats').innerHTML = STAT_DEFS(r).map(([v,l])=>'<div class="stat"><b>'+v+'</b><span>'+l+'</span></div>').join('');
    const hasChart = !!(r.trials && r.trials.length);
    $('noChart').hidden = hasChart; $('chart').parentElement.hidden = !hasChart;
    $('resultCard').hidden = false; $('toast').textContent = '';
    if (hasChart) drawPageChart();
  }

  function drawChart(ctx, x, y, w, h, r, c, f){
    const pts = r.trials || []; if (!pts.length) return;
    r = Object.assign({earlies: []}, r);
    const msVals = pts.map(p=>p.ms);
    let lo = Math.min(...msVals), hi = Math.max(...msVals);
    const range = Math.max(hi - lo, 100);
    const step = range > 600 ? ([200,500,1000,2000,5000,10000].find(s => range/s <= 8) || 10000) : range > 250 ? 100 : 50;
    lo = Math.max(0, Math.floor((lo - step*0.3)/step)*step);
    hi = Math.ceil((hi + step*0.3)/step)*step;
    const padL = f.s*58, padB = f.s*40, padT = f.s*14, padR = f.s*14;
    const px = x + padL, py = y + padT, pw = w - padL - padR, ph = h - padT - padB;
    const X = t => px + (Math.min(t,120)/120)*pw;
    const Y = v => py + ph - ((v - lo)/(hi - lo))*ph;
    ctx.save();
    ctx.font = (f.s*12)+'px '+f.mono; ctx.fillStyle = c.muted; ctx.strokeStyle = c.line; ctx.lineWidth = Math.max(1, f.s*1);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let v = lo; v <= hi + 0.1; v += step){
      ctx.beginPath(); ctx.moveTo(px, Y(v)); ctx.lineTo(px+pw, Y(v)); ctx.stroke();
      ctx.fillText(String(v), px - f.s*8, Y(v));
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let t = 0; t <= 120; t += 30){ ctx.fillText(Math.floor(t/60)+':'+pad(t%60), X(t), py+ph+f.s*8); }
    ctx.save(); ctx.translate(x + f.s*12, py + ph/2); ctx.rotate(-Math.PI/2); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('ms', 0, 0); ctx.restore();
    // median line
    const my = Y(r.median);
    ctx.setLineDash([f.s*6, f.s*5]); ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.moveTo(px, my); ctx.lineTo(px+pw, my); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillStyle = c.muted; ctx.fillText('median '+r.median, px+pw, my - f.s*3);
    // early presses
    ctx.strokeStyle = c.early; ctx.lineWidth = f.s*2;
    r.earlies.forEach(t => { const ex = X(t), ey = py+ph; const d = f.s*4; ctx.beginPath(); ctx.moveTo(ex-d, ey-d); ctx.lineTo(ex+d, ey+d); ctx.moveTo(ex+d, ey-d); ctx.lineTo(ex-d, ey+d); ctx.stroke(); });
    // line
    ctx.strokeStyle = c.accent; ctx.lineWidth = f.s*2.2; ctx.lineJoin = 'round';
    ctx.beginPath(); pts.forEach((p,i) => { i ? ctx.lineTo(X(p.t), Y(p.ms)) : ctx.moveTo(X(p.t), Y(p.ms)); }); ctx.stroke();
    ctx.fillStyle = c.accent;
    pts.forEach(p => { ctx.beginPath(); ctx.arc(X(p.t), Y(p.ms), f.s*3.2, 0, Math.PI*2); ctx.fill(); });
    ctx.restore();
    return {legendY: y + h};
  }
  function drawPageChart(){
    if (!last) return;
    const cv = $('chart'), dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth, h = Math.max(220, Math.min(340, w*0.45));
    cv.style.height = h+'px'; cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
    const t = tokens();
    drawChart(ctx, 0, 0, w, h, last, t, {s:1, mono:'"JetBrains Mono", ui-monospace, monospace'});
  }
  window.addEventListener('resize', () => { if (!$('resultCard').hidden) drawPageChart(); });
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', drawPageChart); } catch(e){}

  // ---------- export image ----------
  async function buildImage(r){
    try { await document.fonts.ready; } catch(e){}
    const W = 1240, H = 1754, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const c = {fg:'#172033', muted:'#5a6478', line:'#d5dbe6', accent:'#3a4bb8', early:'#c2410c', chip:'#eef1f6'};
    const disp = '"Bricolage Grotesque", "Segoe UI", system-ui, sans-serif', body = '"Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif', mono = '"JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#2b3550'; ctx.fillRect(0,0,W,250);
    ctx.fillStyle = '#c9d1e8'; ctx.font = '700 26px '+body; ctx.textBaseline = 'alphabetic';
    ctx.fillText('TVERRFAGLIG MÅNED · SØVN', 80, 92);
    ctx.fillStyle = '#ffffff'; ctx.font = '800 72px '+disp; ctx.fillText('Søvn og reaksjonstid', 80, 180);
    let name = r.navn; ctx.font = '800 54px '+disp;
    while (ctx.measureText(name).width > W-160 && name.length > 3) name = name.slice(0,-2);
    if (name !== r.navn) name = name.trim() + '…';
    ctx.fillStyle = c.fg; ctx.fillText(name, 80, 340);
    ctx.font = '400 30px '+body; ctx.fillStyle = c.muted;
    ctx.fillText(r.dato + '   ·   Søvn i natt: ' + dec(r.sovn) + ' timer   ·   Opplagthet: ' + r.opplagt + ' av 5', 80, 395);
    ctx.fillText('Testen varte i 2 minutter' + (r.antall!=null ? '   ·   Antall trykk: ' + r.antall : ''), 80, 440);
    const defs = STAT_DEFS(r), tw = (W-160-2*30)/3, th = 150;
    defs.forEach(([v,l], i) => {
      const col = i%3, row = Math.floor(i/3), tx = 80 + col*(tw+30), ty = 490 + row*(th+30);
      ctx.fillStyle = c.chip; roundRect(ctx, tx, ty, tw, th, 18); ctx.fill();
      ctx.fillStyle = c.fg; ctx.font = '500 52px '+mono; ctx.fillText(v, tx+28, ty+78);
      ctx.fillStyle = c.muted; ctx.font = '400 28px '+body; ctx.fillText(l, tx+28, ty+122);
    });
    ctx.fillStyle = c.fg; ctx.font = '600 36px '+disp; ctx.fillText('Reaksjonstid gjennom testen', 80, 920);
    drawChart(ctx, 80, 950, W-160, 620, r, c, {s:2, mono});
    ctx.font = '400 26px '+body; ctx.fillStyle = c.muted;
    ctx.fillText('Blå linje: reaksjonstid for hvert trykk.  Stiplet linje: median.', 80, 1630);
    if (r.tidlig) { ctx.fillStyle = c.early; ctx.fillText('Oransje kryss: for tidlige trykk.', 80, 1672); }
    return await new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error('toBlob')), 'image/png'));
  }
  function roundRect(ctx, x, y, w, h, rad){ ctx.beginPath(); ctx.moveTo(x+rad,y); ctx.arcTo(x+w,y,x+w,y+h,rad); ctx.arcTo(x+w,y+h,x,y+h,rad); ctx.arcTo(x,y+h,x,y,rad); ctx.arcTo(x,y,x+w,y,rad); ctx.closePath(); }
  const fileName = r => 'Reaksjonstest ' + r.navn.replace(/[^\p{L}\p{N} ]/gu,'').trim() + ' ' + r.dato + '.png';

  $('exportBtn').addEventListener('click', async () => {
    if (!last) return;
    const toast = $('toast');
    if (!lastBlob){ toast.textContent = 'Lager bildet …'; try { lastBlob = await buildImage(last); } catch(e){ toast.textContent = 'Klarte ikke å lage bildet. Prøv igjen.'; return; } }
    const name = fileName(last);
    try {
      const file = new File([lastBlob], name, {type:'image/png'});
      if (navigator.canShare && navigator.canShare({files:[file]})){
        await navigator.share({files:[file], title:'Reaksjonstest'}); toast.textContent = 'Delt.'; return;
      }
    } catch(e){ if (e && e.name === 'AbortError'){ toast.textContent = 'Delingen ble avbrutt.'; return; } }
    const img = $('shareImg'); if (img.dataset.url) URL.revokeObjectURL(img.dataset.url);
    const url = URL.createObjectURL(lastBlob); img.src = url; img.dataset.url = url;
    $('shareOverlay').hidden = false; toast.textContent = '';
  });
  $('closeShare').addEventListener('click', () => { $('shareOverlay').hidden = true; });
  $('again').addEventListener('click', () => { window.scrollTo({top:0, behavior:'smooth'}); tryStart(); });

  // ---------- log (browser storage on this device) ----------
  const EXAMPLES = [
    {navn:'Eksempel', dato:'09.11.2026', sovn:6.5, opplagt:2, median:318, snitt:331, raskest:261, tregest:512, bredde:251, tidlig:2, example:true},
    {navn:'Eksempel', dato:'16.11.2026', sovn:8.75, opplagt:4, median:290, snitt:296, raskest:248, tregest:378, bredde:130, tidlig:0, example:true}
  ];
  let memLog = null;
  function loadLog(){
    try {
      const raw = localStorage.getItem(STORE); if (raw) return JSON.parse(raw);
      const old = localStorage.getItem(OLD_STORE);
      if (old){
        const conv = JSON.parse(old).filter(x=>!x.example).map(x => ({navn:x.kode, dato:x.dato, sovn:x.sovn===''?null:x.sovn, opplagt:x.opplagt?Number(x.opplagt):null, median:x.median, snitt:x.snitt, raskest:x.raskest, tregest:x.tregest, bredde:x.bredde, tidlig:x.tidlig}));
        localStorage.setItem(STORE, JSON.stringify(conv)); return conv;
      }
    } catch(e){}
    return null;
  }
  function getLog(){ return memLog || loadLog() || EXAMPLES; }
  function saveRun(r){
    const entry = {navn:r.navn, dato:r.dato, sovn:r.sovn, opplagt:r.opplagt, median:r.median, snitt:r.snitt, raskest:r.raskest, tregest:r.tregest, bredde:r.bredde, tidlig:r.tidlig, antall:r.antall, trials:r.trials, earlies:r.earlies};
    let l = getLog().filter(x=>!x.example); l.unshift(entry); l = l.slice(0, 300); memLog = l;
    try { localStorage.setItem(STORE, JSON.stringify(l)); } catch(e){
      try { localStorage.setItem(STORE, JSON.stringify(l.map(({trials, earlies, ...rest}) => rest))); } catch(_){}
    }
  }
  function renderLog(){
    const l = getLog();
    $('logBody').innerHTML = l.map((r, i) => '<tr'+(r.example?' class="ex"':'')+'><td>'+r.dato+'</td><td>'+esc(r.navn)+'</td><td class="num">'+(r.sovn==null?'':dec(r.sovn))+'</td><td class="num">'+(r.opplagt==null?'':r.opplagt)+'</td><td class="num">'+r.median+'</td><td class="num">'+r.snitt+'</td><td class="num">'+r.raskest+'</td><td class="num">'+r.tregest+'</td><td class="num">'+r.bredde+'</td><td class="num">'+r.tidlig+'</td><td class="act">'+(r.example?'':'<button type="button" class="morebtn" data-i="'+i+'" aria-haspopup="menu" aria-expanded="false" aria-label="Flere valg for målingen '+esc(r.dato)+'"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="4" cy="10" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="16" cy="10" r="2"/></svg></button>')+'</td></tr>').join('');
    $('copyAll').disabled = !l.some(x=>!x.example);
  }
  const toRow = r => [r.dato, r.navn, r.sovn==null?'':dec(r.sovn), r.opplagt==null?'':r.opplagt, r.median, r.snitt, r.raskest, r.tregest, r.bredde, r.tidlig].join('\t');
  async function copyText(text, el, ok){
    try { await navigator.clipboard.writeText(text); el.textContent = ok; }
    catch(e){ const t = $('clip'); t.value = text; t.select(); let done = false; try { done = document.execCommand('copy'); } catch(_){} el.textContent = done ? ok : 'Kunne ikke kopiere. Marker radene i tabellen og kopier manuelt.'; }
  }
  $('copyAll').addEventListener('click', () => {
    const head = ['Dato','Navn','Søvn (t)','Opplagt','Median','Snitt','Raskest','Tregest','Bredde','For tidlig'].join('\t');
    copyText(head + '\n' + getLog().filter(x=>!x.example).map(toRow).join('\n'), $('toast2'), 'Alle radene er kopiert.');
  });
  let clearArmed = false;
  $('clearLog').addEventListener('click', () => {
    if (!clearArmed){ clearArmed = true; $('clearLog').textContent = 'Trykk igjen for å tømme'; setTimeout(()=>{ clearArmed = false; $('clearLog').textContent = 'Tøm loggen'; }, 3000); return; }
    clearArmed = false; $('clearLog').textContent = 'Tøm loggen';
    memLog = []; try { localStorage.setItem(STORE, '[]'); } catch(e){}
    renderLog(); $('toast2').textContent = 'Loggen er tømt.';
  });

  // ---------- row menu: reopen an earlier result ----------
  const menu = $('rowMenu'); let menuIdx = null, menuBtn = null;
  function closeMenu(focusBack){
    if (menu.hidden) return; menu.hidden = true;
    if (menuBtn){ menuBtn.setAttribute('aria-expanded','false'); if (focusBack) menuBtn.focus(); }
    menuIdx = null; menuBtn = null;
  }
  $('logBody').addEventListener('click', e => {
    const b = e.target.closest('.morebtn'); if (!b) return;
    if (menuBtn === b){ closeMenu(); return; }
    closeMenu(); menuBtn = b; menuIdx = Number(b.dataset.i);
    b.setAttribute('aria-expanded','true'); menu.hidden = false;
    placeMenu(); $('menuShow').focus({preventScroll:true});
  });
  function placeMenu(){
    if (menu.hidden || !menuBtn) return;
    const r = menuBtn.getBoundingClientRect(), mw = menu.offsetWidth, mh = menu.offsetHeight;
    let left = Math.min(window.innerWidth - mw - 12, r.right - mw); left = Math.max(12, left);
    let top = r.bottom + 6; if (top + mh > window.innerHeight - 12) top = r.top - mh - 6;
    menu.style.left = left+'px'; menu.style.top = top+'px';
  }
  document.addEventListener('pointerdown', e => { if (!menu.hidden && !menu.contains(e.target) && !e.target.closest('.morebtn')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(true); });
  window.addEventListener('scroll', placeMenu, {passive:true}); window.addEventListener('resize', placeMenu);
  document.querySelector('.tablewrap').addEventListener('scroll', placeMenu, {passive:true});
  $('menuShow').addEventListener('click', () => {
    const entry = getLog()[menuIdx]; closeMenu(); if (!entry || entry.example) return;
    last = Object.assign({earlies: []}, entry); lastBlob = null;
    showResult(last);
    $('resultCard').scrollIntoView({behavior:'smooth', block:'start'});
    buildImage(last).then(b => { lastBlob = b; }).catch(()=>{});
  });

  renderLog();
})();
