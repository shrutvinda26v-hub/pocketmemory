# SPECIMEN 001

A full-viewport **2D scroll-driven** fashion editorial. A jeweled sheep is pinned to the screen while scroll position scrubs a single reversible timeline: ornaments separate, explode, freeze, typeset, then magnetically return.

## Live

https://merry-cables-relate-instant.trycloudflare.com/

Scroll down to disassemble. Scroll up to rebuild.

Pull request: https://github.com/shrutvinda26v-hub/pocketmemory/pull/9

## Run locally

```bash
npm install
npm run dev
```

## Notes

- Built with Vite + GSAP ScrollTrigger (2D transforms only, `force3D: false`).
- The sheep remains still. Jewelry, flowers, pearls, chains, and gemstones are independent layers with art-directed exploded positions.
- Pin length is `1000vh`.
- Static build lives in `docs/` (`npm run build:docs`).
