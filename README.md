# SPECIMEN 001

A full-viewport **2D scroll-driven** fashion editorial. A jeweled sheep is pinned to the screen while scroll position scrubs a single reversible timeline: ornaments separate, explode, freeze, typeset, then magnetically return.

## Live

https://shrutvinda26v-hub.github.io/pocketmemory/

(Published by GitHub Pages from this branch.)

## Run locally

```bash
npm install
npm run dev
```

Open the local URL and scroll. Downward disassembles. Upward rebuilds. There is no independent playback — the scroll *is* the animation.

## Notes

- Built with Vite + GSAP ScrollTrigger (2D transforms only, `force3D: false`).
- The sheep remains still. Jewelry, flowers, pearls, chains, and gemstones are independent layers with art-directed exploded positions.
- Pin length is `1000vh`.
