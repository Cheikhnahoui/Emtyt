import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { btn, card, input } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatMRU } from "@/lib/format";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/orders";

export const metadata = { title: "الطلبات" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase.from("orders").select("id,order_number,customer_name,phone,total,status,created_at").order("created_at", { ascending: false }).limit(100);
  if ((ORDER_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  const term = q.replace(/[%_,()]/g, " ").trim().slice(0, 40);
  if (term) {
    const num = /^#?\d+$/.test(term) ? term.replace("#", "") : null;
    query = query.or([`customer_name.ilike.%${term}%`, `phone.ilike.%${term}%`, num ? `order_number.eq.${num}` : ""].filter(Boolean).join(","));
  }
  const { data: orders } = await query;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">الطلبات</h1>
      <form className="flex flex-wrap items-end gap-3">
        <input name="q" defaultValue={q} placeholder="بحث: الاسم أو الهاتف أو رقم الطلب" className={`${input} sm:w-72`} />
        <select name="status" defaultValue={status} className={`${input} sm:w-44`}>
          <option value="">كل الحالات</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <button className={btn}>تصفية</button>
      </form>
      <ul className="space-y-2">
        {(orders ?? []).map((o) => (
          <li key={o.id}><Link href={`/admin/orders/${o.id}`} className={`${card} grid items-center gap-2 transition hover:shadow-md sm:grid-cols-[5rem_1fr_9rem_8rem_7rem]`}>
            <span className="font-medium" dir="ltr">#{o.order_number}</span>
            <span>{o.customer_name} <span className="text-xs text-plum/60" dir="ltr">{o.phone}</span></span>
            <span className="text-xs text-plum/60">{formatDate(o.created_at)}</span>
            <span>{formatMRU(o.total)}</span><StatusBadge status={o.status} />
          </Link></li>
        ))}
        {!orders?.length && <li className={card}>لا توجد طلبات مطابقة.</li>}
      </ul>
    </div>
  );
}
