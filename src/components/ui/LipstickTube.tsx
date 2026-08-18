import type { CSSProperties } from "react";

export function LipstickTube({
  color,
  name,
  className = "",
  size = 1,
}: {
  color: string;
  name?: string;
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`lip ${className}`}
      style={{ "--lip": color, transform: `scale(${size})` } as CSSProperties}
      aria-hidden
    >
      <div className="lip-bullet" />
      <div className="lip-neck" />
      <div className="lip-body">{name}</div>
      <div className="lip-base" />
    </div>
  );
}

export function Floaters({ variant = "mix" }: { variant?: "mix" | "red" | "pink" | "orange" }) {
  const bits = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="float-bits pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((i) => {
        const left = `${(i * 17 + 8) % 96}%`;
        const top = `${(i * 23 + 6) % 90}%`;
        const delay = `${i * 0.35}s`;
        const kind = i % 4;
        const style = { left, top, animationDelay: delay } as CSSProperties;
        if (kind === 0) return <span key={i} className="flower" style={style} />;
        if (kind === 1) return <span key={i} className="bangle" style={style} />;
        if (kind === 2) return <span key={i} className="bindi" style={style} />;
        return (
          <span
            key={i}
            className="chrome-orb"
            style={{
              ...style,
              width: 18 + (i % 5) * 6,
              height: 18 + (i % 5) * 6,
              background:
                variant === "pink"
                  ? undefined
                  : variant === "red"
                    ? "radial-gradient(circle at 30% 25%, #fff, #f6d56b 40%, #8b0000)"
                    : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
