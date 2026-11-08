import type { Metadata } from "next";
import { btn, input } from "@/components/admin/ui";
import { ProductGrid } from "@/components/store/ProductGrid";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "المتجر", description: "تصفحي الملاحف الموريتانية والأزياء النسائية والإكسسوارات.", alternates: { canonical: "/shop" } };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; sort?: string; offers?: string }> }) {
  const sp = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ q: sp.q?.slice(0, 60), category: sp.category, sort: sp.sort, offers: sp.offers === "1" }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <h1 className="font-display text-4xl text-plum">{sp.offers === "1" ? "العروض" : "المتجر"}</h1>
      <form className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 ring-1 ring-plum/10">
        <input name="q" defaultValue={sp.q} placeholder="ابحثي عن منتج…" className={`${input} sm:w-60`} />
        <select name="category" defaultValue={sp.category ?? ""} className={`${input} sm:w-44`}>
          <option value="">كل التصنيفات</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name_ar}</option>)}
        </select>
        <select name="sort" defaultValue={sp.sort ?? ""} className={`${input} sm:w-44`}>
          <option value="">الأحدث</option><option value="price_asc">السعر: الأقل</option><option value="price_desc">السعر: الأعلى</option>
        </select>
        <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" name="offers" value="1" defaultChecked={sp.offers === "1"} /> العروض فقط</label>
        <button className={btn}>بحث</button>
      </form>
      {products.length ? <ProductGrid products={products} /> : <p className="py-16 text-center text-plum/60">لا توجد منتجات مطابقة.</p>}
    </div>
  );
}
