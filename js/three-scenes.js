(function() {
  'use strict';
  if (typeof THREE === 'undefined') return;
  const C = {
    quantum:0x2563eb, qDark:0xe8e8e8, secure:0x16a34a,
    broken:0xc53030, gold:0xa16207, ink:0x0d0d0d, inkDim:0x666666, line:0xbbbbbb,
  };
  function sphere(r, color, emissive, segments) {
    const geo = new THREE.SphereGeometry(r, segments||16, segments||16);
    const mat = new THREE.MeshPhongMaterial({color, emissive:emissive||0x000000, emissiveIntensity:0.4, transparent:true, opacity:1});
    return new THREE.Mesh(geo, mat);
  }
  function box(w, h, d, color, emissive) {
    const geo = new THREE.BoxGeometry(w,h,d);
    const mat = new THREE.MeshPhongMaterial({color, emissive:emissive||0x000000, emissiveIntensity:0.3, transparent:true, opacity:1});
    return new THREE.Mesh(geo, mat);
  }
  function tube(p1, p2, radius, color) {
    const start=new THREE.Vector3(...p1), end=new THREE.Vector3(...p2);
    const dir=new THREE.Vector3().subVectors(end,start);
    const len=dir.length();
    const mid=new THREE.Vector3().addVectors(start,end).multiplyScalar(0.5);
    const geo=new THREE.CylinderGeometry(radius,radius,len,6,1);
    const mat=new THREE.MeshPhongMaterial({color, transparent:true, opacity:0.8});
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize());
    return mesh;
  }
  function textTex(text, fgColor) {
    const canvas=document.createElement('canvas');
    canvas.width=256; canvas.height=128;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,256,128);
    ctx.fillStyle=fgColor||'#0d0d0d';
    ctx.font='bold 42px "Graphik", system-ui, sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(text,128,64);
    return new THREE.CanvasTexture(canvas);
  }
  function labelPlane(text, w, h, fgColor) {
    const geo=new THREE.PlaneGeometry(w||0.8, h||0.4);
    const mat=new THREE.MeshBasicMaterial({map:textTex(text,fgColor), transparent:true, side:THREE.DoubleSide, depthWrite:false});
    return new THREE.Mesh(geo,mat);
  }
  function edgesOf(mesh, color) {
    const edges=new THREE.EdgesGeometry(mesh.geometry);
    return new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color}));
  }
  function createScene(canvasEl) {
    const renderer=new THREE.WebGLRenderer({canvas:canvasEl, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setClearColor(0x000000,0);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(45,1,0.1,100);
    camera.position.set(0,0,7);
    scene.add(new THREE.AmbientLight(0xffffff,0.7));
    const pLight=new THREE.PointLight(0x6688cc,1.6,20);
    pLight.position.set(3,4,5);
    scene.add(pLight);
    const worldGroup=new THREE.Group();
    scene.add(worldGroup);
    let dragging=false, lastX=0, lastY=0, velX=0, velY=0;
    const rotX={v:0}, rotY={v:0};
    function onPointerDown(e) {
      dragging=true;
      const pt=e.touches?e.touches[0]:e;
      lastX=pt.clientX; lastY=pt.clientY;
      velX=0; velY=0;
      canvasEl.style.cursor='grabbing';
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const pt=e.touches?e.touches[0]:e;
      const dx=pt.clientX-lastX, dy=pt.clientY-lastY;
      lastX=pt.clientX; lastY=pt.clientY;
      velX=dy*0.006; velY=dx*0.006;
      rotX.v=Math.max(-1.1,Math.min(1.1,rotX.v+velX));
      rotY.v+=velY;
    }
    function onPointerUp() { dragging=false; canvasEl.style.cursor='grab'; }
    canvasEl.addEventListener('mousedown', onPointerDown);
    canvasEl.addEventListener('mousemove', onPointerMove);
    canvasEl.addEventListener('mouseup', onPointerUp);
    canvasEl.addEventListener('mouseleave', onPointerUp);
    canvasEl.addEventListener('touchstart', onPointerDown, {passive:true});
    canvasEl.addEventListener('touchmove', onPointerMove, {passive:true});
    canvasEl.addEventListener('touchend', onPointerUp);
    canvasEl.style.cursor='grab';
    function resize() {
      const w=canvasEl.clientWidth, h=canvasEl.clientHeight;
      if (w===0||h===0) { requestAnimationFrame(resize); return; }
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      camera.updateProjectionMatrix();
    }
    const ro=new ResizeObserver(resize);
    ro.observe(canvasEl);
    resize();
    setTimeout(resize,200);
    const ctx={renderer, scene, camera, worldGroup, dragging:()=>dragging, rotX, rotY,
      velX:()=>velX, velY:()=>velY, setVelX:v=>{velX=v;}, setVelY:v=>{velY=v;}, onTick:null, time:0};
    function animate() {
      ctx.animId=requestAnimationFrame(animate);
      ctx.time+=0.016;
      if (!dragging) {
        velX*=0.92; velY*=0.92;
        rotX.v=Math.max(-1.1,Math.min(1.1,rotX.v+velX));
        rotY.v+=velY;
      }
      worldGroup.rotation.x=rotX.v;
      worldGroup.rotation.y=rotY.v;
      if (ctx.onTick) ctx.onTick(ctx.time);
      renderer.render(scene,camera);
    }
    animate();
    canvasEl._qlCtx=ctx;
    return ctx;
  }
  let rsaCtx=null;
  const rsaObj={};
  function initRSA() {
    const canvas=document.getElementById('rsa-three');
    if (!canvas) return;
    const ctx=createScene(canvas);
    rsaCtx=ctx;
    ctx.worldGroup.position.y=0.3;
    const wg=ctx.worldGroup;
    const ringGeo=new THREE.TorusGeometry(2.1,0.018,10,90);
    const ringMat=new THREE.MeshPhongMaterial({color:C.quantum, transparent:true, opacity:0});
    rsaObj.orbitRing=new THREE.Mesh(ringGeo,ringMat);
    rsaObj.orbitRing.rotation.x=0.5;
    wg.add(rsaObj.orbitRing);
    rsaObj.primeP=sphere(0.48,C.quantum,C.quantum,24);
    rsaObj.primeP.position.set(-2.1,1.2,0);
    rsaObj.primeP.scale.setScalar(0);
    const labelP=labelPlane('p=3',0.7,0.35,'#2563eb');
    labelP.position.set(0,0.72,0);
    rsaObj.primeP.add(labelP);
    wg.add(rsaObj.primeP);
    rsaObj.primeQ=sphere(0.48,C.quantum,C.quantum,24);
    rsaObj.primeQ.position.set(2.1,1.2,0);
    rsaObj.primeQ.scale.setScalar(0);
    const labelQ=labelPlane('q=5',0.7,0.35,'#2563eb');
    labelQ.position.set(0,0.72,0);
    rsaObj.primeQ.add(labelQ);
    wg.add(rsaObj.primeQ);
    rsaObj.modN=sphere(0.82,C.ink,0x223388,32);
    rsaObj.modN.scale.setScalar(0);
    const labelN=labelPlane('N=15',1.0,0.45,'#0d0d0d');
    labelN.position.set(0,1.1,0);
    rsaObj.modN.add(labelN);
    wg.add(rsaObj.modN);
    rsaObj.gridGrp=new THREE.Group();
    rsaObj.gridGrp.position.set(0,-2.0,0);
    rsaObj.gridGrp.scale.setScalar(0);
    rsaObj.gridTiles=[];
    for (let i=0; i<15; i++) {
      const num=i+1, col=i%5, row=Math.floor(i/5);
      const isPrime=(num===3||num===5);
      const tile=box(0.42,0.42,0.12, isPrime?C.quantum:0xdddddd, isPrime?C.quantum:0x000000);
      tile.material.emissiveIntensity=isPrime?0.3:0;
      tile.position.set((col-2)*0.52,(1-row)*0.52,0);
      tile.scale.setScalar(0);
      const lbl=labelPlane(String(num),0.36,0.3,isPrime?'#ffffff':'#666666');
      lbl.position.set(0,0,0.07);
      tile.add(lbl);
      rsaObj.gridTiles.push(tile);
      rsaObj.gridGrp.add(tile);
    }
    wg.add(rsaObj.gridGrp);
    const keyGeo=new THREE.TorusKnotGeometry(0.34,0.09,80,10);
    const keyMat=new THREE.MeshPhongMaterial({color:C.secure, emissive:C.secure, emissiveIntensity:0.3, transparent:true, opacity:0});
    rsaObj.keyMesh=new THREE.Mesh(keyGeo,keyMat);
    rsaObj.keyMesh.position.set(2.4,0.4,0);
    rsaObj.keyMesh.scale.setScalar(0);
    const labelKey=labelPlane('d=7',0.7,0.35,'#16a34a');
    labelKey.position.set(0,0.7,0);
    rsaObj.keyMesh.add(labelKey);
    wg.add(rsaObj.keyMesh);
    rsaObj.beamGrp=new THREE.Group();
    rsaObj.beamBeads=[];
    for (let i=0; i<10; i++) {
      const bead=sphere(0.055,C.quantum,C.quantum,8);
      bead.visible=false;
      rsaObj.beamBeads.push(bead);
      rsaObj.beamGrp.add(bead);
    }
    wg.add(rsaObj.beamGrp);
    rsaObj._phase=0;
    rsaObj._beamT=0;
    ctx.onTick=function(time) {
      if (rsaObj._phase>=1) {
        const angle=time*0.7;
        rsaObj.primeP.position.set(Math.cos(angle)*2.1, Math.sin(angle*0.4)*0.8, Math.sin(angle)*0.63);
        rsaObj.primeQ.position.set(Math.cos(angle+Math.PI)*2.1, Math.sin((angle+Math.PI)*0.4)*0.8, Math.sin(angle+Math.PI)*0.63);
      }
      if (rsaObj.beamBeads[0]&&rsaObj.beamBeads[0].visible) {
        rsaObj._beamT=(rsaObj._beamT+0.025)%1;
        rsaObj.beamBeads.forEach((bead,i) => {
          const t=(rsaObj._beamT+i*0.1)%1;
          bead.position.set(-3.0+t*6.0, -1.5+Math.sin(t*Math.PI)*0.5, 0);
        });
      }
    };
  }
  function lerp(a,b,t) { return a+(b-a)*t; }
  function clamp01(v) { return Math.max(0,Math.min(1,v)); }
  function rangeProg(p,lo,hi) { return clamp01((p-lo)/(hi-lo)); }
  function updateRSA(progress) {
    if (!rsaCtx||!rsaObj.primeP) return;
    const t0=rangeProg(progress,0,0.18);
    const s0=t0;
    rsaObj.primeP.scale.setScalar(s0);
    rsaObj.primeQ.scale.setScalar(s0);
    rsaObj.orbitRing.material.opacity=t0*0.3;
    rsaObj._phase=0;
    if (progress>=0.18) rsaObj._phase=1;
    if (progress>=0.38) {
      rsaObj._phase=0;
      const t2=rangeProg(progress,0.38,0.56);
      const ps=lerp(1,0.2,t2);
      rsaObj.primeP.scale.setScalar(ps);
      rsaObj.primeQ.scale.setScalar(ps);
      rsaObj.modN.scale.setScalar(t2);
      rsaObj.gridGrp.scale.setScalar(Math.min(t2*1.5,1));
      rsaObj.gridTiles.forEach((tile,i) => {
        const delay=i/rsaObj.gridTiles.length*0.5;
        tile.scale.setScalar(clamp01((t2-delay)/0.5));
      });
    }
    if (progress>=0.56) {
      const t3=rangeProg(progress,0.56,0.76);
      rsaObj.keyMesh.scale.setScalar(t3);
      rsaObj.keyMesh.material.opacity=t3;
    }
    if (progress>=0.76) {
      const t4=rangeProg(progress,0.76,1.0);
      rsaObj.beamBeads.forEach(b=>{b.visible=true;});
      const r=Math.round(lerp(0x33,0x00,t4));
      const g=Math.round(lerp(0x44,0xff,t4));
      const bv=Math.round(lerp(0x77,0x00,t4));
      rsaObj.modN.material.emissive.setRGB(r/255,g/255,bv/255);
      rsaObj.modN.material.emissiveIntensity=lerp(0.2,0.8,t4);
    } else {
      rsaObj.beamBeads.forEach(b=>{b.visible=false;});
    }
  }
  let shorCtx=null;
  const shorObj={};
  function initShor() {
    const canvas=document.getElementById('shor-three');
    if (!canvas) return;
    const ctx=createScene(canvas);
    shorCtx=ctx;
    ctx.worldGroup.position.y=0.65;
    const wg=ctx.worldGroup;
    shorObj.qpuGrp=new THREE.Group();
    shorObj.qpuGrp.position.set(0,0.8,0);
    shorObj.qpuGrp.scale.setScalar(0);
    const qpuBody=box(3.2,2.0,1.0,C.qDark,0x000000);
    qpuBody.material.opacity=0.85;
    shorObj.qpuGrp.add(qpuBody);
    shorObj.qpuGrp.add(edgesOf(qpuBody,C.quantum));
    wg.add(shorObj.qpuGrp);
    shorObj.core=sphere(0.55,C.quantum,C.quantum,24);
    shorObj.core.position.set(0,0.8,0);
    shorObj.core.scale.setScalar(0);
    shorObj._coreBaseEmit=0.5;
    wg.add(shorObj.core);
    shorObj.finL=box(0.18,1.1,0.2,C.qDark,0x000000);
    shorObj.finL.position.set(-1.84,0.8,0);
    shorObj.finL.scale.setScalar(0);
    shorObj.finL.add(edgesOf(shorObj.finL,C.quantum));
    wg.add(shorObj.finL);
    shorObj.finR=box(0.18,1.1,0.2,C.qDark,0x000000);
    shorObj.finR.position.set(1.84,0.8,0);
    shorObj.finR.scale.setScalar(0);
    shorObj.finR.add(edgesOf(shorObj.finR,C.quantum));
    wg.add(shorObj.finR);
    shorObj.qubitGrp=new THREE.Group();
    shorObj.qubitGrp.position.set(0,-0.1,0.5);
    shorObj.qubitGrp.scale.setScalar(0);
    shorObj.qubits=[];
    for (let i=0; i<4; i++) {
      const q=sphere(0.14,C.quantum,C.quantum,12);
      q.position.set((i-1.5)*0.7,0,0);
      shorObj.qubits.push(q);
      shorObj.qubitGrp.add(q);
    }
    wg.add(shorObj.qubitGrp);
    shorObj.circuitGrp=new THREE.Group();
    shorObj.circuitGrp.scale.setScalar(0);
    const lineYs=[-0.45,-0.15,0.15,0.45];
    lineYs.forEach(y => {
      const lineGeo=new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.4,y+0.8,0.52),
        new THREE.Vector3(1.4,y+0.8,0.52),
      ]);
      shorObj.circuitGrp.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color:C.quantum, transparent:true, opacity:0.7})));
    });
    [[-0.8,0.35],[-0.2,0.65],[0.4,-0.15],[0.9,0.35]].forEach(([gx,gy]) => {
      const gb=box(0.22,0.22,0.05,C.qDark,0x000000);
      gb.position.set(gx,gy+0.8,0.53);
      gb.add(edgesOf(gb,C.quantum));
      shorObj.circuitGrp.add(gb);
    });
    wg.add(shorObj.circuitGrp);
    shorObj.qftGrp=new THREE.Group();
    shorObj.qftGrp.position.set(0,-1.1,0);
    shorObj.qftGrp.scale.setScalar(0);
    shorObj.qftBars=[];
    const peaks=[0,4,8,12];
    const heights=[0.9,0.18,0.12,0.22,0.88,0.15,0.1,0.2,0.85,0.14,0.1,0.18,0.9,0.12,0.1,0.17];
    for (let i=0; i<16; i++) {
      const isPeak=peaks.includes(i);
      const h=heights[i]||0.15;
      const barGeo=new THREE.BoxGeometry(0.13,h,0.13);
      const barMat=new THREE.MeshPhongMaterial({
        color:isPeak?C.quantum:0xcccccc, emissive:isPeak?C.quantum:0x000000,
        emissiveIntensity:isPeak?0.3:0, transparent:true, opacity:0.9,
      });
      const bar=new THREE.Mesh(barGeo,barMat);
      bar.position.set((i-7.5)*0.175,h/2,0);
      bar.scale.setScalar(0);
      shorObj.qftBars.push(bar);
      shorObj.qftGrp.add(bar);
    }
    wg.add(shorObj.qftGrp);
    shorObj.gridGrp=new THREE.Group();
    shorObj.gridGrp.position.set(0,-2.6,0);
    shorObj.gridGrp.scale.setScalar(0);
    shorObj.gridTiles=[];
    shorObj.tileVelocities=[];
    for (let i=0; i<15; i++) {
      const num=i+1, col=i%5, row=Math.floor(i/5);
      const isPrime=(num===3||num===5);
      const t=box(0.42,0.42,0.12, isPrime?C.broken:0xdddddd, isPrime?C.broken:0x000000);
      t.material.emissiveIntensity=isPrime?0.3:0;
      t.position.set((col-2)*0.52,(1-row)*0.52,0);
      t.scale.setScalar(0);
      const lbl=labelPlane(String(num),0.36,0.3,isPrime?'#ffffff':'#666666');
      lbl.position.set(0,0,0.07);
      t.add(lbl);
      shorObj.gridTiles.push(t);
      shorObj.tileVelocities.push({x:0,y:0,z:0,rx:0,ry:0});
      shorObj.gridGrp.add(t);
    }
    wg.add(shorObj.gridGrp);
    shorObj._bLight=new THREE.PointLight(C.broken,0,12);
    shorObj._bLight.position.set(0,-1,5);
    ctx.scene.add(shorObj._bLight);
    shorObj._shatterStarted=false;
    shorObj._shatterPhase=false;
    ctx.onTick=function(time) {
      if (shorObj.qubitGrp.scale.x>0.1)
        shorObj.qubits.forEach((q,i) => { q.rotation.y+=0.04+i*0.01; });
      if (shorObj.core.scale.x>0.1)
        shorObj.core.material.emissiveIntensity=0.4+Math.sin(time*3)*0.2;
      if (shorObj._shatterPhase) {
        shorObj.gridTiles.forEach((t,i) => {
          const v=shorObj.tileVelocities[i];
          t.position.x+=v.x; t.position.y+=v.y; t.position.z+=v.z;
          t.rotation.x+=v.rx; t.rotation.y+=v.ry;
          v.x*=0.96; v.y*=0.96; v.z*=0.96;
        });
      }
    };
  }
  function updateShor(progress) {
    if (!shorCtx||!shorObj.qpuGrp) return;
    const t0=rangeProg(progress,0,0.14);
    const s0=t0;
    shorObj.qpuGrp.scale.setScalar(s0);
    shorObj.core.scale.setScalar(s0);
    shorObj.finL.scale.setScalar(s0);
    shorObj.finR.scale.setScalar(s0);
    shorObj.qubitGrp.scale.setScalar(s0);
    const t1=rangeProg(progress,0.14,0.28);
    shorObj.circuitGrp.scale.setScalar(t1);
    if (progress>=0.28) shorObj._coreBaseEmit=lerp(0.5,1.4,rangeProg(progress,0.28,0.42));
    if (progress>=0.42) {
      const t3=rangeProg(progress,0.42,0.58);
      shorObj.qftGrp.scale.setScalar(Math.min(t3*2,1));
      shorObj.qftBars.forEach((bar,i) => {
        const delay=i/shorObj.qftBars.length*0.6;
        bar.scale.setScalar(clamp01((t3-delay)/0.4));
      });
    }
    if (progress>=0.72) {
      const t5=rangeProg(progress,0.72,0.84);
      shorObj.gridGrp.scale.setScalar(Math.min(t5*2,1));
      if (!shorObj._shatterPhase) {
        shorObj.gridTiles.forEach((t,i) => {
          const delay=i/shorObj.gridTiles.length*0.5;
          t.scale.setScalar(clamp01((t5-delay)/0.5));
        });
      }
    }
    if (progress>=0.84) {
      const t6=rangeProg(progress,0.84,1.0);
      shorObj._bLight.intensity=t6*3.5;
      shorObj.core.material.color.setHex(C.broken);
      shorObj.core.material.emissive.setHex(C.broken);
      if (!shorObj._shatterStarted) {
        shorObj._shatterStarted=true;
        shorObj._shatterPhase=true;
        shorObj.gridTiles.forEach((t,i) => {
          const v=shorObj.tileVelocities[i];
          v.x=(Math.random()-0.5)*0.18; v.y=(Math.random()-0.5)*0.16;
          v.z=(Math.random()-0.5)*0.12; v.rx=(Math.random()-0.5)*0.12; v.ry=(Math.random()-0.5)*0.12;
        });
      }
    } else {
      if (shorObj._shatterStarted) {
        shorObj._shatterStarted=false;
        shorObj._shatterPhase=false;
        shorObj.gridTiles.forEach((t,i) => {
          const col=i%5, row=Math.floor(i/5);
          t.position.set((col-2)*0.52,(1-row)*0.52,0);
          t.rotation.set(0,0,0);
          const v=shorObj.tileVelocities[i];
          v.x=v.y=v.z=v.rx=v.ry=0;
        });
        shorObj.core.material.color.setHex(C.quantum);
        shorObj.core.material.emissive.setHex(C.quantum);
      }
      shorObj._bLight.intensity=0;
    }
  }
  let merkleCtx=null;
  const merkleObj={};
  const TREE_LAYOUT={
    L0:[-2.4,-1.6], L1:[-0.8,-1.6], L2:[0.8,-1.6], L3:[2.4,-1.6],
    H01:[-1.6,0.0], H23:[1.6,0.0], ROOT:[0.0,1.6],
  };
  function initMerkle() {
    const canvas=document.getElementById('merkle-three');
    if (!canvas) return;
    const ctx=createScene(canvas);
    merkleCtx=ctx;
    ctx.worldGroup.position.y=-0.1;
    const wg=ctx.worldGroup;
    const M=(window.QL_DATA&&window.QL_DATA.merkle)?window.QL_DATA.merkle:null;
    const leafHashes=M?M.leaves.map(l=>(l.hash||'').substring(0,8)):['leaf0000','leaf0001','leaf0010','leaf0011'];
    const branchHashes=M?M.branches.map(b=>(b.hash||'').substring(0,8)):['brnch000','brnch001'];
    const rootHash=M?(M.root.hash||'').substring(0,10):'root000000';
    merkleObj.nodes={};
    ['L0','L1','L2','L3'].forEach((id,i) => {
      const [x,y]=TREE_LAYOUT[id];
      const g=new THREE.Group();
      g.position.set(x,y,0); g.scale.setScalar(0);
      const body=box(0.9,0.55,0.18,C.qDark,C.quantum);
      body.material.emissiveIntensity=0.25;
      g.add(body); g.add(edgesOf(body,C.quantum));
      const lbl=labelPlane(leafHashes[i],0.85,0.38,'#2563eb');
      lbl.position.set(0,0,0.11);
      g.add(lbl);
      merkleObj.nodes[id]=g;
      wg.add(g);
    });
    ['H01','H23'].forEach((id,i) => {
      const [x,y]=TREE_LAYOUT[id];
      const g=new THREE.Group();
      g.position.set(x,y,0); g.scale.setScalar(0);
      const body=box(1.1,0.55,0.18,0xf0f0f0,0x000000);
      g.add(body); g.add(edgesOf(body,C.inkDim));
      const lbl=labelPlane(branchHashes[i],0.95,0.38,'#666666');
      lbl.position.set(0,0,0.11);
      g.add(lbl);
      merkleObj.nodes[id]=g;
      wg.add(g);
    });
    {
      const g=new THREE.Group();
      g.position.set(0,1.6,0); g.scale.setScalar(0);
      const body=box(1.4,0.6,0.22,0x1a1000,C.gold);
      body.material.emissiveIntensity=0.4;
      g.add(body); g.add(edgesOf(body,C.gold));
      const lbl=labelPlane(rootHash,1.1,0.42,'#a16207');
      lbl.position.set(0,0,0.13);
      g.add(lbl);
      merkleObj.nodes.ROOT=g;
      wg.add(g);
    }
    const connPairs=[['ROOT','H01'],['ROOT','H23'],['H01','L0'],['H01','L1'],['H23','L2'],['H23','L3']];
    merkleObj.connLines=connPairs.map(([a,b]) => {
      const pa=TREE_LAYOUT[a], pb=TREE_LAYOUT[b];
      const t=tube([pa[0],pa[1],0],[pb[0],pb[1],0],0.025,C.line);
      t.material.opacity=0;
      wg.add(t);
      return t;
    });
    merkleObj.attackQPU=new THREE.Group();
    merkleObj.attackQPU.position.set(-3.2,0,0);
    merkleObj.attackQPU.scale.setScalar(0);
    const aqBody=box(0.8,0.5,0.3,C.qDark,C.broken);
    aqBody.material.emissiveIntensity=0.5;
    merkleObj.attackQPU.add(aqBody);
    merkleObj.attackQPU.add(edgesOf(aqBody,C.broken));
    wg.add(merkleObj.attackQPU);
    merkleObj.beamGrp=new THREE.Group();
    merkleObj.beamBeads=[];
    for (let i=0; i<12; i++) {
      const bead=sphere(0.055,C.broken,C.broken,8);
      bead.visible=false;
      merkleObj.beamBeads.push(bead);
      merkleObj.beamGrp.add(bead);
    }
    wg.add(merkleObj.beamGrp);
    merkleObj.gLight=new THREE.PointLight(C.gold,0,12);
    merkleObj.gLight.position.set(0,0,3);
    ctx.scene.add(merkleObj.gLight);
    merkleObj.bLight=new THREE.PointLight(C.broken,0,12);
    merkleObj.bLight.position.set(-2,0,3);
    ctx.scene.add(merkleObj.bLight);
    merkleObj._beamT=0;
    merkleObj._attacking=false;
    ctx.onTick=function(time) {
      if (merkleObj.beamBeads[0]&&merkleObj.beamBeads[0].visible) {
        merkleObj._beamT=(merkleObj._beamT+0.022)%1;
        merkleObj.beamBeads.forEach((bead,i) => {
          const t=(merkleObj._beamT+i/12)%1;
          bead.position.set(lerp(-3.2,0,t), lerp(0,1.6,t), 0);
        });
      }
      if (merkleObj._attacking) {
        merkleObj.attackQPU.position.x=-3.2+Math.sin(time*18)*0.07;
        merkleObj.attackQPU.position.y=Math.sin(time*23)*0.05;
      }
    };
  }
  function updateMerkle(progress) {
    if (!merkleCtx||!merkleObj.nodes) return;
    const t0=rangeProg(progress,0,0.18);
    ['L0','L1','L2','L3'].forEach((id,i) => {
      const delay=i/4*0.5;
      merkleObj.nodes[id].scale.setScalar(clamp01((t0-delay)/0.5));
    });
    if (progress>=0.18) {
      const t1=rangeProg(progress,0.18,0.36);
      ['H01','H23'].forEach((id,i) => {
        merkleObj.nodes[id].scale.setScalar(clamp01((t1-i*0.15)/0.85));
      });
      for (let i=2; i<=5; i++)
        merkleObj.connLines[i].material.opacity=clamp01((t1-(i-2)*0.1)/0.6)*0.8;
    }
    if (progress>=0.36) {
      const t2=rangeProg(progress,0.36,0.52);
      merkleObj.nodes.ROOT.scale.setScalar(t2);
      for (let i=0; i<=1; i++)
        merkleObj.connLines[i].material.opacity=clamp01((t2-i*0.12)/0.7)*0.8;
    }
    if (progress>=0.52) {
      const t3=rangeProg(progress,0.52,0.70);
      merkleObj._attacking=true;
      merkleObj.attackQPU.scale.setScalar(Math.min(t3*2,1));
      merkleObj.bLight.intensity=t3*2.5;
      merkleObj.beamBeads.forEach(b=>{b.visible=t3>0.1;});
      const rootBody=merkleObj.nodes.ROOT.children[0];
      if (rootBody&&rootBody.material) {
        rootBody.material.emissive.setRGB(
          lerp(0xd4/255,0xe0/255,t3), lerp(0xa6/255,0x3a/255,t3), lerp(0x44/255,0x2b/255,t3)
        );
      }
    } else {
      merkleObj._attacking=false;
      merkleObj.beamBeads.forEach(b=>{b.visible=false;});
    }
    if (progress>=0.70) {
      const t4=rangeProg(progress,0.70,1.0);
      merkleObj.bLight.intensity=lerp(2.5,0,t4);
      merkleObj.gLight.intensity=t4*2.8;
      merkleObj.attackQPU.scale.setScalar(lerp(1,0,t4));
      merkleObj._attacking=false;
      if (t4>0.5) {
        merkleObj.beamBeads.forEach(b=>{b.visible=false;});
        const rootBody=merkleObj.nodes.ROOT.children[0];
        if (rootBody&&rootBody.material) {
          rootBody.material.emissive.setHex(C.gold);
          rootBody.material.emissiveIntensity=0.6;
        }
        ['H01','H23'].forEach(id => {
          const body=merkleObj.nodes[id].children[0];
          if (body&&body.material) { body.material.emissive.setHex(C.gold); body.material.emissiveIntensity=0.4; }
        });
        ['L0','L1','L2','L3'].forEach(id => {
          const body=merkleObj.nodes[id].children[0];
          if (body&&body.material) { body.material.emissive.setHex(C.secure); body.material.emissiveIntensity=0.45; }
        });
      }
    } else if (progress<0.52) {
      merkleObj.gLight.intensity=0;
      merkleObj.bLight.intensity=0;
    }
  }
  function init() {
    initRSA();
    initShor();
    initMerkle();
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.QL_Three={updateRSA, updateShor, updateMerkle};
})();