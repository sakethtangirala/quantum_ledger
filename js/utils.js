/* ============================================================
   The Quantum Ledger — shared helpers
   Self-contained equivalents for SplitText & DrawSVG (no premium
   plugin needed) plus DOM + math utilities.
   ============================================================ */

window.QL = (function () {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ---- element factory ----
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // ---- split text into per-character spans (SplitText-lite) ----
  // Wraps each character in <span class="char">; spaces preserved.
  function splitChars(node) {
    const text = node.textContent;
    node.textContent = '';
    const chars = [];
    for (const ch of text) {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      node.appendChild(s);
      chars.push(s);
    }
    return chars;
  }

  // split into words (each wrapped, returns word spans)
  function splitWords(node) {
    const parts = node.textContent.split(/(\s+)/);
    node.textContent = '';
    const words = [];
    parts.forEach((p) => {
      if (/^\s+$/.test(p)) { node.appendChild(document.createTextNode(p)); return; }
      const w = document.createElement('span');
      w.className = 'wordspan';
      w.style.display = 'inline-block';
      w.textContent = p;
      node.appendChild(w);
      node.appendChild(document.createTextNode(' '));
      words.push(w);
    });
    return words;
  }

  // ---- DrawSVG-lite: prep a path/line for stroke-draw ----
  function prepDraw(pathEl) {
    const len = pathEl.getTotalLength ? pathEl.getTotalLength() : 1000;
    pathEl.style.strokeDasharray = len;
    pathEl.style.strokeDashoffset = len;
    pathEl.dataset.len = len;
    return len;
  }
  // returns a tween-able object: set .draw 0→1
  function drawTween(pathEl, vars) {
    const len = parseFloat(pathEl.dataset.len || prepDraw(pathEl));
    return Object.assign({ strokeDashoffset: 0 }, vars);
  }

  // ---- build the hero/outro particle lattice (DOM dots) ----
  // Returns { dots:[], links:[] } appended into `host`.
  function buildLattice(host, opts) {
    opts = opts || {};
    const count = opts.count || 150;
    const W = host.clientWidth, H = host.clientHeight;
    const dots = [];
    const pts = [];
    for (let i = 0; i < count; i++) {
      const x = rnd(0.04, 0.96) * W;
      const y = rnd(0.05, 0.95) * H;
      const r = rnd(1.4, 3.2);
      const d = el('div', 'q-dot');
      d.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${r*2}px;height:${r*2}px;
        border-radius:50%;background:var(--quantum);transform:translate(-50%,-50%);
        box-shadow:0 0 ${r*4}px var(--quantum);will-change:transform,opacity;`;
      host.appendChild(d);
      dots.push(d);
      pts.push({ x, y, i });
    }
    // edges: connect each dot to a few nearby dots
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;overflow:visible;';
    const links = [];
    const maxDist = Math.min(W, H) * (opts.linkDist || 0.13);
    for (let i = 0; i < pts.length; i++) {
      let made = 0;
      for (let j = i + 1; j < pts.length && made < 3; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          const ln = document.createElementNS(svgNS, 'line');
          ln.setAttribute('x1', pts[i].x); ln.setAttribute('y1', pts[i].y);
          ln.setAttribute('x2', pts[j].x); ln.setAttribute('y2', pts[j].y);
          ln.setAttribute('stroke', 'var(--quantum)');
          ln.setAttribute('stroke-width', '0.6');
          ln.setAttribute('stroke-opacity', String(clamp(1 - dist / maxDist, 0, 1) * 0.5));
          svg.appendChild(ln);
          links.push(ln);
          made++;
        }
      }
    }
    host.insertBefore(svg, host.firstChild);
    return { dots, links, svg, pts };
  }

  // ---- hex slot-machine: animate a node's text cycling then settle ----
  // returns a gsap-friendly proxy with .progress 0→1
  function hexScramble(node, finalText, alphabet, dur, gsapRef) {
    alphabet = alphabet || '0123456789abcdef';
    const g = gsapRef || window.gsap;
    const proxy = { p: 0 };
    const len = finalText.length;
    g.to(proxy, {
      p: 1, duration: dur || 1.1, ease: 'power2.inOut',
      onUpdate() {
        const settled = Math.floor(proxy.p * len);
        let out = '';
        for (let i = 0; i < len; i++) {
          if (i < settled) out += finalText[i];
          else out += alphabet[(Math.random() * alphabet.length) | 0];
        }
        node.textContent = out;
      },
      onComplete() { node.textContent = finalText; },
    });
    return proxy;
  }

  return { rnd, pick, clamp, el, splitChars, splitWords, prepDraw, drawTween, buildLattice, hexScramble };
})();
