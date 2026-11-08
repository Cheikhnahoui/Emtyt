import { z } from "zod";

export const productSchema = z.object({
  name_ar: z.string().trim().min(2, "اسم المنتج مطلوب").max(120),
  short_description: z.string().trim().max(200).optional(),
  description: z.string().trim().max(3000).optional(),
  category_id: z.string().uuid().nullable(),
  price: z.coerce.number().min(0),
  discount_price: z.coerce.number().min(0).nullable(),
  colors: z.array(z.string().trim().min(1)).default([]),
  sizes: z.array(z.string().trim().min(1)).default([]),
  stock: z.coerce.number().int().min(0),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
}).refine((p) => p.discount_price == null || p.discount_price < p.price, {
  message: "سعر التخفيض يجب أن يكون أقل من السعر الأصلي", path: ["discount_price"],
});

export const categorySchema = z.object({
  name_ar: z.string().trim().min(2).max(60),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "الاسم مطلوب").max(80),
  phone: z.string().trim().regex(/^[+\d\s]{8,16}$/, "رقم هاتف غير صالح"),
  address: z.string().trim().min(3, "العنوان مطلوب").max(300),
  notes: z.string().trim().max(500).optional(),
});

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
