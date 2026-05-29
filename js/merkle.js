/* ============================================================
   SECTION 4 — MERKLE  ·  the tree that resists Shor
   pinned + scrub timeline
   ============================================================ */
window.QL_merkle = function (gsap, ScrollTrigger) {
  const M = QL_DATA.merkle;
  const NS = 'http://www.w3.org/2000/svg';
  const stage = document.getElementById('merkle-stage');
  const treeHost = document.getElementById('tree');

  // node layout in % of stage
  const layout = {
    L0: [16, 72], L1: [39, 72], L2: [61, 72], L3: [84, 72],
    H01: [27.5, 47], H23: [72.5, 47],
    ROOT: [50, 21],
  };
  const node = {};
  function makeNode(id, cls, label, hash) {
    const n = QL.el('div', 'tnode ' + cls,
      `<span class="id">${id}</span><span class="hx">${hash}</span>`);
    n.style.left = layout[id][0] + '%';
    n.style.top = layout[id][1] + '%';
    treeHost.appendChild(n);
    node[id] = n;
    n.dataset.hash = hash;
    return n;
  }
  M.leaves.forEach((l, i) => makeNode('L' + i, 'leaf', 'L' + i, l.hash));
  makeNode('H01', 'branch', 'H01', M.branches[0].hash);
  makeNode('H23', 'branch', 'H23', M.branches[1].hash);
  makeNode('ROOT', 'root', 'ROOT', M.root.hash);

  // tx cards (row beneath leaves)
  const txHost = document.getElementById('tx-cards');
  M.txs.forEach((t, i) => {
    const c = QL.el('div', 'tx-card', `<div class="id">${t.id}</div><div class="lab">${t.label}</div>`);
    txHost.appendChild(c);
  });
  const txEls = gsap.utils.toArray('#tx-cards .tx-card');

  // ---- build links (measured in stage pixel space) ----
  const svg = document.getElementById('merkle-svg');
  const linkG = document.getElementById('tree-links');
  function center(el) {
    const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return { x: r.left + r.width / 2 - s.left, y: r.top + r.height / 2 - s.top };
  }
  const linkPairs = [['ROOT', 'H01'], ['ROOT', 'H23'], ['H01', 'L0'], ['H01', 'L1'], ['H23', 'L2'], ['H23', 'L3']];
  const links = [];
  const txLinks = [];
  let beamLine = null;
  // create line elements ONCE (so the timeline can reference them at build time)
  function buildLinks() {
    linkG.innerHTML = '';
    links.length = 0; txLinks.length = 0;
    const W = stage.clientWidth, H = stage.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    linkPairs.forEach(([a, b]) => {
      const pa = center(node[a]), pb = center(node[b]);
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', pa.x); ln.setAttribute('y1', pa.y);
      ln.setAttribute('x2', pb.x); ln.setAttribute('y2', pb.y);
      ln.setAttribute('stroke', 'var(--line-strong)'); ln.setAttribute('stroke-width', '1.5');
      linkG.appendChild(ln); QL.prepDraw(ln); links.push(ln);
    });
    txEls.forEach((card, i) => {
      const pc = center(card), pl = center(node['L' + i]);
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', pc.x); ln.setAttribute('y1', pc.y);
      ln.setAttribute('x2', pl.x); ln.setAttribute('y2', pl.y);
      ln.setAttribute('stroke', 'var(--quantum)'); ln.setAttribute('stroke-width', '1'); ln.setAttribute('stroke-opacity', '0.4');
      linkG.appendChild(ln); QL.prepDraw(ln); txLinks.push(ln);
    });
    // attack beam: QPU → root
    const pm = center(document.getElementById('qmachine2')), pr = center(node.ROOT);
    beamLine = document.createElementNS(NS, 'line');
    beamLine.setAttribute('x1', pm.x); beamLine.setAttribute('y1', pm.y);
    beamLine.setAttribute('x2', pr.x); beamLine.setAttribute('y2', pr.y);
    beamLine.setAttribute('stroke', 'var(--broken)'); beamLine.setAttribute('stroke-width', '3');
    beamLine.setAttribute('class', 'qbeam');
    linkG.appendChild(beamLine); QL.prepDraw(beamLine);
  }
  // reposition existing lines on resize WITHOUT recreating (keeps draw state + references)
  function repositionLinks() {
    const W = stage.clientWidth, H = stage.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    linkPairs.forEach(([a, b], i) => {
      const pa = center(node[a]), pb = center(node[b]);
      links[i].setAttribute('x1', pa.x); links[i].setAttribute('y1', pa.y);
      links[i].setAttribute('x2', pb.x); links[i].setAttribute('y2', pb.y);
    });
    txEls.forEach((card, i) => {
      const pc = center(card), pl = center(node['L' + i]);
      txLinks[i].setAttribute('x1', pc.x); txLinks[i].setAttribute('y1', pc.y);
      txLinks[i].setAttribute('x2', pl.x); txLinks[i].setAttribute('y2', pl.y);
    });
    if (beamLine) {
      const pm = center(document.getElementById('qmachine2')), pr = center(node.ROOT);
      beamLine.setAttribute('x1', pm.x); beamLine.setAttribute('y1', pm.y);
      beamLine.setAttribute('x2', pr.x); beamLine.setAttribute('y2', pr.y);
    }
  }
  buildLinks();

  const callouts = gsap.utils.toArray('#merkle-callouts .callout');
  function revealCallout(i) {
    callouts.forEach((c, k) => gsap.to(c, { opacity: k === i ? 1 : 0.2, x: k === i ? 0 : -8, duration: 0.3 }));
  }

  // build scan-panel bars (mirror of the Shor QFT)
  const sbarWrap = document.getElementById('qs-bars');
  for (let i = 0; i < 12; i++) { const b = QL.el('div', 'sbar'); b.style.height = '100%'; sbarWrap.appendChild(b); }
  const sbarEls = gsap.utils.toArray('#qs-bars .sbar');

  // initial states
  const allNodes = Object.values(node);
  gsap.set(allNodes, { scale: 0, opacity: 0 });
  gsap.set(txEls, { x: -60, opacity: 0 });
  gsap.set(callouts, { opacity: 0.18, x: -8 });
  gsap.set('#merkle-status, #merkle-foot', { opacity: 0 });
  gsap.set('#shield', { scale: 0, opacity: 0 });
  gsap.set('#secured-stamp', { opacity: 0, scale: 2.6 });
  gsap.set('#qmachine2', { y: -120, opacity: 0 });
  gsap.set('#qscan', { opacity: 0, y: -10 });
  gsap.set(sbarEls, { scaleY: 0.04 });
  if (beamLine) gsap.set(beamLine, { opacity: 0 });

  // root scramble loop (used during attack)
  let rootLoop = null;
  const rootHx = node.ROOT.querySelector('.hx');
  function startRootChaos() {
    stopRootChaos();
    rootLoop = gsap.to({}, { duration: 0.08, repeat: -1, onRepeat() {
      let s = ''; for (let i = 0; i < M.root.hash.length; i++) s += M.hex[(Math.random() * M.hex.length) | 0];
      rootHx.textContent = s;
    } });
  }
  function stopRootChaos() { if (rootLoop) { rootLoop.kill(); rootLoop = null; } rootHx.textContent = M.root.hash; }

  // period-scan chaos: bars jitter as pure noise, period readout never settles
  let scanLoop = null;
  const rOut = document.getElementById('qs-r');
  const candidates = [2, 3, 5, 6, 7, 9, 11, 13];
  function startScan() {
    stopScan();
    const st = document.getElementById('qs-stat');
    st.textContent = 'SCANNING'; st.style.color = 'var(--broken)';
    rOut.style.color = 'var(--broken)';
    scanLoop = gsap.to({}, { duration: 0.07, repeat: -1, onRepeat() {
      sbarEls.forEach((b) => gsap.set(b, { scaleY: 0.06 + Math.random() * Math.random() * 0.55 }));
      rOut.textContent = candidates[(Math.random() * candidates.length) | 0];
    } });
  }
  function stopScan() { if (scanLoop) { scanLoop.kill(); scanLoop = null; } }

  // red glitch shards bursting off the root
  function rootShards() {
    const pr = center(node.ROOT);
    for (let i = 0; i < 10; i++) {
      const p = QL.el('div');
      p.style.cssText = `position:absolute;left:${pr.x}px;top:${pr.y}px;width:${QL.rnd(3,7)}px;height:2px;
        background:var(--broken);box-shadow:0 0 8px var(--broken);pointer-events:none;z-index:6;transform:translate(-50%,-50%);`;
      stage.appendChild(p);
      gsap.to(p, { x: QL.rnd(-90, 90), y: QL.rnd(-70, 70), opacity: 0, duration: QL.rnd(0.4, 0.8),
        ease: 'power2.out', onComplete: () => p.remove() });
    }
  }

  const tl = gsap.timeline({
    scrollTrigger: { trigger: '#merkle', start: 'top top', end: '+=4600', pin: true, scrub: 1,
      invalidateOnRefresh: true, onRefresh: repositionLinks },
    defaults: { ease: 'power2.out' },
  });

  // ---- BUILD: tx cards slide in ----
  tl.add(() => revealCallout(0));
  tl.to(txEls, { x: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.6)' });

  // leaves pop bottom-up + slot-machine hash
  const leafEls = ['L0', 'L1', 'L2', 'L3'].map((id) => node[id]);
  tl.to(leafEls, { scale: 1, opacity: 1, duration: 0.45, stagger: 0.1, ease: 'back.out(2)' });
  tl.add(() => leafEls.forEach((n, i) => QL.hexScramble(n.querySelector('.hx'), M.leaves[i].hash, M.hex, 0.7)));
  tl.to(txLinks, { strokeDashoffset: 0, duration: 0.5, stagger: 0.06 }, '<');
  tl.to({}, { duration: 0.5 });

  // branches
  tl.add(() => revealCallout(1));
  tl.to([node.H01, node.H23], { scale: 1, opacity: 1, duration: 0.45, stagger: 0.12, ease: 'back.out(2)' });
  tl.to([links[2], links[3], links[4], links[5]], { strokeDashoffset: 0, duration: 0.5, stagger: 0.05 }, '<');
  tl.add(() => { QL.hexScramble(node.H01.querySelector('.hx'), M.branches[0].hash, M.hex, 0.7); QL.hexScramble(node.H23.querySelector('.hx'), M.branches[1].hash, M.hex, 0.7); });
  tl.to({}, { duration: 0.5 });

  // root
  tl.add(() => revealCallout(2));
  tl.to(node.ROOT, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' });
  tl.to([links[0], links[1]], { strokeDashoffset: 0, duration: 0.5, stagger: 0.05 }, '<');
  tl.add(() => QL.hexScramble(node.ROOT.querySelector('.hx'), M.root.hash, M.hex, 0.9));
  tl.to({}, { duration: 0.6 });

  // ---- ATTACK ----
  tl.add(() => revealCallout(3));
  tl.to('#qmachine2', { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' });
  tl.to('#qmachine2 .qm-core', { backgroundColor: 'var(--broken)', boxShadow: '0 0 50px var(--broken)', duration: 0.3 }, '<0.2');
  tl.to('#qscan', { opacity: 1, y: 0, duration: 0.4 }, '<');
  // beam fires down at the root
  tl.to(beamLine, { opacity: 1, strokeDashoffset: 0, duration: 0.4, ease: 'power2.in' });
  tl.to(node.ROOT, { borderColor: 'var(--broken)', color: 'var(--broken)', boxShadow: '0 0 30px var(--broken)', duration: 0.3 }, '<0.1');
  // the scan begins — bars churn as noise, period readout flails, root hash never settles
  tl.add(() => { startScan(); startRootChaos(); });
  tl.fromTo(node.ROOT, { x: 0 }, { x: 7, duration: 0.05, repeat: 13, yoyo: true, ease: 'none' }, '<');
  tl.add(() => rootShards());
  // beam pulses while the search runs and gets nowhere
  tl.to(beamLine, { attr: { 'stroke-width': 5 }, duration: 0.18, repeat: 5, yoyo: true, ease: 'sine.inOut' });
  tl.add(() => rootShards());
  tl.to({}, { duration: 0.8 }); // search holds — never converges

  // ---- DEFENSE: search fails, beam repelled, tree hardens ----
  tl.add(() => revealCallout(4));
  // declare failure: scan flatlines, period resolves to ∅
  tl.add(() => { stopScan(); stopRootChaos(); });
  tl.to(sbarEls, { scaleY: 0.04, duration: 0.4, stagger: { each: 0.01, from: 'edges' } });
  tl.to('#qs-stat', { duration: 0.1, onStart() { const e = document.getElementById('qs-stat'); e.textContent = 'NO PERIOD'; e.style.color = 'var(--gold)'; } }, '<');
  tl.to('#qs-r', { duration: 0.1, onStart() { const e = document.getElementById('qs-r'); e.textContent = '∅'; e.style.color = 'var(--gold)'; } }, '<');
  // root hardens to gold
  tl.to(node.ROOT, { borderColor: 'var(--gold)', color: 'var(--gold)', boxShadow: '0 0 30px var(--gold)', duration: 0.4 });
  // beam repelled — retracts and recoils the machine
  tl.to(beamLine, { strokeDashoffset: () => parseFloat(beamLine.dataset.len), duration: 0.4, ease: 'power3.in' }, '<');
  tl.to(beamLine, { opacity: 0, duration: 0.2 });
  tl.to('#qmachine2', { y: -70, opacity: 0.35, duration: 0.45, ease: 'power3.in' }, '<');
  tl.to('#qscan', { opacity: 0.4, y: -8, duration: 0.4 }, '<');
  // golden defense ripple cascades root → leaves
  tl.to([links[0], links[1]], { stroke: 'var(--gold)', duration: 0.22 });
  tl.to([links[2], links[3], links[4], links[5]], { stroke: 'var(--gold)', duration: 0.22, stagger: 0.07 });
  tl.to([node.H01, node.H23], { borderColor: 'var(--gold)', color: 'var(--gold)', boxShadow: '0 0 18px var(--gold-soft)', duration: 0.3 }, '<');
  tl.to(leafEls, { borderColor: 'var(--secure)', color: 'var(--secure)', boxShadow: '0 0 18px var(--secure-soft)', duration: 0.3, stagger: 0.06 }, '<');
  tl.add(() => burst());
  tl.to(links, { stroke: 'var(--line-strong)', duration: 0.6 }, '+=0.1');

  // shield scales in + particle burst
  tl.to('#shield', { scale: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, '<');
  tl.add(() => burst());
  // SECURED stamp
  tl.to('#secured-stamp', { opacity: 1, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' }, '>-0.1');
  tl.to('#merkle-status', { opacity: 1, duration: 0.4 }, '<');
  tl.to('#merkle-foot', { opacity: 1, duration: 0.4 }, '<0.1');

  // particle burst from shield center
  function burst() {
    const s = stage.getBoundingClientRect();
    const cx = s.width / 2, cy = s.height / 2;
    for (let i = 0; i < 28; i++) {
      const p = QL.el('div');
      p.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:5px;height:5px;border-radius:50%;
        background:var(--gold);box-shadow:0 0 10px var(--gold);pointer-events:none;z-index:7;`;
      stage.appendChild(p);
      const ang = (i / 28) * Math.PI * 2, dist = QL.rnd(120, 260);
      gsap.to(p, { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist, opacity: 0, scale: 0,
        duration: QL.rnd(0.7, 1.2), ease: 'power3.out', onComplete: () => p.remove() });
    }
  }
};
