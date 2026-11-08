"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { categorySchema } from "@/lib/validators";

function fail(message: string): never {
  redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
}
function done(): never {
  revalidatePath("/", "layout"); // public site refreshes immediately
  redirect("/admin/categories");
}
function parse(fd: FormData) {
  return categorySchema.safeParse({
    name_ar: fd.get("name_ar"),
    sort_order: fd.get("sort_order") || 0,
    is_active: fd.get("is_active") === "on",
  });
}

export async function createCategory(fd: FormData) {
  const { supabase } = await requireAdmin();
  const p = parse(fd);
  if (!p.success) fail("تحقق من اسم التصنيف (حرفان على الأقل).");
  const slug = `${slugify(p.data.name_ar)}-${Math.random().toString(36).slice(2, 6)}`;
  const { error } = await supabase.from("categories").insert({ ...p.data, slug });
  if (error) { console.error(error); fail("تعذر حفظ التصنيف."); }
  done();
}

export async function updateCategory(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id"));
  const p = parse(fd);
  if (!p.success) fail("تحقق من اسم التصنيف (حرفان على الأقل).");
  const { error } = await supabase.from("categories").update(p.data).eq("id", id);
  if (error) { console.error(error); fail("تعذر تحديث التصنيف."); }
  done();
}

export async function deleteCategory(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", String(fd.get("id")));
  if (error) { console.error(error); fail("تعذر حذف التصنيف."); }
  done();
}
