/* ============================================================
   SECTION 2 — RSA  ·  the lock built from primes
   pinned + scrub timeline
   ============================================================ */
window.QL_rsa = function (gsap, ScrollTrigger) {
  const D = QL_DATA.rsa;

  // measure transform delta between centers of two elements
  function delta(from, to) {
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    return { dx: (b.left + b.width / 2) - (a.left + a.width / 2),
             dy: (b.top + b.height / 2) - (a.top + a.height / 2) };
  }

  // ---- build the number grid 1..15, primes 3 & 5 flagged ----
  const grid = document.getElementById('rsa-grid');
  const cells = [];
  for (let i = 1; i <= 15; i++) {
    const c = QL.el('div', 'cell', String(i));
    if (i === D.p || i === D.q) c.classList.add('prime');
    grid.appendChild(c);
    cells.push(c);
  }
  const primeCells = cells.filter((c) => c.classList.contains('prime'));

  // beam draw prep
  const beam = document.getElementById('beam-trace');
  QL.prepDraw(beam);

  const callouts = gsap.utils.toArray('#rsa-callouts .callout');
  gsap.set(callouts, { opacity: 0.18, x: -10 });
  gsap.set('#rsa-status', { opacity: 0, scale: 0.9 });
  gsap.set('#rsa-foot', { opacity: 0 });
  gsap.set(cells, { opacity: 0, scale: 0.3 });
  gsap.set('#rsa-N', { scale: 0, opacity: 0 });
  gsap.set('#rsa-msg, #rsa-cipher', { opacity: 0, y: 12 });

  function revealCallout(i) {
    callouts.forEach((c, k) => gsap.to(c, { opacity: k === i ? 1 : 0.2, x: k === i ? 0 : -10, duration: 0.3 }));
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#rsa', start: 'top top', end: '+=2800',
      pin: true, scrub: 1, invalidateOnRefresh: true,
    },
    defaults: { ease: 'power2.out' },
  });

  // 0 — primes float / orbit in
  tl.add(() => revealCallout(0));
  tl.from(['#rsa-p', '#rsa-q'], { opacity: 0, scale: 0.4, duration: 0.6, stagger: 0.1 }, 0);
  // gentle elliptical orbit via MotionPathPlugin (relative arcs)
  tl.to('#rsa-p', { motionPath: { path: [{ x: 40, y: 30 }, { x: 10, y: 70 }, { x: 0, y: 0 }], curviness: 1.4 }, duration: 1.0 }, 0.2);
  tl.to('#rsa-q', { motionPath: { path: [{ x: -40, y: 30 }, { x: -10, y: 70 }, { x: 0, y: 0 }], curviness: 1.4 }, duration: 1.0 }, 0.2);

  // 1 — multiply into N
  tl.add(() => revealCallout(1), '>-0.1');
  tl.to('#rsa-p', { x: () => delta(document.getElementById('rsa-p'), document.getElementById('rsa-N')).dx,
                    y: () => delta(document.getElementById('rsa-p'), document.getElementById('rsa-N')).dy,
                    scale: 0.5, opacity: 0, duration: 0.7, ease: 'power2.in' });
  tl.to('#rsa-q', { x: () => delta(document.getElementById('rsa-q'), document.getElementById('rsa-N')).dx,
                    y: () => delta(document.getElementById('rsa-q'), document.getElementById('rsa-N')).dy,
                    scale: 0.5, opacity: 0, duration: 0.7, ease: 'power2.in' }, '<');
  tl.to('#rsa-N', { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)' }, '>-0.1');
  tl.from('#rsa-N', { boxShadow: '0 0 60px var(--quantum)', duration: 0.4 }, '<');

  // 2 — private key materializes from N
  tl.add(() => revealCallout(2));
  tl.set('#rsa-key', { x: 0, y: -120, opacity: 0, scale: 0.3 });
  tl.to('#rsa-key', { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' });

  // grid tiles in row by row + primes pulse
  tl.to(cells, { opacity: 1, scale: 1, duration: 0.5, stagger: { each: 0.04, grid: [3, 5], from: 'start' } }, '>-0.1');
  tl.to(primeCells, { scale: 1.18, repeat: 3, yoyo: true, duration: 0.35,
    boxShadow: '0 0 26px var(--quantum)', ease: 'sine.inOut' }, '>');

  // 3 — encryption beam message → cipher
  tl.add(() => revealCallout(3));
  tl.to('#rsa-msg', { opacity: 1, y: 0, duration: 0.4 });
  tl.to('#rsa-cipher', { opacity: 1, y: 0, duration: 0.4 }, '<0.1');
  tl.to(beam, { strokeDashoffset: 0, duration: 0.9, ease: 'power1.inOut' }, '<');
  // scramble message characters as the beam passes
  const msg = document.getElementById('rsa-msg');
  const scrambleProxy = { p: 0 };
  tl.to(scrambleProxy, {
    p: 1, duration: 0.9, ease: 'none',
    onUpdate() {
      const chars = '#@$%&*01x±§';
      let out = ''; const t = 'CIPHER·' + D.cipher;
      for (let i = 0; i < 9; i++) out += scrambleProxy.p > 0.9 ? (t[i] || '') : QL.pick(chars.split(''));
      msg.textContent = out || 'MESSAGE';
    },
  }, '<');
  tl.set(msg, { onComplete: () => {} });

  // 4 — SECURE
  tl.to('#rsa-status', { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' });
  tl.to('#rsa-foot', { opacity: 1, duration: 0.5 }, '<0.1');
  tl.to('#rsa-N', { boxShadow: '0 0 40px var(--secure)', borderColor: 'var(--secure)', color: 'var(--secure)', duration: 0.5 }, '<');
  tl.to('#orbit-l', { stroke: 'var(--secure)', duration: 0.5 }, '<');
};
