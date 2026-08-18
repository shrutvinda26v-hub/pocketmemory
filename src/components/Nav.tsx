"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export function Nav() {
  const { count, setOpen } = useCart();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${solid ? "is-solid" : ""}`}>
      <Link href="/" className="logo">
        BADDIE
      </Link>
      <nav className="nav-links">
        <Link href="/shop">SHOP</Link>
        <Link href="/#shades">SHADES</Link>
        <Link href="/#quiz">BADDIE QUIZ</Link>
        <Link href="/about">ABOUT</Link>
      </nav>
      <button type="button" className="bag-btn" onClick={() => setOpen(true)}>
        BAG ({count})
      </button>
    </header>
  );
}

export function BagDrawer() {
  const { open, setOpen, lines, total, remove, clear } = useCart();
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close bag"
          className="fixed inset-0 z-[65] bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`drawer ${open ? "open" : ""}`}>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-4xl">BAG</h2>
          <button type="button" className="kicker" onClick={() => setOpen(false)}>
            CLOSE
          </button>
        </div>
        <p className="italic-line mt-2 text-lg text-[#f6d56b]">Wear your mood. Take it home.</p>
        <div className="mt-8 flex flex-col gap-5">
          {lines.length === 0 && (
            <p className="text-white/60">Your bag is empty. A baddie never leaves unshaded.</p>
          )}
          {lines.map(({ shade, qty }) => (
            <div key={shade.id} className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="h-14 w-10 rounded" style={{ background: shade.hex }} />
              <div className="flex-1">
                <div className="font-display tracking-wide">{shade.name}</div>
                <div className="text-xs tracking-[0.2em] text-white/50">{shade.personality} · ×{qty}</div>
              </div>
              <button type="button" className="text-xs tracking-widest" onClick={() => remove(shade.id)}>
                REMOVE
              </button>
            </div>
          ))}
        </div>
        {lines.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex justify-between font-poster text-2xl">
              <span>TOTAL</span>
              <span>
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(total)}
              </span>
            </div>
            <button type="button" className="cta solid w-full justify-center">
              CHECKOUT →
            </button>
            <button type="button" className="mt-3 w-full text-center text-xs tracking-[0.25em] text-white/40" onClick={clear}>
              CLEAR
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export function Grain() {
  return (
    <>
      <div className="grain" />
      <Cursor />
    </>
  );
}

function Cursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const t = e.target as HTMLElement | null;
      setHot(Boolean(t?.closest("a, button, .shade-card, .quiz-choice")));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <div className={`cursor ${hot ? "hot" : ""}`} style={{ left: pos.x, top: pos.y }} />
      <div className="cursor-dot" style={{ left: pos.x, top: pos.y }} />
    </>
  );
}
