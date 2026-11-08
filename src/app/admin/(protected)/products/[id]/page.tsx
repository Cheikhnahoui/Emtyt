import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { card } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "تعديل المنتج" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*, product_images(id,url,sort_order)").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);
  if (!product) notFound();
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-3xl">تعديل: {product.name_ar}</h1>
      <div className={card}><ProductForm categories={categories ?? []} product={product} /></div>
    </div>
  );
}
