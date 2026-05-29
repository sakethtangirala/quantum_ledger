/* ============================================================
   THE QUANTUM LEDGER — orchestrator
   ============================================================ */
(function () {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, TextPlugin);

  gsap.config({ nullTargetWarn: false });
  ScrollTrigger.config({ ignoreMobileResize: true });

  // chapter labels keyed by scene id
  const chapters = [
    ['hero',   '01', 'the ledger'],
    ['rsa',    '02', 'the lock'],
    ['shor',   '03', 'the attack'],
    ['merkle', '04', 'the defense'],
    ['outro',  '05', 'the verdict'],
  ];

  function boot() {
    if (window.__qlBooted) return;
    window.__qlBooted = true;
    window.__qlErrors = [];
    const run = (name, fn) => { try { fn(gsap, ScrollTrigger); } catch (e) { window.__qlErrors.push(name + ': ' + e.message + ' | ' + (e.stack || '').split('\n')[1]); console.error(name, e); } };
    run('hero', QL_hero);
    run('rsa', QL_rsa);
    run('shor', QL_shor);
    run('merkle', QL_merkle);
    run('outro', QL_outro);

    // global progress rail
    const rail = document.querySelector('#rail > i');
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => { rail.style.width = (self.progress * 100).toFixed(2) + '%'; },
    });

    // chapter indicator
    const cn = document.getElementById('chapter-n');
    const cname = document.getElementById('chapter-name');
    chapters.forEach(([id, n, name]) => {
      ScrollTrigger.create({
        trigger: '#' + id, start: 'top center', end: 'bottom center',
        onToggle: (self) => { if (self.isActive) { cn.textContent = n; cname.textContent = name; } },
      });
    });

    // ensure everything measured once fonts/layout settle
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  // wait for fonts so split-text metrics are correct
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
    setTimeout(boot, 1500); // safety if fonts hang
  } else {
    window.addEventListener('load', boot);
  }
})();
