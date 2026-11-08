import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { card } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatMRU } from "@/lib/format";

export const metadata = { title: "نظرة عامة" };

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const count = (q: any) => q.then((r: any) => r.count ?? 0);
  const [products, orders, pending, completedRows, recent] = await Promise.all([
    count(supabase.from("products").select("id", { count: "exact", head: true })),
    count(supabase.from("orders").select("id", { count: "exact", head: true })),
    count(supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending")),
    supabase.from("orders").select("total").eq("status", "completed"),
    supabase.from("orders").select("id,order_number,customer_name,total,status,created_at").order("created_at", { ascending: false }).limit(6),
  ]);
  const completed = completedRows.data?.length ?? 0;
  const sales = (completedRows.data ?? []).reduce((s: number, o: any) => s + Number(o.total), 0);

  const stats = [
    ["إجمالي المنتجات", products], ["إجمالي الطلبات", orders], ["طلبات قيد الانتظار", pending],
    ["طلبات مكتملة", completed], ["إجمالي المبيعات (الطلبات المكتملة)", formatMRU(sales)],
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">نظرة عامة</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(([label, v]) => (
          <div key={label as string} className={card}><p className="text-xs text-plum/60">{label}</p><p className="mt-2 font-display text-3xl text-plum">{v}</p></div>
        ))}
      </div>
      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-medium">أحدث الطلبات</h2><Link href="/admin/orders" className="text-sm text-gold underline">عرض الكل</Link></div>
        <ul className="space-y-2">
          {(recent.data ?? []).map((o: any) => (
            <li key={o.id}><Link href={`/admin/orders/${o.id}`} className={`${card} flex flex-wrap items-center justify-between gap-3 transition hover:shadow-md`}>
              <span className="font-medium" dir="ltr">#{o.order_number}</span><span>{o.customer_name}</span>
              <span className="text-xs text-plum/60">{formatDate(o.created_at)}</span><span>{formatMRU(o.total)}</span><StatusBadge status={o.status} />
            </Link></li>
          ))}
          {!recent.data?.length && <li className={card}>لا توجد طلبات بعد.</li>}
        </ul>
      </section>
    </div>
  );
}
