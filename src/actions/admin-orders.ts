"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/orders";

export async function setOrderStatus(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id"));
  const status = String(fd.get("status"));
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) redirect(`/admin/orders/${id}`);
  const { error } = await supabase.rpc("admin_set_order_status", { p_order: id, p_status: status });
  if (error) console.error(error);
  revalidatePath("/", "layout"); // cancelling returns stock
  redirect(`/admin/orders/${id}`);
}
