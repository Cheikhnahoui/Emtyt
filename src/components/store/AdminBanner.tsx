"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type State = "loading" | "admin" | "visitor";

export function AdminBanner({ showToVisitors = false }: { showToVisitors?: boolean }) {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setState("visitor");
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      setState(data?.role === "admin" ? "admin" : "visitor");
    })();
  }, []);

  if (state === "loading" || (state === "visitor" && !showToVisitors)) return null;

  const btn = "rounded-full px-5 py-2 text-sm font-medium transition";
  return (
    <div className="bg-gradient-to-l from-plum-dark to-plum text-ivory">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5">
        <div>
          <p className="font-display text-2xl">{state === "admin" ? "مرحبًا بك في لوحة تحكم المتجر" : "إدارة المتجر"}</p>
          <p className="text-sm opacity-80">
            {state === "admin" ? "أدر المنتجات والطلبات والإعدادات من مكان واحد." : "سجّلي الدخول لإدارة المنتجات والطلبات."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {state === "admin" ? (
            <>
              <Link href="/admin" className={`${btn} bg-gold text-white hover:opacity-90`}>لوحة التحكم</Link>
              <Link href="/admin/orders" className={`${btn} border border-white/40 hover:bg-white/10`}>الطلبات</Link>
              <Link href="/admin/products/new" className={`${btn} border border-white/40 hover:bg-white/10`}>+ منتج جديد</Link>
            </>
          ) : (
            <Link href="/admin/login" className={`${btn} bg-gold text-white hover:opacity-90`}>دخول الإدارة</Link>
          )}
        </div>
      </div>
    </div>
  );
}