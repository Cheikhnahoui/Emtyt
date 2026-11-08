"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/validators";

const url = z.string().trim().url().or(z.literal(""));
const schema = z.object({
  store_name: z.string().trim().min(2).max(60),
  phone: z.string().trim().max(20),
  whatsapp: z.string().transform((s) => s.replace(/\D/g, "")).refine((s) => s === "" || (s.length >= 8 && s.length <= 15)),
  description: z.string().trim().max(1000),
  delivery_info: z.string().trim().max(2000),
  instagram: url, facebook: url, tiktok: url,
});

const back = (q: string): never => redirect(`/admin/settings?${q}`);

export async function saveSettings(fd: FormData) {
  const { supabase } = await requireAdmin();
  const get = (k: string) => String(fd.get(k) ?? "");
  const p = schema.safeParse(Object.fromEntries(
    ["store_name", "phone", "whatsapp", "description", "delivery_info", "instagram", "facebook", "tiktok"].map((k) => [k, get(k)]),
  ));
  if (!p.success) back("error=" + encodeURIComponent("تحقق من الحقول (رقم واتساب بالصيغة الدولية، والروابط تبدأ بـ https://)."));

  const update: Record<string, unknown> = { ...p.data };

  const logo = fd.get("logo");
  if (logo instanceof File && logo.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(logo.type) || logo.size > MAX_IMAGE_BYTES) back("error=" + encodeURIComponent("صورة الشعار غير صالحة (JPG/PNG/WebP حتى 5 ميغابايت)."));
    const ext = logo.type === "image/jpeg" ? "jpg" : logo.type.split("/")[1];
    const path = `logos/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from("product-images").upload(path, logo, { contentType: logo.type });
    if (up.error) { console.error(up.error); back("error=" + encodeURIComponent("تعذر رفع الشعار.")); }
    update.logo_url = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase.from("settings").update(update).eq("id", 1);
  if (error) { console.error(error); back("error=" + encodeURIComponent("تعذر حفظ الإعدادات.")); }

  revalidatePath("/", "layout");
  back("saved=1");
}
