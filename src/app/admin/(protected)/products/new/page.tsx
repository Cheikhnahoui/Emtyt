import { ProductForm } from "@/components/admin/ProductForm";
import { card } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "منتج جديد" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-3xl">منتج جديد</h1>
      <div className={card}><ProductForm categories={categories ?? []} /></div>
    </div>
  );
}
