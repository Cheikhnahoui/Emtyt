"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toLoginEmail } from "@/lib/login";
import { createClient } from "@/lib/supabase/client";
import { Field, btn, input } from "./ui";

export function LoginForm({ forbidden }: { forbidden: boolean }) {
  const router = useRouter();
  const [error, setError] = useState(forbidden ? "هذا الحساب لا يملك صلاحية الإدارة." : "");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const { error } = await createClient().auth.signInWithPassword({
      email: toLoginEmail(String(fd.get("username"))),
      password: String(fd.get("password")),
    });
    if (error) {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة.");
      setLoading(false);
      return;
    }
    router.replace("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <Field label="اسم المستخدم"><input className={input} name="username" required autoComplete="username" autoCapitalize="none" dir="ltr" /></Field>
      <Field label="كلمة المرور"><input className={input} name="password" type="password" required autoComplete="current-password" dir="ltr" /></Field>
      <button className={`${btn} w-full`} disabled={loading}>{loading ? "جارٍ الدخول…" : "تسجيل الدخول"}</button>
    </form>
  );
}