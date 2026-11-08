"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export async function changePassword(fd: FormData) {
  const { supabase } = await requireAdmin();
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");

  if (password.length < 8) redirect("/admin/password?error=" + encodeURIComponent("كلمة المرور يجب ألا تقل عن 8 أحرف."));
  if (password !== confirm) redirect("/admin/password?error=" + encodeURIComponent("كلمتا المرور غير متطابقتين."));

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error(error);
    redirect("/admin/password?error=" + encodeURIComponent("تعذر تغيير كلمة المرور. حاول تسجيل الدخول من جديد ثم أعد المحاولة."));
  }
  redirect("/admin/password?saved=1");
}