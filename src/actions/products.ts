"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import type { FormState } from "@/lib/types";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, productSchema } from "@/lib/validators";

const BUCKET = "product-images";
const MAX_IMAGES = 8;
const txt = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const list = (v: FormDataEntryValue | null) => txt(v).split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
const storagePath = (url: string) => decodeURIComponent(url.split(`/${BUCKET}/`)[1] ?? "");

export async function saveProduct(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = txt(fd.get("id")) || null;

  const parsed = productSchema.safeParse({
    name_ar: txt(fd.get("name_ar")),
    short_description: txt(fd.get("short_description")),
    description: txt(fd.get("description")),
    category_id: txt(fd.get("category_id")) || null,
    price: fd.get("price"),
    discount_price: txt(fd.get("discount_price")) || null,
    colors: list(fd.get("colors")),
    sizes: list(fd.get("sizes")),
    stock: fd.get("stock"),
    is_available: fd.get("is_available") === "on",
    is_featured: fd.get("is_featured") === "on",
  });
  if (!parsed.success) return { error: "تحقق من الحقول المحددة.", fieldErrors: parsed.error.flatten().fieldErrors };

  // Validate every file before touching storage
  const files = fd.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  for (const f of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) return { error: "نوع الصورة غير مسموح. استخدم JPG أو PNG أو WebP." };
    if (f.size > MAX_IMAGE_BYTES) return { error: "حجم إحدى الصور يتجاوز 5 ميغابايت." };
  }
  const toDelete = fd.getAll("delete_image").map(String);

  try {
    let productId = id;
    if (id) {
      const { error } = await supabase.from("products").update(parsed.data).eq("id", id);
      if (error) throw error;
    } else {
      const slug = `${slugify(parsed.data.name_ar)}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supabase.from("products").insert({ ...parsed.data, slug }).select("id").single();
      if (error) throw error;
      productId = data.id;
    }

    // Remove images the admin ticked
    if (id && toDelete.length) {
      const { data: rows } = await supabase.from("product_images").select("id,url").eq("product_id", id).in("id", toDelete);
      if (rows?.length) {
        await supabase.storage.from(BUCKET).remove(rows.map((r) => storagePath(r.url)).filter(Boolean));
        await supabase.from("product_images").delete().in("id", rows.map((r) => r.id));
      }
    }

    // Upload new images
    if (files.length) {
      const { data: existing } = await supabase.from("product_images").select("sort_order").eq("product_id", productId!);
      if ((existing?.length ?? 0) + files.length > MAX_IMAGES) return { error: `الحد الأقصى ${MAX_IMAGES} صور للمنتج.` };
      let order = Math.max(-1, ...(existing ?? []).map((r) => r.sort_order)) + 1;
      for (const f of files) {
        const ext = f.type === "image/jpeg" ? "jpg" : f.type.split("/")[1];
        const path = `${productId}/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type });
        if (up.error) throw up.error;
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const ins = await supabase.from("product_images").insert({ product_id: productId, url: pub.publicUrl, sort_order: order++ });
        if (ins.error) throw ins.error;
      }
    }
  } catch (e) {
    console.error(e);
    return { error: "حدث خطأ أثناء الحفظ. حاول مرة أخرى." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = txt(fd.get("id"));
  const { data: imgs } = await supabase.from("product_images").select("url").eq("product_id", id);
  if (imgs?.length) await supabase.storage.from(BUCKET).remove(imgs.map((i) => storagePath(i.url)).filter(Boolean));
  const { error } = await supabase.from("products").delete().eq("id", id); // images rows cascade
  if (error) console.error(error);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}
