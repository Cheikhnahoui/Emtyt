import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Second line of defence (middleware is the first): call at the top of every admin page and server action. */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/admin/login?error=forbidden");
  return { supabase, user };
}
