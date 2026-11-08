"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrder } from "@/actions/orders";
import { Field, btn, input } from "@/components/admin/ui";
import { formatMRU } from "@/lib/format";
import { orderMessage, waLink } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";

export function CheckoutForm({ whatsapp, storeName }: { whatsapp: string | null; storeName: string }) {
  const { items, total, ready, clear } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (!ready) return <div className="py-32 text-center text-plum/50">…</div>;
  if (!items.length) return <div className="space-y-4 py-24 text-center"><p>سلتك فارغة.</p><Link href="/shop" className={`${btn} inline-block`}>تصفحي المتجر</Link></div>;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const customer = {
      customer_name: String(fd.get("customer_name") ?? ""), phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""), notes: String(fd.get("notes") ?? ""),
    };
    setError("");
    start(async () => {
      const res = await placeOrder({
        customer,
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity, color: i.color ?? null, size: i.size ?? null })),
      });
      if (!res.ok) { setError(res.error); return; }
      const msg = orderMessage({
        store: storeName, number: res.orderNumber, name: customer.customer_name, phone: customer.phone, address: customer.address,
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, color: i.color, size: i.size })), total: res.total,
      });
      try { sessionStorage.setItem("emteyt_last_order", JSON.stringify({ number: res.orderNumber, total: res.total, wa: waLink(whatsapp, msg) })); } catch { /* ignore */ }
      clear();
      router.push(`/order/${res.orderNumber}`);
    });
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_20rem]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-plum/10">
        <h1 className="font-display text-3xl text-plum">إتمام الطلب</h1>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <Field label="الاسم الكامل *"><input className={input} name="customer_name" required minLength={2} maxLength={80} autoComplete="name" /></Field>
        <Field label="رقم الهاتف *"><input className={input} name="phone" type="tel" required dir="ltr" placeholder="+222 …" autoComplete="tel" /></Field>
        <Field label="عنوان التوصيل *" hint="المدينة، الحي، وأقرب معلم"><textarea className={input} name="address" required minLength={3} maxLength={300} rows={3} /></Field>
        <Field label="ملاحظات (اختياري)"><textarea className={input} name="notes" maxLength={500} rows={2} /></Field>
        <button className={`${btn} w-full`} disabled={pending}>{pending ? "جارٍ إرسال الطلب…" : "تأكيد الطلب"}</button>
        <p className="text-center text-xs text-plum/60">الدفع عند الاستلام أو حسب الاتفاق عبر واتساب.</p>
      </form>
      <aside className="h-fit space-y-3 rounded-2xl bg-white p-5 ring-1 ring-plum/10">
        <h2 className="font-medium">ملخص الطلب</h2>
        <ul className="space-y-2 text-sm">
          {items.map((i) => <li key={i.key} className="flex justify-between gap-2"><span className="line-clamp-1">{i.name} × {i.quantity}</span><span>{formatMRU(i.price * i.quantity)}</span></li>)}
        </ul>
        <div className="flex justify-between border-t border-plum/10 pt-3 font-bold"><span>الإجمالي</span><span>{formatMRU(total)}</span></div>
      </aside>
    </div>
  );
}
