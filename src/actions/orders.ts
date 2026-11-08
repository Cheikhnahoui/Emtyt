"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { publicClient } from "@/lib/supabase/public";
import { checkoutSchema } from "@/lib/validators";

const itemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
  color: z.string().max(40).nullable().optional(),
  size: z.string().max(40).nullable().optional(),
});
const orderSchema = z.object({ customer: checkoutSchema, items: z.array(itemSchema).min(1).max(30) });

export type PlaceOrderResult = { ok: true; orderNumber: number; total: number } | { ok: false; error: string };

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const p = orderSchema.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message || "تحقق من بياناتك." };

  const { customer: c, items } = p.data;
  const { data, error } = await publicClient().rpc("create_order", {
    p_name: c.customer_name, p_phone: c.phone, p_address: c.address, p_notes: c.notes ?? "", p_items: items,
  });
  if (error) {
    console.error(error);
    return { ok: false, error: error.message.includes("unavailable") ? "أحد المنتجات لم يعد متوفرًا بالكمية المطلوبة. راجعي السلة." : "تعذر إرسال الطلب. حاولي مرة أخرى." };
  }
  revalidatePath("/", "layout"); // stock changed
  return { ok: true, orderNumber: data.order_number, total: Number(data.total) };
}
