"use client";

import { useState } from "react";
import { btn, btnGhost } from "@/components/admin/ui";
import { formatMRU } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";

type Props = {
  product: { id: string; slug: string; name: string; price: number; image: string | null; colors: string[]; sizes: string[]; stock: number; available: boolean };
  whatsapp: string | null; storeName: string;
};

const chip = (on: boolean) => `rounded-full border px-4 py-1.5 text-sm transition ${on ? "border-plum bg-plum text-ivory" : "border-plum/25 hover:border-gold"}`;

export function AddToCart({ product: p, whatsapp, storeName }: Props) {
  const { add } = useCart();
  const [color, setColor] = useState(p.colors[0]);
  const [size, setSize] = useState(p.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!p.available) return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">هذا المنتج غير متوفر حاليًا.</p>;

  const waText = () =>
    `مرحبًا ${storeName}، أريد طلب:\n${p.name}\nالكمية: ${qty}${color ? `\nاللون: ${color}` : ""}${size ? `\nالمقاس: ${size}` : ""}\nالسعر: ${formatMRU(p.price * qty)}\n${window.location.href}`;

  return (
    <div className="space-y-5">
      {p.colors.length > 0 && (
        <div className="space-y-2"><p className="text-sm font-medium">اللون</p>
          <div className="flex flex-wrap gap-2">{p.colors.map((c) => <button key={c} type="button" onClick={() => setColor(c)} className={chip(c === color)}>{c}</button>)}</div></div>
      )}
      {p.sizes.length > 0 && (
        <div className="space-y-2"><p className="text-sm font-medium">المقاس</p>
          <div className="flex flex-wrap gap-2">{p.sizes.map((s) => <button key={s} type="button" onClick={() => setSize(s)} className={chip(s === size)}>{s}</button>)}</div></div>
      )}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">الكمية</span>
        <div className="flex items-center rounded-full border border-plum/25">
          <button type="button" aria-label="إنقاص" className="px-4 py-1.5" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <span className="w-8 text-center">{qty}</span>
          <button type="button" aria-label="زيادة" className="px-4 py-1.5" onClick={() => setQty((q) => Math.min(p.stock, q + 1))}>+</button>
        </div>
        <span className={`text-xs ${p.stock <= 3 ? "text-red-700" : "text-plum/60"}`}>{p.stock <= 3 ? `بقي ${p.stock} فقط` : "متوفر"}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className={btn} onClick={() => {
          add({ productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image, color, size, quantity: qty, maxStock: p.stock });
          setAdded(true); setTimeout(() => setAdded(false), 2000);
        }}>{added ? "✓ أُضيف إلى السلة" : "أضف إلى السلة"}</button>
        <a className={btnGhost} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.currentTarget.href = waLink(whatsapp, waText()); }} href={waLink(whatsapp, p.name)}>اطلب عبر واتساب</a>
      </div>
    </div>
  );
}
