# The Quantum Ledger

A single-page scrollytelling visualization of **Shor's algorithm** breaking RSA encryption,
then failing against a **Merkle tree**. Scroll drives every animation — GSAP ScrollTrigger
pins each section while its scene plays out.

## Sections
1. **Hero** — particle lattice + title entrance
2. **RSA** — a lock built from primes (p · q → N → private key)
3. **Shor's attack** — quantum period-finding shatters RSA (N = 15 = 3 × 5)
4. **Merkle defense** — the tree resists: the period scan never converges (r = ∅)
5. **Outro** — RSA vs Merkle comparison + reassembly

## Stack
- HTML / CSS / vanilla JS
- [GSAP](https://gsap.com) 3.13 — ScrollTrigger, MotionPathPlugin, TextPlugin (loaded via CDN)
- Pre-computed Shor + Merkle step sequences baked in as static data (`js/data.js`)

## Run locally
No build step. Open `index.html` in a browser, or serve the folder:
```bash
npx serve .
```

## Deploy to Vercel
This is a static site — no framework. Either:
- **Dashboard:** import the repo, leave Framework Preset = "Other", deploy.
- **CLI:**
  ```bash
  npm i -g vercel
  vercel
  ```
`vercel.json` sets clean URLs and asset caching. The root serves `index.html` automatically.

## Structure
```
index.html        entry point
vercel.json       deploy config
css/
  styles.css      design system (colors, type, components)
  scenes.css      per-scene layout
js/
  data.js         pre-computed Shor (N=15) + Merkle sequences
  utils.js        splitText / drawSVG / particle helpers
  hero.js rsa.js shor.js merkle.js outro.js   one timeline each
  main.js         orchestrator (registers plugins, inits scenes, progress rail)
```
