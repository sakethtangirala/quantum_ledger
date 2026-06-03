# The Quantum Ledger

A scroll-driven visual proof of why quantum computing breaks RSA but not Merkle trees. Built this to make Shor's algorithm actually make sense — not just "quantum computers are fast" but *why* the math collapses.

You scroll through it like a story. Each section pins to the viewport while its animation plays out, then releases you to the next one.

**[Live demo →](https://quantum-ledger.vercel.app)**

---

## What it does

Five scenes, one argument:

1. **The lock** — RSA gets built in front of you. Two primes multiply into a public modulus. The private key appears. You see exactly what makes it "secure."
2. **The attack** — A quantum machine assembles, runs Shor's algorithm on N=15, finds the period in the QFT, and factors the key. The grid shatters. BROKEN.
3. **The defense** — Same QPU fires at a Merkle tree. The period scan runs forever and finds nothing. The root hardens. SECURED.
4. **The verdict** — Side-by-side: RSA 100% vulnerable, Merkle 24% (Grover only halves the key length — not the same thing).

---

## Running it

You need two terminals — one for the backend, one to serve the frontend.

**Backend (FastAPI):**
```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

**Frontend:**
```bash
python -m http.server 5500
```

Then open `http://localhost:5500`. The frontend fetches live data from the API — real SHA-256 hashes, real modular arithmetic. If the backend isn't running it falls back to baked-in static values so the animations still work.

---

## The sandbox

At the bottom of the page there's an interactive section where you can plug in your own values:

- **RSA calculator** — pick any two primes, any message. Watch it compute N, φ(N), find e, derive d, encrypt and decrypt. The round-trip confirm (✓ or ✗) is computed live.
- **Merkle hasher** — edit any of the four transactions and see the SHA-256 hashes ripple up the tree in real time. Change one character in TX-0 and the root hash is completely different.

---

## Stack

- Vanilla HTML/CSS/JS — no framework, no bundler
- [GSAP 3.13](https://gsap.com) — ScrollTrigger does all the pinning and scrubbing
- [FastAPI](https://fastapi.tiangolo.com) + [Uvicorn](https://www.uvicorn.org) — backend computes RSA, Shor simulation, and Merkle trees
- Python's `hashlib` for real SHA-256, `math.gcd` for the RSA key derivation

---

## Project layout

```
index.html              the whole page
vercel.json             deploy config (clean URLs, asset caching)

css/
  styles.css            color palette, typography, shared components
  scenes.css            per-section layout and stage elements

js/
  data.js               fetches from /api/all, falls back to static data
  utils.js              hexScramble, buildLattice, DrawSVG-lite, etc.
  hero.js               section 1 — particle lattice entrance
  rsa.js                section 2 — prime multiplication, key reveal
  shor.js               section 3 — QPU assembly, QFT, shatter
  merkle.js             section 4 — tree build, attack, defense
  outro.js              section 5 — comparison bars, final reveal
  main.js               boots all scenes after fonts + data are ready
  sandbox.js            RSA calculator and Merkle hasher interactivity

backend/
  main.py               FastAPI app, all routes, CORS
  models.py             Pydantic schemas for every endpoint
  rsa.py                toy RSA (N=15) + arbitrary prime sandbox computation
  shor_simulation.py    classical Shor simulation (period finding, QFT peaks)
  merkle.py             SHA-256 Merkle tree builder

tests/
  test_backend.py       RSA, Shor, and Merkle unit tests
```

---

## Deploying

Static frontend deploys to Vercel out of the box — import the repo, set Framework Preset to "Other", done. The backend needs a separate host (Railway, Fly.io, Render, etc.) since Vercel doesn't run persistent Python processes.

For the frontend to hit the right API URL in production, update the `API` constant at the top of `js/data.js` and `js/sandbox.js`.
