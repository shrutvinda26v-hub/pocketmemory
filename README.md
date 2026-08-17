# pocketmemory

A full-screen webcam landing page where your hands are the interface. Point to summon a wireframe cube around one hand, with a Pokémon floating inside it. Fist-swipe with the other hand to cycle the roster. Video is processed locally in the browser with MediaPipe — nothing is uploaded or stored.

This is a fan-made interaction study. Pokémon is a trademark of Nintendo / Game Freak / Creatures.

## Gestures

| Gesture | Hand | Action |
| --- | --- | --- |
| Index finger up, other fingers curled | First hand to point (anchor) | Summon the cube and Pokémon |
| Open palm | Anchor hand | Release — cube fades, return to idle |
| Closed fist + swipe left/right | Other hand (control) | Cycle previous / next Pokémon |
| Closed fist held | Control hand | Confirm — cube fills in |
| Pinch (thumb + index) | Either hand while holding | Rotate the Pokémon |
| Both palms open | Both | Reset |

Keep the pointing pose for about half a second so tracking can commit. The cube stays with the anchor hand after that, even if you relax the point. If tracking drops, there is a short grace window before idle.

## Run

```bash
npm install
npm run dev
```

Then open the local URL. Chrome or Edge on desktop with a webcam works best.

```bash
npm test
npm run build
```

### URL flags

- `/?demo=1` — camera-free walkthrough of summon / swap / reset
- `/?browse=1` — static roster grid

Keyboard in live or demo mode: `Enter` or `Space` to summon, `←` `→` to cycle, `Esc` to reset.

## Stack

- React + Vite + TypeScript
- MediaPipe Hand Landmarker (`@mediapipe/tasks-vision`) at ~30 fps
- Three.js wireframe cube, billboarded official artwork, and particle dissolve / materialize
- 18 fan-favorite Pokémon (sprites from the [PokeAPI sprites](https://github.com/PokeAPI/sprites) repo)

Camera frames never leave the device. The model and wasm run entirely client-side.
