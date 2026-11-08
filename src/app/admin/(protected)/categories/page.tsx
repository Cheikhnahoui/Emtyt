import { createCategory, deleteCategory, updateCategory } from "@/actions/categories";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Field, btn, btnDanger, btnGhost, card, input } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "التصنيفات" };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-3xl">التصنيفات</h1>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <form action={createCategory} className={`${card} grid items-end gap-3 sm:grid-cols-[1fr_6rem_auto_auto]`}>
        <Field label="تصنيف جديد"><input className={input} name="name_ar" required placeholder="مثال: الملاحف" /></Field>
        <Field label="الترتيب"><input className={input} name="sort_order" type="number" defaultValue={0} /></Field>
        <label className="flex items-center gap-2 pb-3 text-sm"><input type="checkbox" name="is_active" defaultChecked /> نشط</label>
        <button className={btn}>إضافة</button>
      </form>

      <ul className="space-y-3">
        {(categories ?? []).map((c) => (
          <li key={c.id} className={`${card} flex flex-wrap items-end gap-3`}>
            <form action={updateCategory} className="flex flex-1 flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={c.id} />
              <div className="min-w-40 flex-1"><Field label="الاسم"><input className={input} name="name_ar" required defaultValue={c.name_ar} /></Field></div>
              <div className="w-24"><Field label="الترتيب"><input className={input} name="sort_order" type="number" defaultValue={c.sort_order} /></Field></div>
              <label className="flex items-center gap-2 pb-3 text-sm"><input type="checkbox" name="is_active" defaultChecked={c.is_active} /> نشط</label>
              <button className={btnGhost}>حفظ</button>
            </form>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <ConfirmButton message="حذف التصنيف؟ ستبقى منتجاته دون تصنيف." className={btnDanger}>حذف</ConfirmButton>
            </form>
          </li>
        ))}
        {!categories?.length && <li className={card}>لا توجد تصنيفات بعد.</li>}
      </ul>
    </div>
  );
}
