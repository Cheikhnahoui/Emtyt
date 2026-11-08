"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  key: string; productId: string; slug: string; name: string; price: number; image: string | null;
  color?: string; size?: string; quantity: number; maxStock: number;
};
type Ctx = {
  items: CartItem[]; count: number; total: number; ready: boolean;
  add: (i: Omit<CartItem, "key">) => void; setQty: (key: string, q: number) => void; remove: (key: string) => void; clear: () => void;
};

const KEY = "emteyt_cart_v1";
const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)); } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items, ready]);

  const add = useCallback((it: Omit<CartItem, "key">) => {
    const key = `${it.productId}|${it.color ?? ""}|${it.size ?? ""}`;
    setItems((prev) => {
      const ex = prev.find((i) => i.key === key);
      if (ex) return prev.map((i) => (i.key === key ? { ...i, maxStock: it.maxStock, quantity: Math.min(i.quantity + it.quantity, it.maxStock) } : i));
      return [...prev, { ...it, key, quantity: Math.min(it.quantity, it.maxStock) }];
    });
  }, []);
  const setQty = useCallback((key: string, q: number) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(q, i.maxStock)) } : i))), []);
  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items, ready, add, setQty, remove, clear,
    count: items.reduce((s, i) => s + i.quantity, 0),
    total: items.reduce((s, i) => s + i.quantity * i.price, 0),
  }), [items, ready, add, setQty, remove, clear]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
};
