window.QL_merkle = function(gsap, ScrollTrigger) {
  const M = QL_DATA.merkle;
  const stage = document.getElementById('merkle-stage');
  const txHost = document.getElementById('tx-cards');
  M.txs.forEach(t => {
    const c = QL.el('div', 'tx-card', `<div class="id">${t.id}</div><div class="lab">${t.label}</div>`);
    txHost.appendChild(c);
  });
  const txEls = gsap.utils.toArray('#tx-cards .tx-card');
  const callouts = gsap.utils.toArray('#merkle-callouts .callout');
  const sbarWrap = document.getElementById('qs-bars');
  for (let i=0; i<12; i++) { const b=QL.el('div','sbar'); b.style.height='100%'; sbarWrap.appendChild(b); }
  const sbarEls = gsap.utils.toArray('#qs-bars .sbar');
  gsap.set(txEls, {x:-50, opacity:0});
  gsap.set(callouts, {opacity:0, x:-10});
  gsap.set('#merkle-status, #merkle-foot', {opacity:0});
  gsap.set('#shield', {scale:0, opacity:0});
  gsap.set('#secured-stamp', {opacity:0, scale:2.6});
  gsap.set('#qscan', {opacity:0, y:-10});
  gsap.set(sbarEls, {scaleY:0.04});
  let rootLoop=null, scanLoop=null;
  const qsStatEl=document.getElementById('qs-stat');
  const rOut=document.getElementById('qs-r');
  const candidates=[2,3,5,6,7,9,11,13];
  function startRootChaos() {
    stopRootChaos();
    rootLoop=gsap.to({},{duration:0.08,repeat:-1,onRepeat(){if(qsStatEl)qsStatEl.style.color='var(--broken)';}});
  }
  function stopRootChaos() {
    if(rootLoop){rootLoop.kill();rootLoop=null;}
    if(qsStatEl)qsStatEl.style.color='';
  }
  function startScan() {
    stopScan();
    const st=document.getElementById('qs-stat');
    if(st){st.textContent='SCANNING';st.style.color='var(--broken)';}
    if(rOut)rOut.style.color='var(--broken)';
    scanLoop=gsap.to({},{duration:0.07,repeat:-1,onRepeat(){
      sbarEls.forEach(b=>gsap.set(b,{scaleY:0.06+Math.random()*Math.random()*0.55}));
      if(rOut)rOut.textContent=candidates[(Math.random()*candidates.length)|0];
    }});
  }
  function stopScan(){if(scanLoop){scanLoop.kill();scanLoop=null;}}
  const tl=gsap.timeline({
    scrollTrigger:{
      trigger:'#merkle',start:'top top',end:'+=4600',
      pin:true,scrub:1.5,invalidateOnRefresh:true,
      onUpdate:self=>{if(window.QL_Three)QL_Three.updateMerkle(self.progress);},
    },
    defaults:{ease:'none'},
  });
  tl.to(callouts[0], {opacity:1, x:0, duration:0.5});
  tl.to(txEls, {x:0, opacity:1, duration:0.5, stagger:0.1}, '<0.1');
  tl.to({}, {duration:0.8});
  tl.to(callouts[0], {opacity:0.15, x:-6, duration:0.4});
  tl.to(callouts[1], {opacity:1, x:0, duration:0.5}, '<0.1');
  tl.to({}, {duration:0.8});
  tl.to(callouts[1], {opacity:0.15, x:-6, duration:0.4});
  tl.to(callouts[2], {opacity:1, x:0, duration:0.5}, '<0.1');
  tl.to({}, {duration:0.8});
  tl.to(callouts[2], {opacity:0.15, x:-6, duration:0.4});
  tl.to(callouts[3], {opacity:1, x:0, duration:0.5}, '<0.1');
  tl.to('#qscan', {opacity:1, y:0, duration:0.5}, '<0.2');
  tl.to({}, {duration:0.5});
  tl.add(()=>{startScan();startRootChaos();});
  tl.to({}, {duration:0.05*14});
  tl.to({}, {duration:0.18*6});
  tl.to({}, {duration:0.8});
  tl.to(callouts[3], {opacity:0.15, x:-6, duration:0.4});
  tl.to(callouts[4], {opacity:1, x:0, duration:0.5}, '<0.1');
  tl.add(()=>{stopScan();stopRootChaos();});
  tl.to(sbarEls, {scaleY:0.04, duration:0.5, stagger:{each:0.01, from:'edges'}});
  tl.to('#qs-stat', {duration:0.1, onStart(){
    const e=document.getElementById('qs-stat');
    if(e){e.textContent='NO PERIOD';e.style.color='var(--gold)';}
  }}, '<');
  tl.to('#qs-r', {duration:0.1, onStart(){
    const e=document.getElementById('qs-r');
    if(e){e.textContent='∅';e.style.color='var(--gold)';}
  }}, '<');
  tl.to({}, {duration:0.6});
  tl.to('#qscan', {opacity:0.4, y:-8, duration:0.5}, '<');
  tl.to({}, {duration:0.4});
  tl.add(()=>burst());
  tl.to({}, {duration:0.5});
  tl.to('#shield', {scale:1, opacity:1, duration:0.7}, '<');
  tl.add(()=>burst());
  tl.to('#secured-stamp', {opacity:1, scale:1, duration:0.6}, '>-0.1');
  tl.to('#merkle-status', {opacity:1, duration:0.5}, '<');
  tl.to('#merkle-foot', {opacity:1, duration:0.5}, '<0.1');
  tl.to({}, {duration:2.0});
  function burst() {
    const s=stage.getBoundingClientRect();
    const cx=s.width/2, cy=s.height/2;
    for (let i=0; i<28; i++) {
      const p=QL.el('div');
      p.style.cssText=`position:absolute;left:${cx}px;top:${cy}px;width:5px;height:5px;border-radius:50%;background:var(--gold);box-shadow:0 0 10px var(--gold);pointer-events:none;z-index:7;`;
      stage.appendChild(p);
      const ang=(i/28)*Math.PI*2, dist=QL.rnd(120,260);
      gsap.to(p,{x:Math.cos(ang)*dist,y:Math.sin(ang)*dist,opacity:0,scale:0,duration:QL.rnd(0.7,1.2),ease:'power3.out',onComplete:()=>p.remove()});
    }
  }
};
