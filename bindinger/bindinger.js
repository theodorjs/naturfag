/* Bindinger i bevegelse: tre animasjoner på ett lerret (molekylbinding, saltbinding, metallbinding). Ingen avhengigheter. */
(function () {
  const W = 960, H = 540;
  const C = { stage: "#0C1C14", fg: "#F2F5EE", muted: "#A9BFB0", ring: "#56786A", pluss: "#E07A2A", minus: "#4FA3F0", gul: "#FFD966", sea: "79,163,240" };
  const cv = document.getElementById("cv");
  const ctx = cv.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cap = document.getElementById("caption");
  const playBtn = document.getElementById("play");
  const curBtn = document.getElementById("current");
  const bendBtn = document.getElementById("bend");
  const explain = document.getElementById("explain");
  const legend = document.getElementById("legend");

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const seg = (t, a, b) => ease((t - a) / (b - a));
  const lerp = (a, b, s) => a + (b - a) * s;
  const FONT = '"Fredoka", "Nunito Sans", system-ui, sans-serif';

  function circle(x, y, r, fill, alpha) { ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); ctx.globalAlpha = 1; }
  function ring(x, y, r, color, width, alpha) { ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.strokeStyle = color; ctx.lineWidth = width || 2.5; ctx.stroke(); ctx.globalAlpha = 1; }
  function label(x, y, text, size, color, alpha) { ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.font = "600 " + size + "px " + FONT; ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, x, y + 1); ctx.globalAlpha = 1; }
  function electron(x, y, color, alpha, r) { circle(x, y, r || 8, color || C.minus, alpha); ctx.globalAlpha = (alpha == null ? 1 : alpha) * 0.9; ctx.beginPath(); ctx.arc(x - 2.5, y - 2.5, (r || 8) * 0.35, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fill(); ctx.globalAlpha = 1; }
  function ion(x, y, r, sign, alpha) {
    const col = sign === "+" ? C.pluss : C.minus;
    ctx.globalAlpha = (alpha == null ? 1 : alpha) * 0.22; ctx.beginPath(); ctx.arc(x, y, r + 8, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1;
    circle(x, y, r, col, alpha);
    label(x, y, sign, Math.round(r * 1.1), C.stage, alpha);
  }

  /* ---------- METALL ---------- */
  const metal = {
    dur: Infinity,
    init() {
      this.ions = []; this.el = [];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) {
        const i = this.ions.length;
        this.ions.push({ bx: 112 + c * 92, by: 86 + r * 92, row: r, ph: Math.random() * 6.28 });
        this.el.push({ home: i, a: Math.random() * 6.28, x: 0, y: 0, vx: 0, vy: 0, freed: false });
      }
      this.bend = 0; this.bendTarget = 0; this.current = false;
    },
    ionPos(io, t) {
      const off = io.row < 2 ? 92 * ease(this.bend) : 0;
      return [io.bx + off + 2.4 * Math.sin(t * 7 + io.ph), io.by + 2.4 * Math.cos(t * 6 + io.ph)];
    },
    step(t, dt) {
      this.bend += Math.sign(this.bendTarget - this.bend) * Math.min(Math.abs(this.bendTarget - this.bend), dt / 1.4);
      for (const e of this.el) {
        const [hx, hy] = this.ionPos(this.ions[e.home], t);
        if (t < 3) {
          e.a += dt * 3.2;
          e.x = hx + 32 * Math.cos(e.a); e.y = hy + 32 * Math.sin(e.a);
          e.vx = -Math.sin(e.a) * 90; e.vy = Math.cos(e.a) * 90; e.freed = false;
        } else {
          e.vx += (Math.random() - 0.5) * 260 * dt; e.vy += (Math.random() - 0.5) * 260 * dt;
          if (this.current) e.vx += 120 * dt;
          const sp = Math.hypot(e.vx, e.vy), max = this.current ? 150 : 110, min = 45;
          if (sp > max) { e.vx *= max / sp; e.vy *= max / sp; }
          if (sp < min && sp > 0) { e.vx *= min / sp; e.vy *= min / sp; }
          if (this.current) e.vx = Math.max(e.vx, 20);
          e.x += e.vx * dt; e.y += e.vy * dt;
          const x0 = 60, x1 = this.bend > 0.01 ? 960 : 900;
          if (this.current) { if (e.x > x1) e.x = x0; if (e.x < x0) e.x = x0; }
          else { if (e.x < x0) { e.x = x0; e.vx = Math.abs(e.vx); } if (e.x > x1) { e.x = x1; e.vx = -Math.abs(e.vx); } }
          if (e.y < 40) { e.y = 40; e.vy = Math.abs(e.vy); } if (e.y > 500) { e.y = 500; e.vy = -Math.abs(e.vy); }
        }
      }
    },
    draw(t) {
      const sea = seg(t, 3, 5.5);
      if (sea > 0) {
        ctx.globalAlpha = 0.16 * sea; ctx.fillStyle = "rgb(" + C.sea + ")";
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(56, 36, this.bend > 0.01 ? 904 : 848, 468, 28) : ctx.rect(56, 36, 848, 468); ctx.fill(); ctx.globalAlpha = 1;
      }
      for (const io of this.ions) {
        const [x, y] = this.ionPos(io, t);
        if (t < 3) { ring(x, y, 32, C.ring, 2, 0.7); circle(x, y, 26, C.pluss); label(x, y, "Na", 20, C.stage); }
        else {
          const s = seg(t, 3, 4.5);
          if (s < 1) ring(x, y, 32, C.ring, 2, 0.7 * (1 - s));
          circle(x, y, 26, C.pluss);
          label(x, y, s < 0.5 ? "Na" : "+", s < 0.5 ? 20 : 30, C.stage);
        }
      }
      for (const e of this.el) electron(e.x, e.y, C.minus, 1, 7);
    },
    caption(t) {
      if (this.bendTarget === 1 && t >= 3) return "Lagene glir forbi hverandre, men elektronsjøen holder fortsatt alt sammen. Derfor kan metall bøyes uten å knekke.";
      if (this.current && t >= 3) return "Strøm: elektronene flyter samme vei gjennom metallet. Pluss-ionene blir liggende på plass.";
      if (t < 3) return "Natriumatomer i et metall. Hvert atom har ett ytterelektron som det holder løst.";
      if (t < 6) return "Atomene slipper ytterelektronene sine. Elektronene blir felles for alle atomene.";
      return "Pluss-ioner i en sjø av elektroner. Alle ionene trekkes mot den samme minus-sjøen, og det holder metallet sammen.";
    },
    rest: 7,
    explain: '<h2>Metallbinding</h2><p>Metallatomer holder dårlig på ytterelektronene sine. I et metall slipper alle atomene dem løs, og elektronene flyter fritt rundt som en sjø.</p><p>Atomene blir <b class="p">pluss-ioner</b> som ligger i <b class="m">minus-sjøen</b>. Ionene trekker ikke hverandre, de trekkes alle mot sjøen.</p><p>Fordi elektronene kan flytte seg, leder metaller strøm. Fordi lagene kan gli uten at sjøen slipper, kan metaller bøyes og hamres.</p>',
    legend: '<li><span class="dot p">+</span><span>Metallion: atomet uten ytterelektronet</span></li><li><span class="dot m"></span><span>Ytterelektron som flyter fritt</span></li><li><span class="ring"></span><span>Ytterskallet før atomet slipper elektronet</span></li>'
  };

  /* ---------- SALT ---------- */
  const salt = {
    dur: 16,
    init() {
      this.grid = [];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) {
        const tx = 144 + c * 96, ty = 78 + r * 96;
        const sign = (r + c) % 2 === 1 ? "+" : "-";
        const center = (r === 2 && (c === 3 || c === 4));
        const dx = tx - 480, dy = ty - 270, d = Math.hypot(dx, dy) || 1;
        this.grid.push({ tx, ty, sign, center, sx: tx + dx / d * 620, sy: ty + dy / d * 620, arrive: 7.6 + 3.6 * (d / 420) });
      }
    },
    step() {},
    atom(x, y, sym, nOuter, outerAlpha, missingSlot, ringsAlpha) {
      ring(x, y, 34, C.ring, 2, 0.6 * ringsAlpha); ring(x, y, 52, C.ring, 2, 0.6 * ringsAlpha);
      ring(x, y, 72, C.ring, 2.5, outerAlpha * ringsAlpha);
      circle(x, y, 22, sym === "Na" ? C.pluss : C.minus, ringsAlpha);
      label(x, y, sym, 18, C.stage, ringsAlpha);
    },
    draw(t) {
      const sA = seg(t, 0, 2), sB = seg(t, 2, 4), sC = seg(t, 4, 5.5), sD = seg(t, 5.5, 7), sX = seg(t, 6.2, 7.2);
      const naX = lerp(lerp(250, 330, sA), 432, sD), clX = lerp(lerp(710, 630, sA), 528, sD), y = 270;
      const detail = 1 - sX;
      if (t < 7.6 || detail > 0) {
        // halos when ions form
        if (sC > 0) { circle(naX, y, 60, C.pluss, 0.18 * sC * detail); circle(clX, y, 84, C.minus, 0.18 * sC * detail); }
        this.atom(naX, y, "Na", 1, 1 - sC, null, detail);
        this.atom(clX, y, "Cl", 7, 1, 0, detail);
        // Cl electrons (7 fixed)
        for (let k = 1; k < 8; k++) { const a = k * Math.PI / 4; electron(clX - 72 * Math.cos(a), y - 72 * Math.sin(a), C.minus, detail); }
        // moving electron
        const ex0 = naX + 72, ex1 = clX - 72;
        const ex = lerp(ex0, ex1, sB), ey = y - 70 * Math.sin(Math.PI * sB);
        if (sB > 0 && sB < 1) ring(ex, ey, 13, C.gul, 3, detail);
        electron(ex, ey, C.minus, detail);
        if (sC > 0) {
          label(naX, y - 98, "Na⁺", 28, C.pluss, sC * detail);
          label(clX, y - 112, "Cl⁻", 28, C.minus, sC * detail);
        }
        if (sD > 0 && sD < 1) { label(480, y + 128, "→   ←", 34, C.gul, Math.sin(Math.PI * sD) * detail); }
      }
      if (sX > 0) {
        for (const g of this.grid) {
          let x, yy, a = 1;
          if (g.center) { x = g.tx; yy = g.ty; a = sX; }
          else {
            const s = seg(t, g.arrive - 1.3, g.arrive);
            if (s <= 0) continue;
            x = lerp(g.sx, g.tx, s); yy = lerp(g.sy, g.ty, s);
          }
          const wob = t > 13 ? 1.6 * Math.sin(t * 6 + g.tx) : 0;
          ion(x + wob, yy, g.sign === "+" ? 26 : 34, g.sign === "+" ? "+" : "−", a);
        }
      }
    },
    caption(t) {
      if (t < 2) return "Natrium har 1 ytterelektron. Klor har 7 og mangler 1.";
      if (t < 4) return "Natrium gir ytterelektronet sitt til klor.";
      if (t < 5.5) return "Nå har begge fullt ytterskall. Natrium er blitt pluss, og klor er blitt minus.";
      if (t < 7.4) return "Pluss og minus trekker hverandre. Det er saltbindingen.";
      if (t < 12.6) return "Flere ioner trekkes til, pluss ved minus og minus ved pluss. Krystallen vokser i alle retninger.";
      return "Saltet blir aldri ferdig. Det vokser så lenge det kommer flere ioner.";
    },
    rest: 13.5,
    explain: '<h2>Saltbinding</h2><p>Et metall og et ikke-metall møtes. Metallet <b class="p">gir</b> fra seg elektroner, og ikke-metallet <b class="m">tar</b> dem.</p><p>Da blir metallet et pluss-ion og ikke-metallet et minus-ion. Pluss og minus trekker hverandre, akkurat som magneter.</p><p>Hvert ion trekker i alle ioner rundt seg, så saltet vokser til en krystall. Bordsalt er natriumklorid, NaCl.</p>',
    legend: '<li><span class="dot p">+</span><span>Natriumion, Na⁺</span></li><li><span class="dot m" style="background:var(--minus);width:26px;height:26px;margin:0"></span><span>Kloridion, Cl⁻ (litt større)</span></li><li><span class="ring"></span><span>Elektronskall. Bare ytterelektronene er tegnet</span></li>'
  };

  /* ---------- MOLEKYL ---------- */
  const deg = d => d * Math.PI / 180;
  const mol = {
    dur: 15,
    init() {},
    step() {},
    draw(t) {
      const O = { x: 480, y: 220 };
      const uL = { x: -0.7875, y: 0.6156 }, uR = { x: 0.7875, y: 0.6156 };
      const sH = seg(t, 1.8, 4.2), sE = seg(t, 3.2, 5.2);
      const vib = t > 5.2 ? 2.2 : 0;
      const dist = lerp(330, 160, sH);
      const HL = { x: O.x + dist * uL.x + vib * Math.sin(t * 9), y: O.y + dist * uL.y + vib * Math.cos(t * 8) };
      const HR = { x: O.x + dist * uR.x - vib * Math.sin(t * 9 + 1), y: O.y + dist * uR.y + vib * Math.cos(t * 8 + 1) };
      const glow = t >= 5.2 && t < 8.4 ? 0.5 + 0.5 * Math.sin((t - 5.2) * 5) : 0;
      // rings
      ring(O.x, O.y, 52, C.ring, 2, 0.6);
      ring(O.x, O.y, 120, glow ? C.gul : C.minus, glow ? 5 : 3, glow ? 0.6 + 0.4 * glow : 1);
      ring(HL.x, HL.y, 80, glow ? C.gul : C.pluss, glow ? 5 : 3, glow ? 0.6 + 0.4 * glow : 1);
      ring(HR.x, HR.y, 80, glow ? C.gul : C.pluss, glow ? 5 : 3, glow ? 0.6 + 0.4 * glow : 1);
      // nuclei
      circle(O.x, O.y, 30, C.fg); label(O.x, O.y, "O", 28, C.stage);
      circle(HL.x, HL.y, 22, C.fg); label(HL.x, HL.y, "H", 22, C.stage);
      circle(HR.x, HR.y, 22, C.fg); label(HR.x, HR.y, "H", 22, C.stage);
      // O inner electrons
      electron(O.x, O.y - 52, C.minus, 1, 7); electron(O.x, O.y + 52, C.minus, 1, 7);
      // O outer: four stay, two move to the shared areas
      [200, 235, 305, 340].forEach(a => electron(O.x + 120 * Math.cos(deg(a)), O.y + 120 * Math.sin(deg(a)), C.minus));
      const lens = (u, side) => {
        const P = { x: O.x + 100 * u.x, y: O.y + 100 * u.y };
        const n = side < 0 ? { x: 0.6156 * 12, y: 0.7875 * 12 } : { x: -0.6156 * 12, y: 0.7875 * 12 };
        return { blue: { x: P.x + n.x, y: P.y + n.y }, orange: { x: P.x - n.x, y: P.y - n.y } };
      };
      const LL = lens(uL, -1), LR = lens(uR, 1);
      const oStartL = { x: O.x + 120 * Math.cos(deg(142)), y: O.y + 120 * Math.sin(deg(142)) };
      const oStartR = { x: O.x + 120 * Math.cos(deg(38)), y: O.y + 120 * Math.sin(deg(38)) };
      electron(lerp(oStartL.x, LL.blue.x, sE), lerp(oStartL.y, LL.blue.y, sE), C.minus);
      electron(lerp(oStartR.x, LR.blue.x, sE), lerp(oStartR.y, LR.blue.y, sE), C.minus);
      const hStartL = { x: HL.x - 80 * uL.x, y: HL.y - 80 * uL.y };
      const hStartR = { x: HR.x - 80 * uR.x, y: HR.y - 80 * uR.y };
      electron(lerp(hStartL.x, LL.orange.x, sE), lerp(hStartL.y, LL.orange.y, sE), C.pluss);
      electron(lerp(hStartR.x, LR.orange.x, sE), lerp(hStartR.y, LR.orange.y, sE), C.pluss);
      // counting labels
      if (t >= 5.2 && t < 8.4) {
        const a = Math.min(1, (t - 5.2) * 2, (8.4 - t) * 2);
        label(O.x, O.y - 150, "8", 34, C.gul, a);
        label(HL.x - 40, HL.y + 100, "2", 34, C.gul, a);
        label(HR.x + 40, HR.y + 100, "2", 34, C.gul, a);
      }
      // third hydrogen bounces off
      if (t >= 8.4 && t < 12) {
        const go = seg(t, 8.4, 10), back = seg(t, 10.1, 12);
        const x3 = lerp(lerp(1010, 696, go), 1010, back), y3 = O.y - 90;
        ring(x3, y3, 80, C.pluss, 3); circle(x3, y3, 22, C.fg); label(x3, y3, "H", 22, C.stage);
        electron(x3 - 80, y3, C.pluss);
        if (t > 9.8 && t < 10.5) { const f = 1 - Math.abs(t - 10.15) / 0.35; label(600, O.y - 52, "✕", 40, C.gul, Math.max(0, f)); }
      }
      if (t >= 12) label(O.x, 500, "H₂O", 36, C.fg, seg(t, 12, 12.6));
    },
    caption(t) {
      if (t < 2) return "Oksygen har 6 ytterelektroner og mangler 2. Hvert hydrogen har 1 og mangler 1.";
      if (t < 5.2) return "Skallene overlapper. Hvert hydrogen deler elektronet sitt med oksygen, og oksygen deler ett tilbake.";
      if (t < 8.4) return "Tell: oksygen har 8 i ytterskallet, og hvert hydrogen har 2. Alle er fornøyde.";
      if (t < 12) return "Et nytt hydrogenatom får ikke feste seg. Det er ingen ledige plasser å dele.";
      return "Molekylet er ferdig: H₂O. Begge kjernene trekker i hvert delte elektronpar.";
    },
    rest: 6.5,
    explain: '<h2>Molekylbinding</h2><p>To ikke-metaller møtes, og begge vil ha flere elektroner. Ingen av dem gir slipp, så de <b>deler</b> i stedet.</p><p>Hvert delte par ligger mellom to kjerner, og begge kjernene trekker i paret. Det er limet i molekylet.</p><p>Når alle har fullt ytterskall, er molekylet ferdig. Vann er alltid H₂O.</p>',
    legend: '<li><span class="dot m"></span><span>Elektron fra oksygen</span></li><li><span class="dot m" style="background:var(--pluss)"></span><span>Elektron fra hydrogen</span></li><li><span class="dot k"></span><span>Atomkjerne</span></li><li><span class="ring" style="border-color:var(--minus)"></span><span>Ytterskall. Der skallene overlapper, deles elektronene</span></li>'
  };

  const scenes = { metall: metal, salt: salt, molekyl: mol };
  let cur = "molekyl", t = 0, playing = !reduce, last = null, lastCap = "";

  function setCaption(s) { if (s !== lastCap) { cap.textContent = s; lastCap = s; } }
  function render() {
    const sc = scenes[cur];
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.stage; ctx.fillRect(0, 0, W, H);
    sc.draw(t);
    setCaption(sc.caption(t));
  }
  function frame(now) {
    if (last == null) last = now;
    let dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (playing) {
      const sc = scenes[cur];
      t += dt;
      if (t > sc.dur) { t = 0; sc.init(); }
      sc.step(t, dt);
    }
    render();
    requestAnimationFrame(frame);
  }
  function show(name) {
    if (!scenes[name]) name = "molekyl";
    cur = name;
    document.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-selected", b.dataset.scene === name ? "true" : "false"));
    curBtn.hidden = bendBtn.hidden = name !== "metall";
    const sc = scenes[name];
    sc.init(); t = 0;
    if (reduce) { // jump to a still that explains the idea
      const steps = Math.round(sc.rest / 0.02);
      for (let i = 0; i < steps; i++) { t += 0.02; sc.step(t, 0.02); }
    }
    resetToggles();
    explain.innerHTML = sc.explain; legend.innerHTML = sc.legend;
    cv.setAttribute("aria-label", "Animasjon: " + document.getElementById("tab-" + name).textContent);
    render();
  }
  function resetToggles() {
    metal.current = false; metal.bendTarget = 0;
    curBtn.setAttribute("aria-pressed", "false"); curBtn.textContent = "Koble til strøm";
    bendBtn.setAttribute("aria-pressed", "false"); bendBtn.textContent = "Bøy metallet";
  }

  document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => {
    try { history.replaceState(null, "", "#" + b.dataset.scene); } catch (e) { location.hash = b.dataset.scene; }
    show(b.dataset.scene);
  }));
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));
  playBtn.addEventListener("click", () => { playing = !playing; playBtn.textContent = playing ? "Pause" : "Spill av"; });
  document.getElementById("restart").addEventListener("click", () => { show(cur); if (!playing) { playing = true; playBtn.textContent = "Pause"; } });
  curBtn.addEventListener("click", () => {
    if (t < 3) { t = 3; }
    metal.current = !metal.current;
    curBtn.setAttribute("aria-pressed", String(metal.current));
    curBtn.textContent = metal.current ? "Slå av strømmen" : "Koble til strøm";
  });
  bendBtn.addEventListener("click", () => {
    if (t < 3) { t = 3; }
    metal.bendTarget = metal.bendTarget ? 0 : 1;
    bendBtn.setAttribute("aria-pressed", String(!!metal.bendTarget));
    bendBtn.textContent = metal.bendTarget ? "Rett det ut igjen" : "Bøy metallet";
  });
  if (!playing) playBtn.textContent = "Spill av";

  show(location.hash.slice(1) || "molekyl");
  requestAnimationFrame(frame);
})();
