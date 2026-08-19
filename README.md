# Make a Wish

Blow out a birthday candle with your breath, then snap your fingers to light it again.

The cake is a real-time 3D scene. Face landmarks estimate a blow (open / pursed mouth with a short confirmation window so talking does not count). Hand landmarks detect a thumb–middle-finger snap to relight.

Camera frames are processed locally in the browser and are never uploaded.

## Develop

```bash
npm install
npm test
npm run dev
```

Allow the camera when prompted. Keyboard fallbacks: `B` blows the candle out, `S` snaps it back on.
