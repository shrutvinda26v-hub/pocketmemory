export function startDust(canvas) {
  const ctx = canvas.getContext("2d");
  const particles = Array.from({ length: 48 }, () => spawn());
  let running = true;
  let last = performance.now();

  function spawn() {
    return {
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.6,
      s: 0.012 + Math.random() * 0.03,
      a: 0.08 + Math.random() * 0.22,
      drift: (Math.random() - 0.5) * 0.018,
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.y -= p.s * dt * 8;
      p.x += p.drift * dt;
      if (p.y < -0.02) {
        p.y = 1.02;
        p.x = Math.random();
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 244, 220, ${p.a})`;
      ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);

  return () => {
    running = false;
  };
}
