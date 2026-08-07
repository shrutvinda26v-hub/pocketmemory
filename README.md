# BONSAI

> Every great story starts as a seed.

An immersive scroll experience where a bonsai evolves from seed to maturity — craft, calm, and quiet growth.

**Pull request:** https://github.com/shrutvinda26v-hub/pocketmemory/pull/2  
**Branch:** `cursor/bonsai-scroll-experience-6676`

---

## Run the product

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build && npm start
```

---

## How to experience it

1. Land on the **seed** in a ceramic pot — don’t rush.
2. Scroll once — the seed cracks, a sprout emerges, the camera eases in.
3. Keep scrolling — the tree grows through work, craft, journey, and voices.
4. At the end — golden hour, lanterns, fireflies, and a quiet CTA.
5. Toggle **seasons** (bottom left) or press `1` `2` `3` `4`.
6. Press **Sound** or `M` for ambient wind, birds, water, and temple bell.

| Scroll | Story |
|--------|--------|
| 0% | Seed · editorial hero |
| ~8% | Crack → sprout (reel hook) |
| Growth | Trunk, pads, roots |
| Projects | Wooden tags → panel |
| Skills | Cherry blossoms |
| Journey | Milestone birds |
| Testimonials | Floating leaves |
| Finale | Mature tree · CTA |

---

## Design language

- Premium editorial · Japanese minimalism · organic luxury
- Paper `#F5F0E8` · charcoal type · terracotta accent · moss green
- No neon, glassmorphism, or bouncy UI

---

## Stack

Next.js · TypeScript · React Three Fiber · Three.js · Lenis · GSAP · Framer Motion · Zustand · Web Audio

---

## Project map

```
src/
  app/                  # Next.js app shell
  components/
    experience/         # R3F scene, bonsai, atmosphere
    ui/                 # Nav, panels, loading, seasons
  data/content.ts       # Projects, skills, milestones, quotes
  hooks/                # Lenis, cursor-wind
  lib/                  # Seasons, sound, procedural textures
  store/                # Experience state
```
