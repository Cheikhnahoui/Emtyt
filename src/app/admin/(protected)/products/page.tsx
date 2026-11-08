import Link from "next/link";
import { deleteProduct } from "@/actions/products";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { btn, btnDanger, btnGhost, card } from "@/components/admin/ui";
import { formatMRU } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "المنتجات" };

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id,name_ar,price,discount_price,stock,is_available,is_featured,categories(name_ar),product_images(url,sort_order)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">المنتجات</h1>
        <Link href="/admin/products/new" className={btn}>+ منتج جديد</Link>
      </div>

      {!products?.length ? (
        <p className={card}>لا توجد منتجات بعد. أضف أول منتج لتظهر في المتجر.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p: any) => {
            const cover = [...(p.product_images ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url;
            return (
              <li key={p.id} className={`${card} flex flex-wrap items-center gap-4`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {cover ? <img src={cover} alt="" className="h-16 w-16 rounded-xl object-cover" /> : <div className="h-16 w-16 rounded-xl bg-rose-soft" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name_ar}</p>
                  <p className="text-xs text-plum/60">{p.categories?.name_ar ?? "بدون تصنيف"} · المخزون: {p.stock}</p>
                  <p className="text-sm">
                    {p.discount_price != null ? (<><span className="font-medium text-gold">{formatMRU(p.discount_price)}</span> <s className="text-plum/50">{formatMRU(p.price)}</s></>) : formatMRU(p.price)}
                  </p>
                </div>
                <div className="flex gap-1 text-xs">
                  <span className={`rounded-full px-2 py-1 ${p.is_available && p.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {p.is_available && p.stock > 0 ? "متوفر" : "غير متوفر"}
                  </span>
                  {p.is_featured && <span className="rounded-full bg-gold-light/50 px-2 py-1">مميز</span>}
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/products/${p.id}`} className={btnGhost}>تعديل</Link>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmButton message="حذف هذا المنتج نهائيًا مع صوره؟" className={btnDanger}>حذف</ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
