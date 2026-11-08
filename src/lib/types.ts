export type Category = { id: string; name_ar: string; slug: string; sort_order: number; is_active: boolean };
export type ProductImage = { id: string; url: string; sort_order: number };
export type Product = {
  id: string; slug: string; name_ar: string; short_description: string | null; description: string | null;
  category_id: string | null; price: number; discount_price: number | null; colors: string[]; sizes: string[];
  stock: number; is_available: boolean; is_featured: boolean; product_images: ProductImage[];
};
export type StoreProduct = Product & { categories: { name_ar: string; slug: string } | null };
export type Settings = {
  store_name: string | null; logo_url: string | null; phone: string | null; whatsapp: string | null;
  description: string | null; delivery_info: string | null; instagram: string | null; facebook: string | null; tiktok: string | null;
};
export type FormState = { error?: string; fieldErrors?: Record<string, string[] | undefined> };
