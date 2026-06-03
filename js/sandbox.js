/* ============================================================
   SANDBOX — live RSA + Merkle computation via FastAPI
   Calls POST /api/sandbox/rsa and POST /api/sandbox/merkle.
   Falls back to a clear error message if the backend is down.
   ============================================================ */
(function () {
  const API = 'http://127.0.0.1:8000';

  // ── Helpers ────────────────────────────────────────────────────────────────

  function setLoading(btn, on) {
    btn.disabled = on;
    btn.textContent = on ? 'Computing\u2026' : btn.dataset.label;
  }

  function showError(id, msg) {
    const el = document.getElementById(id + '-error');
    el.textContent = msg;
    el.style.display = 'block';
  }

  function clearError(id) {
    const el = document.getElementById(id + '-error');
    el.textContent = '';
    el.style.display = 'none';
  }

  function showResult(id, html) {
    const el = document.getElementById(id + '-result');
    // Remove and re-add class to re-trigger the fade-in animation
    el.classList.remove('sb-result-in');
    el.innerHTML = html;
    el.style.display = 'block';
    // Force reflow then re-add animation class
    void el.offsetWidth;
    el.classList.add('sb-result-in');
  }

  // ── RSA ────────────────────────────────────────────────────────────────────

  async function computeRSA(btn) {
    clearError('rsa');
    const p = parseInt(document.getElementById('sb-p').value, 10);
    const q = parseInt(document.getElementById('sb-q').value, 10);
    const m = parseInt(document.getElementById('sb-m').value, 10);

    if (!p || !q || !m) { showError('rsa', 'All three fields are required.'); return; }

    setLoading(btn, true);
    try {
      const res = await fetch(API + '/api/sandbox/rsa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p, q, message: m }),
      });
      const data = await res.json();
      if (!res.ok) { showError('rsa', data.detail || 'Computation failed.'); return; }
      renderRSA(data);
    } catch (e) {
      showError('rsa', 'Backend unreachable \u2014 is uvicorn running on :8000?');
    } finally {
      setLoading(btn, false);
    }
  }

  function renderRSA(d) {
    const ok = d.decrypted === d.message;
    showResult('rsa', `
      <div class="sb-kv-grid">
        <div class="sb-kv">
          <span class="sb-k">N = p\u00b7q</span>
          <span class="sb-v">${d.p} \u00d7 ${d.q} = <b class="glow-q">${d.N}</b></span>
        </div>
        <div class="sb-kv">
          <span class="sb-k">\u03c6(N)</span>
          <span class="sb-v">(${d.p}\u22121)(${d.q}\u22121) = ${d.phi}</span>
        </div>
        <div class="sb-kv">
          <span class="sb-k">e</span>
          <span class="sb-v glow-q">${d.e} <span class="faint">\u2014 public exponent</span></span>
        </div>
        <div class="sb-kv">
          <span class="sb-k">d</span>
          <span class="sb-v glow-g">${d.d} <span class="faint">\u2014 private exponent</span></span>
        </div>
      </div>
      <div class="sb-flow">
        <div class="sb-flow-step">
          <span class="sb-flow-label">plaintext</span>
          <span class="sb-flow-val">${d.message}</span>
        </div>
        <span class="sb-flow-arrow">m<sup>e</sup> mod N</span>
        <div class="sb-flow-step">
          <span class="sb-flow-label">cipher</span>
          <span class="sb-flow-val glow-q">${d.cipher}</span>
        </div>
        <span class="sb-flow-arrow">c<sup>d</sup> mod N</span>
        <div class="sb-flow-step">
          <span class="sb-flow-label">decrypted</span>
          <span class="sb-flow-val ${ok ? 'glow-g' : 'glow-r'}">${d.decrypted} ${ok ? '\u2713' : '\u2717'}</span>
        </div>
      </div>
    `);
  }

  // ── Merkle ──────────────────────────────────────────────────────────────────

  async function computeMerkle(btn) {
    clearError('merkle');
    const txs = [
      document.getElementById('sb-tx0').value,
      document.getElementById('sb-tx1').value,
      document.getElementById('sb-tx2').value,
      document.getElementById('sb-tx3').value,
    ];
    if (txs.some(t => !t.trim())) { showError('merkle', 'All 4 transaction fields are required.'); return; }

    setLoading(btn, true);
    try {
      const res = await fetch(API + '/api/sandbox/merkle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: txs }),
      });
      const data = await res.json();
      if (!res.ok) { showError('merkle', data.detail || 'Computation failed.'); return; }
      renderMerkle(data);
    } catch (e) {
      showError('merkle', 'Backend unreachable \u2014 is uvicorn running on :8000?');
    } finally {
      setLoading(btn, false);
    }
  }

  function renderMerkle(d) {
    const leafHtml = d.leaves.map(l => `
      <div class="sb-tnode sb-leaf">
        <span class="sb-nid">${l.id}</span>
        <span class="sb-hash" data-hash="${l.hash}"></span>
      </div>`).join('');

    const branchHtml = d.branches.map(b => `
      <div class="sb-tnode sb-branch">
        <span class="sb-nid">${b.id}</span>
        <span class="sb-hash" data-hash="${b.hash}"></span>
      </div>`).join('');

    showResult('merkle', `
      <div class="sb-tree">
        <div class="sb-tree-row sb-root-row">
          <div class="sb-tnode sb-root">
            <span class="sb-nid">ROOT</span>
            <span class="sb-hash" data-hash="${d.root.hash}"></span>
          </div>
        </div>
        <div class="sb-tree-row sb-branch-row">${branchHtml}</div>
        <div class="sb-tree-row sb-leaf-row">${leafHtml}</div>
      </div>
    `);

    // Animate each hash slot-machine style using the existing QL.hexScramble util
    document.querySelectorAll('#merkle-result .sb-hash').forEach(node => {
      QL.hexScramble(node, node.dataset.hash, '0123456789abcdef', 1.2);
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  window.addEventListener('DOMContentLoaded', function () {
    const rsaBtn    = document.getElementById('sb-rsa-btn');
    const merkleBtn = document.getElementById('sb-merkle-btn');

    rsaBtn.dataset.label    = rsaBtn.textContent;
    merkleBtn.dataset.label = merkleBtn.textContent;

    rsaBtn.addEventListener('click',    () => computeRSA(rsaBtn));
    merkleBtn.addEventListener('click', () => computeMerkle(merkleBtn));

    // Auto-run with defaults so the sandbox is populated on page load
    computeRSA(rsaBtn);
    computeMerkle(merkleBtn);
  });
})();
