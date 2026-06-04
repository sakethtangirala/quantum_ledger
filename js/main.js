(function() {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, TextPlugin);
  gsap.config({nullTargetWarn:false});
  ScrollTrigger.config({ignoreMobileResize:true});
  async function boot() {
    if (window.__qlBooted) return;
    window.__qlBooted = true;
    window.__qlErrors = [];
    if (window.QL_DATA_PROMISE) {
      try { await window.QL_DATA_PROMISE; } catch(_) {}
    }
    const run = (name, fn) => { try { fn(gsap, ScrollTrigger); } catch(e) { window.__qlErrors.push(name+': '+e.message); console.error(name, e); } };
    run('hero', QL_hero);
    run('rsa', QL_rsa);
    run('shor', QL_shor);
    run('merkle', QL_merkle);
    const rail = document.querySelector('#rail > i');
    ScrollTrigger.create({
      start:0, end:'max',
      onUpdate:self => { rail.style.width = (self.progress*100).toFixed(2)+'%'; },
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
    setTimeout(boot, 1500);
  } else {
    window.addEventListener('load', boot);
  }
})();
