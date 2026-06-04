window.QL_rsa = function(gsap, ScrollTrigger) {
  const callouts = gsap.utils.toArray('#rsa-callouts .callout');
  gsap.set(callouts, {opacity:0, x:-12});
  gsap.set('#rsa-status', {opacity:0, scale:0.88});
  gsap.set('#rsa-foot', {opacity:0});
  const tl = gsap.timeline({
    scrollTrigger:{
      trigger:'#rsa', start:'top top', end:'+=2800',
      pin:true, scrub:1.5, invalidateOnRefresh:true,
      onUpdate:self => { if (window.QL_Three) QL_Three.updateRSA(self.progress); },
    },
    defaults:{ease:'none'},
  });
  tl.to(callouts[0], {opacity:1, x:0, duration:0.6});
  tl.to({}, {duration:1.0});
  tl.to(callouts[0], {opacity:0.15, x:-6, duration:0.4});
  tl.to(callouts[1], {opacity:1, x:0, duration:0.6}, '<0.15');
  tl.to({}, {duration:1.0});
  tl.to(callouts[1], {opacity:0.15, x:-6, duration:0.4});
  tl.to(callouts[2], {opacity:1, x:0, duration:0.6}, '<0.15');
  tl.to({}, {duration:1.0});
  tl.to(callouts[2], {opacity:0.15, x:-6, duration:0.4});
  tl.to(callouts[3], {opacity:1, x:0, duration:0.6}, '<0.15');
  tl.to({}, {duration:1.2});
  tl.to('#rsa-status', {opacity:1, scale:1, duration:0.7});
  tl.to('#rsa-foot', {opacity:1, duration:0.6}, '<0.1');
};
