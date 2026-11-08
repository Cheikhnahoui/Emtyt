"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { BUCKET, isOwnImageUrl, storagePath } from "@/lib/storage";
import type { FormState } from "@/lib/types";
import { productSchema } from "@/lib/validators";

const MAX_IMAGES = 8;
const txt = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const list = (v: FormDataEntryValue | null) => txt(v).split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);

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

  // Photos are compressed and uploaded by the browser straight to Supabase Storage;
  // the server only receives their public URLs (keeps requests tiny, far below Vercel's 4.5 MB limit).
  const newUrls = fd.getAll("image_urls").map(String).filter(Boolean);
  if (newUrls.some((u) => !isOwnImageUrl(u))) return { error: "رابط صورة غير صالح." };
  const toDelete = fd.getAll("delete_image").map(String);

  // Check the image limit BEFORE changing anything, so a failure never leaves a half-saved product.
  let existing: { id: string; url: string; sort_order: number }[] = [];
  if (id) {
    const { data } = await supabase.from("product_images").select("id,url,sort_order").eq("product_id", id);
    existing = data ?? [];
  }
  const kept = existing.filter((r) => !toDelete.includes(r.id));
  if (kept.length + newUrls.length > MAX_IMAGES) return { error: `الحد الأقصى ${MAX_IMAGES} صور للمنتج.` };

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
    const removing = existing.filter((r) => toDelete.includes(r.id));
    if (removing.length) {
      await supabase.storage.from(BUCKET).remove(removing.map((r) => storagePath(r.url)).filter(Boolean));
      await supabase.from("product_images").delete().in("id", removing.map((r) => r.id));
    }

    // Link the newly uploaded images
    if (newUrls.length) {
      let order = Math.max(-1, ...kept.map((r) => r.sort_order)) + 1;
      const { error } = await supabase.from("product_images")
        .insert(newUrls.map((url) => ({ product_id: productId, url, sort_order: order++ })));
      if (error) throw error;
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
