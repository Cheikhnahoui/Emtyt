"use client";

import Image from "next/image";
import Link from "next/link";
import { btn } from "@/components/admin/ui";
import { useCart } from "@/components/store/CartProvider";
import { formatMRU } from "@/lib/format";

export default function CartPage() {
  const { items, total, ready, setQty, remove } = useCart();
  if (!ready) return <div className="py-32 text-center text-plum/50">…</div>;

  if (!items.length) return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-24 text-center">
      <h1 className="font-display text-3xl">سلتك فارغة</h1>
      <Link href="/shop" className={`${btn} inline-block`}>تصفحي المتجر</Link>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <h1 className="font-display text-4xl text-plum">سلة التسوق</h1>
        {items.map((i) => (
          <div key={i.key} className="flex gap-4 rounded-2xl bg-white p-3 ring-1 ring-plum/10">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-rose-soft">
              {i.image && <Image src={i.image} alt={i.name} fill sizes="80px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <Link href={`/product/${i.slug}`} className="line-clamp-1 font-medium hover:text-gold">{i.name}</Link>
              <p className="text-xs text-plum/60">{[i.color && `اللون: ${i.color}`, i.size && `المقاس: ${i.size}`].filter(Boolean).join(" · ")}</p>
              <p className="text-sm font-bold">{formatMRU(i.price * i.quantity)}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-full border border-plum/25 text-sm">
                  <button aria-label="إنقاص" className="px-3 py-1" onClick={() => setQty(i.key, i.quantity - 1)}>−</button>
                  <span className="w-6 text-center">{i.quantity}</span>
                  <button aria-label="زيادة" className="px-3 py-1" onClick={() => setQty(i.key, i.quantity + 1)}>+</button>
                </div>
                <button onClick={() => remove(i.key)} className="text-xs text-red-700 underline">إزالة</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="h-fit space-y-4 rounded-2xl bg-white p-5 ring-1 ring-plum/10 lg:sticky lg:top-24">
        <h2 className="font-medium">ملخص الطلب</h2>
        <div className="flex justify-between text-lg font-bold"><span>الإجمالي</span><span>{formatMRU(total)}</span></div>
        <p className="text-xs text-plum/60">تُحسب رسوم التوصيل وتُؤكَّد معك عند تأكيد الطلب.</p>
        <Link href="/checkout" className={`${btn} block text-center`}>إتمام الطلب</Link>
      </aside>
    </div>
  );
}
