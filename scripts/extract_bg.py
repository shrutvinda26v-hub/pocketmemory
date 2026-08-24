#!/usr/bin/env python3
"""Flood-fill dusty-blue studio backdrops to transparent WebP cutouts."""

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

RAW = Path("/workspace/raw-assets")
OUT = Path("/workspace/public/assets")

# Per-image flood threshold. Higher = more background eaten.
THRESH = {
    "sheep-bare.png": 34,
    "jewel-sapphire.png": 30,
    "jewel-ruby.png": 32,
    "jewel-emerald.png": 32,
    "jewel-crown.png": 32,
    "jewel-earring.png": 30,
    "jewel-chain.png": 30,
    "jewel-diamonds.png": 28,
    "jewel-pearls.png": 32,
    "jewel-goldframe.png": 32,
    "jewel-yellow.png": 32,
    "flower-peony.png": 36,
    "flower-rose.png": 36,
    "flower-hydrangea.png": 34,
    "flower-ranunculus.png": 36,
    "leaf-green.png": 34,
}

FEATHER = {
    "sheep-bare.png": 5,
    "flower-peony.png": 4,
    "flower-rose.png": 4,
    "flower-hydrangea.png": 4,
    "flower-ranunculus.png": 4,
    "leaf-green.png": 4,
}


def sample_bg(arr: np.ndarray) -> np.ndarray:
    h, w = arr.shape[:2]
    pts = [
        arr[4, 4, :3],
        arr[4, w - 5, :3],
        arr[h - 5, 4, :3],
        arr[h - 5, w - 5, :3],
        arr[4, w // 2, :3],
        arr[h - 5, w // 2, :3],
        arr[h // 2, 4, :3],
        arr[h // 2, w - 5, :3],
    ]
    return np.median(np.stack(pts).astype(np.float32), axis=0)


def flood_mask(rgb: np.ndarray, bg: np.ndarray, thresh: float) -> np.ndarray:
    h, w = rgb.shape[:2]
    bg = bg.astype(np.float32)
    visited = np.zeros((h, w), dtype=np.uint8)
    is_bg = np.zeros((h, w), dtype=bool)
    q = deque()

    def try_push(y: int, x: int) -> None:
        if visited[y, x]:
            return
        d = float(np.linalg.norm(rgb[y, x].astype(np.float32) - bg))
        if d <= thresh:
            visited[y, x] = 1
            is_bg[y, x] = True
            q.append((y, x))
        else:
            visited[y, x] = 2

    for x in range(0, w, 1):
        try_push(0, x)
        try_push(h - 1, x)
    for y in range(0, h, 1):
        try_push(y, 0)
        try_push(y, w - 1)

    while q:
        y, x = q.popleft()
        if y > 0:
            try_push(y - 1, x)
        if y + 1 < h:
            try_push(y + 1, x)
        if x > 0:
            try_push(y, x - 1)
        if x + 1 < w:
            try_push(y, x + 1)

    return is_bg


def grow_similar(rgb: np.ndarray, is_bg: np.ndarray, bg: np.ndarray, extra: float, rounds: int = 2) -> np.ndarray:
    """Eat a thin halo of similar-colored pixels around the flood mask."""
    h, w = rgb.shape[:2]
    bg = bg.astype(np.float32)
    dist = np.linalg.norm(rgb.astype(np.float32) - bg, axis=2)
    mask = is_bg.copy()
    for _ in range(rounds):
        padded = np.pad(mask, 1, mode="constant", constant_values=False)
        neigh = (
            padded[0:-2, 1:-1]
            | padded[2:, 1:-1]
            | padded[1:-1, 0:-2]
            | padded[1:-1, 2:]
        )
        mask = mask | (neigh & (dist <= extra))
    return mask


def feather_alpha(mask_bg: np.ndarray, radius: int) -> np.ndarray:
    obj = (~mask_bg).astype(np.float32)
    for _ in range(max(1, radius)):
        pad = np.pad(obj, 1, mode="edge")
        obj = (
            pad[0:-2, 0:-2]
            + pad[0:-2, 1:-1]
            + pad[0:-2, 2:]
            + pad[1:-1, 0:-2]
            + pad[1:-1, 1:-1]
            + pad[1:-1, 2:]
            + pad[2:, 0:-2]
            + pad[2:, 1:-1]
            + pad[2:, 2:]
        ) / 9.0
    return np.clip(obj * 255.0 * 1.12, 0, 255).astype(np.uint8)


def despill(arr: np.ndarray, alpha: np.ndarray, bg: np.ndarray) -> np.ndarray:
    rgb = arr[:, :, :3].astype(np.float32)
    a = np.maximum(alpha.astype(np.float32) / 255.0, 1e-4)
    fringe = (alpha > 4) & (alpha < 230)
    bg = bg.astype(np.float32)
    for c in range(3):
        pulled = (rgb[:, :, c] - bg[c] * (1.0 - a)) / a
        rgb[:, :, c] = np.where(fringe, np.clip(pulled, 0, 255), rgb[:, :, c])
    out = arr.copy()
    out[:, :, :3] = rgb.astype(np.uint8)
    out[:, :, 3] = alpha
    return out


def trim(arr: np.ndarray, pad: int = 10) -> np.ndarray:
    ys, xs = np.where(arr[:, :, 3] > 10)
    if len(xs) == 0:
        return arr
    y0 = max(0, int(ys.min()) - pad)
    y1 = min(arr.shape[0], int(ys.max()) + pad + 1)
    x0 = max(0, int(xs.min()) - pad)
    x1 = min(arr.shape[1], int(xs.max()) + pad + 1)
    return arr[y0:y1, x0:x1]


def process(name: str) -> None:
    src = RAW / name
    img = Image.open(src).convert("RGBA")
    # Downscale huge sources a bit before keying to keep runtime sane
    max_side = 1600 if name.startswith("sheep") else 1100
    if max(img.size) > max_side:
        img.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    arr = np.array(img)
    rgb = arr[:, :, :3]
    bg = sample_bg(arr)
    thresh = THRESH.get(name, 32)
    print(f"{name}: {arr.shape[1]}x{arr.shape[0]} bg={bg.astype(int).tolist()} thresh={thresh}")
    is_bg = flood_mask(rgb, bg, thresh)
    is_bg = grow_similar(rgb, is_bg, bg, extra=thresh + 10, rounds=2)
    alpha = feather_alpha(is_bg, FEATHER.get(name, 3))
    arr = despill(arr, alpha, bg)
    keep_full = name.startswith("sheep")
    if not keep_full:
        arr = trim(arr, pad=12)
    out = OUT / (Path(name).stem + ".webp")
    Image.fromarray(arr).save(out, "WEBP", quality=90, method=6)
    opaque = int((arr[:, :, 3] > 20).mean() * 100)
    print(f"  -> {out.name} {arr.shape[1]}x{arr.shape[0]} opaque~{opaque}%")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name in sorted(THRESH):
        process(name)


if __name__ == "__main__":
    main()
