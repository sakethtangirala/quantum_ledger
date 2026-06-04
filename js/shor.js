window.QL_shor = function(gsap, ScrollTrigger) {
  const S = QL_DATA.shor;
  const stepWrap = document.getElementById('shor-steps');
  S.steps.forEach(s => {
    const row = QL.el('div', 'shor-step',
      `<b class="mono">${s.n}</b><div><span class="st">${s.title}</span><em class="sb mono">${s.body}</em></div>`);
    stepWrap.appendChild(row);
  });
  const stepEls = gsap.utils.toArray('#shor-steps .shor-step');
  gsap.set(stepEls, {opacity:0, x:-10});
  gsap.set('#broken-stamp', {opacity:0, scale:2.6, rotate:-9});
  gsap.set('#shor-result', {opacity:0, y:20});
  gsap.set('#shor-status', {opacity:0, scale:0});
  const tl = gsap.timeline({
    scrollTrigger:{
      trigger:'#shor', start:'top top', end:'+=3400',
      pin:true, scrub:1.5, invalidateOnRefresh:true,
      onUpdate:self => { if (window.QL_Three) QL_Three.updateShor(self.progress); },
    },
    defaults:{ease:'none'},
  });
  stepEls.forEach((s, i) => {
    if (i > 0) tl.to(stepEls[i-1], {opacity:0.28, x:-4, duration:0.35});
    tl.to(s, {opacity:1, x:0, duration:0.5}, i===0?0:'<0.1');
    tl.to({}, {duration:0.75});
  });
  tl.to('#broken-stamp', {opacity:1, scale:1, rotate:-9, duration:0.6});
  tl.to('#shor-status', {opacity:1, scale:1, duration:0.5}, '<0.1');
  tl.to('#shor-result', {opacity:1, y:0, duration:0.5}, '<0.1');
  tl.to({}, {duration:2.0});
};
