"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { btn, btnGhost } from "@/components/admin/ui";
import { formatMRU } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";

export function OrderConfirmation({ number, whatsapp }: { number: string; whatsapp: string | null }) {
  const [info, setInfo] = useState<{ number: number; total: number; wa: string } | null>(null);
  useEffect(() => {
    try { const v = JSON.parse(sessionStorage.getItem("emteyt_last_order") ?? "null"); if (v && String(v.number) === number) setInfo(v); } catch { /* ignore */ }
  }, [number]);

  const wa = info?.wa ?? waLink(whatsapp, `مرحبًا، أستفسر عن طلبي رقم #${number}`);
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-20 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-100 text-4xl text-green-700">✓</div>
      <h1 className="font-display text-4xl text-plum">تم استلام طلبك</h1>
      <p>رقم الطلب: <b dir="ltr">#{number}</b></p>
      {info && <p>الإجمالي: <b>{formatMRU(info.total)}</b></p>}
      <p className="text-sm leading-relaxed text-plum/70">سنتواصل معك قريبًا لتأكيد الطلب. للإسراع، أرسلي تفاصيل الطلب عبر واتساب.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href={wa} target="_blank" rel="noopener noreferrer" className={btn}>إرسال الطلب عبر واتساب</a>
        <Link href="/shop" className={btnGhost}>متابعة التسوق</Link>
      </div>
    </div>
  );
}
