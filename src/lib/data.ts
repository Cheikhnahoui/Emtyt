import { publicClient } from "./supabase/public";
import type { Category, Settings, StoreProduct } from "./types";

const SELECT = "*, categories(name_ar,slug), product_images(id,url,sort_order)";
const norm = (p: any): StoreProduct => ({
  ...p,
  product_images: [...(p.product_images ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order),
});

export async function getSettings(): Promise<Settings> {
  const { data } = await publicClient().from("settings").select("*").eq("id", 1).maybeSingle();
  return (data ?? {}) as Settings;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await publicClient().from("categories").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []) as Category[];
}

export async function getProducts(o: { category?: string; q?: string; offers?: boolean; sort?: string; limit?: number; featured?: boolean } = {}) {
  const db = publicClient();
  let query = db.from("products").select(SELECT);
  if (o.category) {
    const { data: c } = await db.from("categories").select("id").eq("slug", o.category).maybeSingle();
    if (!c) return [];
    query = query.eq("category_id", c.id);
  }
  if (o.q) query = query.ilike("name_ar", `%${o.q.replace(/[%_]/g, " ").trim()}%`);
  if (o.offers) query = query.not("discount_price", "is", null);
  if (o.featured) query = query.eq("is_featured", true);
  if (o.sort === "price_asc") query = query.order("price", { ascending: true });
  else if (o.sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });
  if (o.limit) query = query.limit(o.limit);
  const { data } = await query;
  return (data ?? []).map(norm);
}

export async function getBestSellers(limit = 8) {
  const db = publicClient();
  const { data: ids } = await db.rpc("best_sellers", { p_limit: limit });
  const list = (ids ?? []).map((r: any) => r.product_id as string);
  if (!list.length) return [];
  const { data } = await db.from("products").select(SELECT).in("id", list);
  const byId = new Map((data ?? []).map((p: any) => [p.id, norm(p)]));
  return list.map((id) => byId.get(id)).filter(Boolean) as StoreProduct[];
}

export async function getProductBySlug(slug: string) {
  const { data } = await publicClient().from("products").select(SELECT).eq("slug", slug).maybeSingle();
  return data ? norm(data) : null;
}
