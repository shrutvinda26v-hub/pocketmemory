# The Living Tree

A cinematic interactive landing page. An ancient bioluminescent tree awakens under your hand — via webcam hand tracking, touch, or cursor.

## Stack

- Next.js (App Router) + React + TypeScript
- Canvas compositing for layered glow reveal
- MediaPipe Hands (`@mediapipe/tasks-vision`) for real-time hand tracking
- Framer Motion for UI motion
- Optimized WebP scene assets

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Allow camera access for hand tracking, or move your cursor / touch the screen.

## Experience

- Dark cinematic tree with twilight landscape and water reflection
- Hand / touch / mouse drives a soft radial glow mask that reveals cyan energy in the bark
- Particles brighten near the interaction point
- Butterflies wake locally as regions illuminate
- Minimal luxury typography overlay
