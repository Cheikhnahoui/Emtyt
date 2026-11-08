import type { MetadataRoute } from "next";
import { publicClient } from "@/lib/supabase/public";

export const revalidate = 3600;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = publicClient();
  const [{ data: products }, { data: cats }] = await Promise.all([
    db.from("products").select("slug,created_at").eq("is_available", true),
    db.from("categories").select("slug").eq("is_active", true),
  ]);
  return [
    { url: SITE, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/shop`, changeFrequency: "daily", priority: 0.9 },
    ...(cats ?? []).map((c) => ({ url: `${SITE}/shop?category=${c.slug}`, priority: 0.7 })),
    ...(products ?? []).map((p) => ({ url: `${SITE}/product/${encodeURIComponent(p.slug)}`, lastModified: p.created_at, priority: 0.8 })),
  ];
}
