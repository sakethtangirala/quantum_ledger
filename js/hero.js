window.QL_hero = function(gsap, ScrollTrigger) {
  const host = document.getElementById('global-lattice');
  const lattice = QL.buildLattice(host, {count:160, linkDist:0.14});
  const chars = QL.splitChars(document.getElementById('hero-title'));
  const intro = gsap.timeline({defaults:{ease:'power3.out'}});
  intro.from(lattice.dots, {
    x:()=>QL.rnd(-window.innerWidth*0.5, window.innerWidth*0.5),
    y:()=>QL.rnd(-window.innerHeight*0.5, window.innerHeight*0.5),
    opacity:0, duration:1.8, ease:'power2.out',
    stagger:{each:0.004, from:'random'},
  }, 0);
  intro.from(lattice.links, {opacity:0, duration:1.4, stagger:{each:0.002, from:'random'}}, 0.7);
  intro.from(chars, {
    yPercent:120, opacity:0, rotateX:-80,
    duration:0.9, ease:'back.out(1.7)',
    stagger:{each:0.045, from:'start'},
  }, 0.7);
  intro.from('#hero-sub', {opacity:0, y:18, duration:0.9}, '-=0.5');
  lattice.dots.forEach(d => {
    gsap.to(d, {opacity:QL.rnd(0.25,0.9), scale:QL.rnd(0.7,1.35), duration:QL.rnd(1.6,3.6), ease:'sine.inOut', yoyo:true, repeat:-1, delay:QL.rnd(0,2)});
  });
  gsap.timeline({scrollTrigger:{trigger:'#hero', start:'top top', end:'bottom top', scrub:1.2}})
    .to('.hero-stack', {y:-80, scale:0.92, opacity:0, ease:'none'}, 0);
};
