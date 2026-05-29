/* ============================================================
   SECTION 1 — HERO  ·  particle lattice + title entrance
   ============================================================ */
window.QL_hero = function (gsap, ScrollTrigger) {
  const host = document.getElementById('hero-lattice');
  const lattice = QL.buildLattice(host, { count: 160, linkDist: 0.14 });

  // title split
  const title = document.getElementById('hero-title');
  const chars = QL.splitChars(title);

  // underline draw prep
  const underline = document.querySelector('#hero-underline path');
  QL.prepDraw(underline);

  // ---- intro timeline (auto-plays on load) ----
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // dots drift in from random edge offsets, converge to lattice positions
  intro.from(lattice.dots, {
    x: () => QL.rnd(-window.innerWidth * 0.5, window.innerWidth * 0.5),
    y: () => QL.rnd(-window.innerHeight * 0.5, window.innerHeight * 0.5),
    opacity: 0,
    duration: 1.8,
    ease: 'power2.out',
    stagger: { each: 0.004, from: 'random' },
  }, 0);

  intro.from(lattice.links, {
    opacity: 0, duration: 1.4, stagger: { each: 0.002, from: 'random' },
  }, 0.7);

  // eyebrow
  intro.to('#hero-eyebrow', { opacity: 1, y: 0, duration: 0.8 }, 0.5);

  // title letters rise + fade in
  intro.from(chars, {
    yPercent: 120, opacity: 0, rotateX: -80,
    duration: 0.9, ease: 'back.out(1.7)',
    stagger: { each: 0.045, from: 'start' },
  }, 0.7);

  // underline draws left→right
  intro.to(underline, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, '-=0.3');

  // subtitle
  intro.from('#hero-sub', { opacity: 0, y: 18, duration: 0.9 }, '-=0.5');
  intro.from('#hero-cue', { opacity: 0, duration: 0.8 }, '-=0.3');

  // ---- looping ambient pulses ----
  lattice.dots.forEach((d) => {
    gsap.to(d, {
      opacity: QL.rnd(0.25, 0.9),
      scale: QL.rnd(0.7, 1.35),
      duration: QL.rnd(1.6, 3.6),
      ease: 'sine.inOut',
      yoyo: true, repeat: -1, delay: QL.rnd(0, 2),
    });
  });

  // scroll-cue arrow bounce
  gsap.to('#hero-cue .arrow', {
    y: 10, opacity: 0.4, duration: 1, ease: 'sine.inOut', yoyo: true, repeat: -1,
  });
  gsap.to('#hero-cue span', { opacity: 0.55, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });

  // ---- scroll-out: hero recedes as you scroll past ----
  gsap.timeline({
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
  })
    .to('.hero-stack', { y: -80, scale: 0.92, opacity: 0, ease: 'none' }, 0)
    .to('#hero-cue', { opacity: 0, ease: 'none' }, 0)
    .to(host, { scale: 1.25, opacity: 0.25, ease: 'none' }, 0);
};
