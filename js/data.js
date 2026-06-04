window.QL_DATA = (function() {
  const rsa = {
    p:3, q:5, N:15, e:7, d:7, phi:8, message:7, cipher:13,
    components:[
      {sym:'p', val:'3', label:'secret prime'},
      {sym:'q', val:'5', label:'secret prime'},
      {sym:'N', val:'15', label:'public modulus  N = p·q'},
      {sym:'e', val:'7', label:'public exponent'},
      {sym:'d', val:'7', label:'private exponent'},
    ],
  };
  const shor = {
    a:7, period:4, qubits:4, Q:16,
    powers:[
      {x:0,v:1},{x:1,v:7},{x:2,v:4},{x:3,v:13},
      {x:4,v:1},{x:5,v:7},{x:6,v:4},{x:7,v:13},
    ],
    qftPeaks:[0,4,8,12],
    qftBars:(function() {
      const bars = [];
      for (let k=0; k<16; k++) bars.push({k, h: k%4===0 ? 1 : 0.04+Math.random()*0.05});
      return bars;
    })(),
    steps:[
      {n:'01', title:'choose base',     body:'pick a = 7, coprime to N=15  ·  gcd(7,15)=1'},
      {n:'02', title:'superposition',   body:'load counting register into equal superposition of 0…15'},
      {n:'03', title:'modular exp',     body:'compute |x, 7ˣ mod 15⟩ in parallel across all x'},
      {n:'04', title:'quantum fourier', body:'apply QFT — interference concentrates amplitude'},
      {n:'05', title:'measure period',  body:'measurement peaks at 0,4,8,12  →  period r = 4'},
      {n:'06', title:'classical post',  body:'r even ✓  ·  7^(r/2)=49 ≢ −1 mod 15 ✓'},
      {n:'07', title:'extract factors', body:'gcd(48,15)=3   gcd(50,15)=5   →   15 = 3 × 5'},
    ],
    result:{factored:'N = 15  =  3 × 5', complexity:'O(log³ N) steps', verdict:'PRIVATE KEY RECOVERED'},
  };
  const merkle = {
    txs:[
      {id:'TX-0', label:'alice → bob   ⛓ 4.20', leaf:0},
      {id:'TX-1', label:'bob → carol   ⛓ 1.15', leaf:1},
      {id:'TX-2', label:'carol → dave  ⛓ 9.07', leaf:2},
      {id:'TX-3', label:'dave → erin   ⛓ 0.33', leaf:3},
    ],
    leaves:[
      {id:'L0', hash:'9f2c4a7e1d6b0358'},
      {id:'L1', hash:'a4e8c1f93b27d05a'},
      {id:'L2', hash:'3b7d92e6c4180fa1'},
      {id:'L3', hash:'e1086fbc52a9d743'},
    ],
    branches:[
      {id:'H01', hash:'c7d401a9f6e23b85', from:['L0','L1']},
      {id:'H23', hash:'52fa9b3e8c170d6f', from:['L2','L3']},
    ],
    root:{id:'ROOT', hash:'0xae93f17c8b4d2e6a', from:['H01','H23']},
    hex:'0123456789abcdef',
  };
  const compare = {
    rsa:    {name:'RSA-2048',         basis:'integer factorization', classical:'super-polynomial',    quantum:'polynomial — O(log³ N)',        vuln:100, verdict:'BROKEN'},
    merkle: {name:'Merkle / SHA-256', basis:'one-way hashing',       classical:'pre-image resistant', quantum:'Grover ½ key only — no period', vuln:24,  verdict:'RESILIENT'},
  };
  return {rsa, shor, merkle, compare};
})();
window.QL_DATA_PROMISE = (async function() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/all');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    window.QL_DATA = await res.json();
  } catch(err) {}
})();
