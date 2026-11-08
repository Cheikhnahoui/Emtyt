"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isOwnImageUrl } from "@/lib/storage";

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

  // The logo is uploaded by the browser (see LogoField); we only accept a URL inside our own bucket.
  const logoUrl = get("logo_url").trim();
  if (logoUrl) {
    if (!isOwnImageUrl(logoUrl)) back("error=" + encodeURIComponent("رابط الشعار غير صالح."));
    update.logo_url = logoUrl;
  }

  const { error } = await supabase.from("settings").update(update).eq("id", 1);
  if (error) { console.error(error); back("error=" + encodeURIComponent("تعذر حفظ الإعدادات.")); }

  revalidatePath("/", "layout");
  back("saved=1");
}
