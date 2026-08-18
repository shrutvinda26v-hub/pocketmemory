"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SHADES, type Shade } from "./shades";

type CartItem = { id: string; qty: number };

type CartCtx = {
  items: CartItem[];
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  lines: { shade: Shade; qty: number }[];
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const value = useMemo<CartCtx>(() => {
    const lines = items
      .map((i) => ({
        shade: SHADES.find((s) => s.id === i.id)!,
        qty: i.qty,
      }))
      .filter((l) => l.shade);
    const count = items.reduce((a, b) => a + b.qty, 0);
    const total = lines.reduce((a, b) => a + b.shade.price * b.qty, 0);
    return {
      items,
      count,
      open,
      setOpen,
      add: (id) => {
        setItems((prev) => {
          const found = prev.find((p) => p.id === id);
          if (found) return prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p));
          return [...prev, { id, qty: 1 }];
        });
        setOpen(true);
      },
      remove: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      clear: () => setItems([]),
      lines,
      total,
    };
  }, [items, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart outside provider");
  return ctx;
}
