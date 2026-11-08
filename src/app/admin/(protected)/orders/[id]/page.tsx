import Link from "next/link";
import { notFound } from "next/navigation";
import { setOrderStatus } from "@/actions/admin-orders";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { btn, btnDanger, btnGhost, card, input } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatMRU } from "@/lib/format";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/orders";
import { waLink } from "@/lib/whatsapp";

export const metadata = { title: "تفاصيل الطلب" };

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: o } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!o) notFound();
  const cancelled = o.status === "cancelled";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/orders" className={btnGhost}>→ الطلبات</Link>
        <h1 className="font-display text-3xl" dir="ltr">#{o.order_number}</h1><StatusBadge status={o.status} />
      </div>

      <div className={`${card} grid gap-2 text-sm sm:grid-cols-2`}>
        <p><b>الاسم:</b> {o.customer_name}</p>
        <p><b>الهاتف:</b> <span dir="ltr">{o.phone}</span></p>
        <p className="sm:col-span-2"><b>العنوان:</b> {o.address}</p>
        {o.notes && <p className="sm:col-span-2"><b>ملاحظات:</b> {o.notes}</p>}
        <p><b>التاريخ:</b> {formatDate(o.created_at)}</p>
        <a className="text-gold underline" target="_blank" rel="noopener noreferrer" href={waLink(o.phone, `مرحبًا ${o.customer_name}، بخصوص طلبك رقم #${o.order_number}`)}>مراسلة العميلة على واتساب</a>
      </div>

      <div className={card}>
        <ul className="divide-y divide-plum/10">
          {o.order_items.map((i: any) => (
            <li key={i.id} className="flex justify-between gap-3 py-2 text-sm">
              <span>{i.product_name} × {i.quantity}<span className="block text-xs text-plum/60">{[i.color && `اللون: ${i.color}`, i.size && `المقاس: ${i.size}`].filter(Boolean).join(" · ")}</span></span>
              <span>{formatMRU(i.unit_price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-plum/10 pt-3 font-bold"><span>الإجمالي</span><span>{formatMRU(o.total)}</span></p>
      </div>

      {cancelled ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">هذا الطلب ملغي، وأُعيدت كمياته إلى المخزون. لا يمكن تغيير حالته.</p>
      ) : (
        <div className={`${card} flex flex-wrap items-end gap-3`}>
          <form action={setOrderStatus} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="id" value={o.id} />
            <label className="space-y-1.5 text-sm font-medium">تغيير الحالة
              <select name="status" defaultValue={o.status} className={`${input} w-48 font-normal`}>
                {ORDER_STATUSES.filter((s) => s !== "cancelled").map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </label>
            <button className={btn}>حفظ</button>
          </form>
          <form action={setOrderStatus}>
            <input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value="cancelled" />
            <ConfirmButton message="إلغاء الطلب وإرجاع الكميات إلى المخزون؟" className={btnDanger}>إلغاء الطلب</ConfirmButton>
          </form>
        </div>
      )}
    </div>
  );
}
