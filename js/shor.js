/* ============================================================
   SECTION 3 — SHOR  ·  the quantum attack on RSA
   pinned + scrub timeline
   ============================================================ */
window.QL_shor = function (gsap, ScrollTrigger) {
  const S = QL_DATA.shor;
  const NS = 'http://www.w3.org/2000/svg';

  // ---- build qubits ----
  const qubits = document.getElementById('qubits');
  for (let i = 0; i < S.qubits; i++) qubits.appendChild(QL.el('div', 'qubit'));
  const qubitEls = gsap.utils.toArray('#qubits .qubit');

  // ---- build circuit lines + gates in svg ----
  const cg = document.getElementById('circuit-lines');
  const lineY = [108, 140, 172, 204];
  const drawn = [];
  lineY.forEach((y) => {
    const ln = document.createElementNS(NS, 'line');
    ln.setAttribute('x1', 175); ln.setAttribute('y1', y);
    ln.setAttribute('x2', 425); ln.setAttribute('y2', y);
    ln.setAttribute('stroke', 'var(--quantum)'); ln.setAttribute('stroke-width', '1.5');
    cg.appendChild(ln); QL.prepDraw(ln); drawn.push(ln);
  });
  // gate boxes
  [[215, 0], [270, 1], [330, 2], [385, 0]].forEach(([x, row]) => {
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', x - 9); r.setAttribute('y', lineY[row] - 9);
    r.setAttribute('width', 18); r.setAttribute('height', 18); r.setAttribute('rx', 3);
    r.setAttribute('fill', 'var(--void-1)'); r.setAttribute('stroke', 'var(--quantum)'); r.setAttribute('stroke-width', '1.2');
    r.setAttribute('class', 'gate'); cg.appendChild(r);
  });
  const gates = gsap.utils.toArray('#circuit-lines .gate');

  // ---- build QFT bars ----
  const barWrap = document.getElementById('qft-bars');
  S.qftBars.forEach((b) => {
    const bar = QL.el('div', 'qbar');
    bar.style.height = '100%';
    bar.dataset.h = b.h;
    barWrap.appendChild(bar);
  });
  const barEls = gsap.utils.toArray('#qft-bars .qbar');
  gsap.set(barEls, { scaleY: 0.02 });

  // QFT sine path
  const sine = document.getElementById('qft-sine');
  let dpath = 'M 0 45';
  for (let x = 0; x <= 320; x += 4) dpath += ` L ${x} ${45 - Math.sin(x / 18) * 32}`;
  sine.setAttribute('d', dpath);
  QL.prepDraw(sine);

  // ---- build number grid (shatter) ----
  const grid = document.getElementById('shor-grid');
  const cells = [];
  for (let i = 1; i <= 15; i++) {
    const c = QL.el('div', 'cell', String(i));
    if (i === 3 || i === 5) c.classList.add('prime');
    grid.appendChild(c); cells.push(c);
  }
  const primeCells = cells.filter((c) => c.classList.contains('prime'));

  // ---- build step list ----
  const stepWrap = document.getElementById('shor-steps');
  S.steps.forEach((s) => {
    const row = QL.el('div', 'shor-step',
      `<b class="mono">${s.n}</b><div><span class="st">${s.title}</span><em class="sb mono">${s.body}</em></div>`);
    stepWrap.appendChild(row);
  });
  const stepEls = gsap.utils.toArray('#shor-steps .shor-step');

  // ---- initial states ----
  gsap.set(['.qm-frame', '.qm-core', '.qm-fin', '#qubits', '.qm-label'], { opacity: 0 });
  gsap.set('.qm-core', { scale: 0 });
  gsap.set('.qm-fin.l', { x: -60, opacity: 0 });
  gsap.set('.qm-fin.r', { x: 60, opacity: 0 });
  gsap.set('.qm-frame', { y: -50, opacity: 0 });
  gsap.set('#attack-beam', { opacity: 0 });
  QL.prepDraw(document.getElementById('attack-beam'));
  gsap.set('#qft', { opacity: 0, y: 20 });
  gsap.set('#shor-grid', { opacity: 0 });
  gsap.set('#shor-result', { y: 24 });
  gsap.set(stepEls, { opacity: 0.16, x: -8 });
  gsap.set('#broken-stamp', { opacity: 0, scale: 2.6, rotate: -9 });

  function step(i) {
    stepEls.forEach((s, k) => gsap.to(s, { opacity: k === i ? 1 : (k < i ? 0.4 : 0.16), x: k === i ? 0 : -8, duration: 0.3 }));
  }

  // qubit superposition spin loop (independent of scrub)
  const spin = gsap.to(qubitEls, { rotateY: 360, duration: 0.7, ease: 'none', repeat: -1, stagger: 0.06, paused: true });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: '#shor', start: 'top top', end: '+=3400', pin: true, scrub: 1, invalidateOnRefresh: true },
    defaults: { ease: 'power2.out' },
  });

  // assemble the machine, piece by piece
  tl.add(() => { spin.pause(); gsap.set(qubitEls, { rotateY: 0 }); });
  tl.add(() => step(0));
  tl.to('.qm-frame', { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' });
  tl.to(['.qm-fin.l', '.qm-fin.r'], { x: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.08 }, '>-0.1');
  tl.to('.qm-core', { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.2)' }, '>-0.1');
  tl.to('.qm-label', { opacity: 1, duration: 0.3 }, '<');
  tl.to('#qubits', { opacity: 1, duration: 0.3 }, '<');

  // circuit draws itself
  tl.add(() => step(1));
  tl.to(drawn, { strokeDashoffset: 0, duration: 0.7, stagger: 0.08, ease: 'power1.inOut' });
  tl.from(gates, { scale: 0, transformOrigin: 'center', duration: 0.3, stagger: 0.06, ease: 'back.out(2)' }, '<0.2');

  // superposition: qubits spin into blur
  tl.add(() => step(2));
  tl.to('.qm-core', { boxShadow: '0 0 60px var(--quantum)', duration: 0.4 });
  tl.add(() => spin.play());
  tl.to({}, { duration: 0.6 }); // hold superposition

  // QFT reveal — wave draws, oscillates, sharpens into spikes
  tl.add(() => step(3));
  tl.to('#qft', { opacity: 1, y: 0, duration: 0.4 });
  tl.to(sine, { strokeDashoffset: 0, duration: 0.7, ease: 'power1.inOut' }, '<');
  tl.to(sine, { attr: { 'stroke-opacity': 0.15 }, duration: 0.4 }, '>');
  tl.to(barEls, { scaleY: (i) => barEls[i].dataset.h, duration: 0.6, stagger: { each: 0.015, from: 'center' }, ease: 'power2.out' }, '<');

  // measure the period
  tl.add(() => step(4));
  tl.to('#qft-r', { duration: 0.3, onStart: () => { document.getElementById('qft-r').textContent = S.period; } });
  // collapse: qubits snap
  tl.add(() => { spin.pause(); });
  tl.to(qubitEls, { rotateY: 0, scale: 1.5, duration: 0.15, ease: 'power4.out' });
  tl.to(qubitEls, { scale: 1, duration: 0.25, ease: 'power2.out' });

  // classical post-processing
  tl.add(() => step(5));
  tl.to('#qft', { opacity: 0.35, duration: 0.3 });
  tl.to('#shor-grid', { opacity: 1, duration: 0.3 });
  tl.from(cells, { scale: 0.4, opacity: 0, duration: 0.3, stagger: { each: 0.02, from: 'center' } }, '<');

  // extract factors → shatter
  tl.add(() => step(6));
  tl.to(primeCells, { scale: 1.4, color: 'var(--broken)', borderColor: 'var(--broken)',
    boxShadow: '0 0 24px var(--broken)', duration: 0.3, repeat: 1, yoyo: true });
  // grid shatters — every cell flies off
  tl.to(cells, {
    x: () => QL.rnd(-360, 360), y: () => QL.rnd(-320, 320),
    rotation: () => QL.rnd(-220, 220), opacity: 0, scale: 0.3,
    duration: 0.7, ease: 'power3.in', stagger: { each: 0.012, from: 'center' },
  });
  // primes burst outward, lingering longer
  tl.to(primeCells, { scale: 1.8, opacity: 0.9, x: (i) => i ? 220 : -220, y: -40, duration: 0.6, ease: 'power2.out' }, '<');

  // attack beam fires
  tl.to('#attack-beam', { opacity: 1, strokeDashoffset: 0, duration: 0.4, ease: 'power2.in' }, '<0.1');
  tl.to('.qm-core', { backgroundColor: 'var(--broken)', boxShadow: '0 0 70px var(--broken)', duration: 0.4 }, '<');

  // BROKEN stamp slams
  tl.add(() => step(6));
  tl.to('#broken-stamp', { opacity: 1, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
  tl.to('#shor-status', { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '<');
  tl.fromTo('#shor-stage', { x: 0 }, { x: 8, duration: 0.06, repeat: 5, yoyo: true, ease: 'none' }, '<');
  tl.to('#shor-result', { opacity: 1, y: 0, duration: 0.5 }, '<0.1');
};
