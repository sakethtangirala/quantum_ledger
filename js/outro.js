/* ============================================================
   SECTION 5 — OUTRO  ·  split comparison + reassembly
   pinned + scrub timeline
   ============================================================ */
window.QL_outro = function (gsap, ScrollTrigger) {
  const C = QL_DATA.compare;

  // build comparison rows
  function rows(host, d) {
    [['basis', 'problem'], ['classical', 'classical'], ['quantum', 'quantum']].forEach(([key, label]) => {
      const r = QL.el('div', 'cmp-row', `<span class="ck">${label}</span><span class="cv">${d[key]}</span>`);
      host.appendChild(r);
    });
  }
  rows(document.getElementById('cmp-rsa'), C.rsa);
  rows(document.getElementById('cmp-merkle'), C.merkle);

  // ambient lattice for bookend
  const lat = QL.buildLattice(document.getElementById('outro-lattice'), { count: 110, linkDist: 0.13 });
  lat.dots.forEach((d) => gsap.to(d, { opacity: QL.rnd(0.2, 0.8), duration: QL.rnd(1.8, 3.6), yoyo: true, repeat: -1, ease: 'sine.inOut', delay: QL.rnd(0, 2) }));

  // tagline words
  const words = QL.splitWords(document.getElementById('outro-tagline'));
  const credits = gsap.utils.toArray('#credits span');

  // initial states
  gsap.set('#split-rsa', { x: -80, opacity: 0 });
  gsap.set('#split-merkle', { x: 80, opacity: 0 });
  gsap.set('.split-rule', { scaleY: 0, transformOrigin: 'center' });
  gsap.set('#cmp-rsa .cmp-row, #cmp-merkle .cmp-row', { opacity: 0, y: 14 });
  gsap.set(['#split-rsa .status', '#split-merkle .status', '#split-rsa .cmp-name', '#split-merkle .cmp-name', '#split-rsa .eyebrow', '#split-merkle .eyebrow'], { opacity: 0, y: 10 });
  gsap.set('#ledger-icon', { scale: 0, opacity: 0, rotate: -30 });
  gsap.set(words, { opacity: 0, y: 26 });
  gsap.set('#outro-note', { opacity: 0, y: 16 });
  gsap.set(credits, { opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: '#outro', start: 'top top', end: '+=3000', pin: true, scrub: 1, invalidateOnRefresh: true },
    defaults: { ease: 'power2.out' },
  });

  // halves slide in
  tl.to('.split-rule', { scaleY: 1, duration: 0.5 });
  tl.to('#split-rsa', { x: 0, opacity: 1, duration: 0.6 }, '<');
  tl.to('#split-merkle', { x: 0, opacity: 1, duration: 0.6 }, '<');
  tl.to(['#split-rsa .eyebrow', '#split-rsa .cmp-name'], { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 });
  tl.to(['#split-merkle .eyebrow', '#split-merkle .cmp-name'], { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '<');

  // bars fill
  tl.to('#bar-rsa', { width: C.rsa.vuln + '%', duration: 0.8, ease: 'power3.out' });
  tl.to('#bar-merkle', { width: C.merkle.vuln + '%', duration: 0.8, ease: 'power3.out' }, '<');

  // stat rows reveal
  tl.to('#cmp-rsa .cmp-row', { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, '<0.1');
  tl.to('#cmp-merkle .cmp-row', { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, '<');
  tl.to(['#split-rsa .status', '#split-merkle .status'], { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 });

  tl.to({}, { duration: 0.6 });

  // ---- transition to final reassembly ----
  tl.to('#split', { opacity: 0, scale: 0.94, duration: 0.6 });
  tl.to('#outro-lattice', { opacity: 1, duration: 0.8 }, '<');
  tl.set('#outro-final', { pointerEvents: 'auto' });
  tl.to('#outro-final', { opacity: 1, duration: 0.5 }, '<0.2');
  tl.to('#ledger-icon', { scale: 1, opacity: 1, rotate: 0, duration: 0.8, ease: 'elastic.out(1, 0.55)' });
  // tagline word by word
  tl.to(words, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'back.out(1.7)' }, '>-0.2');
  tl.to('#outro-note', { opacity: 1, y: 0, duration: 0.5 }, '>-0.1');
  tl.to(credits, { opacity: 1, duration: 0.5, stagger: 0.08 }, '>-0.1');
};
