"use client";

import Link from "next/link";
import { useActionState, useTransition } from "react";
import { saveProduct } from "@/actions/products";
import type { Category, FormState, Product } from "@/lib/types";
import { Field, btn, btnGhost, input } from "./ui";

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});
  const [, startTransition] = useTransition();
  const err = (k: string) => state.fieldErrors?.[k]?.[0];
  const images = [...(product?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault(); // keeps typed values if validation fails (React 19 would reset the form)
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      {product && <input type="hidden" name="id" value={product.id} />}
      {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="اسم المنتج *" error={err("name_ar")}>
          <input className={input} name="name_ar" required defaultValue={product?.name_ar} />
        </Field>
        <Field label="التصنيف">
          <select className={input} name="category_id" defaultValue={product?.category_id ?? ""}>
            <option value="">بدون تصنيف</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
          </select>
        </Field>
        <Field label="السعر (MRU) *" error={err("price")}>
          <input className={input} name="price" type="number" min="0" step="1" required defaultValue={product?.price} />
        </Field>
        <Field label="سعر التخفيض (MRU)" hint="اتركه فارغًا إن لم يكن هناك تخفيض" error={err("discount_price")}>
          <input className={input} name="discount_price" type="number" min="0" step="1" defaultValue={product?.discount_price ?? ""} />
        </Field>
        <Field label="الكمية في المخزون *" error={err("stock")}>
          <input className={input} name="stock" type="number" min="0" step="1" required defaultValue={product?.stock ?? 0} />
        </Field>
        <div className="flex items-end gap-6 pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_available" defaultChecked={product?.is_available ?? true} /> متوفر للبيع
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} /> عرضه في الصفحة الرئيسية
          </label>
        </div>
        <Field label="الألوان" hint="افصل بينها بفاصلة، مثال: أسود، بنفسجي، ذهبي">
          <input className={input} name="colors" defaultValue={product?.colors?.join("، ")} />
        </Field>
        <Field label="المقاسات" hint="افصل بينها بفاصلة، مثال: S, M, L (اتركه فارغًا إن لم ينطبق)">
          <input className={input} name="sizes" defaultValue={product?.sizes?.join(", ")} />
        </Field>
      </div>

      <Field label="وصف مختصر" error={err("short_description")}>
        <input className={input} name="short_description" maxLength={200} defaultValue={product?.short_description ?? ""} />
      </Field>
      <Field label="الوصف الكامل" error={err("description")}>
        <textarea className={input} name="description" rows={5} defaultValue={product?.description ?? ""} />
      </Field>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">الصور (الأولى هي صورة الغلاف)</legend>
        {images.length > 0 && (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {images.map((im) => (
              <li key={im.id} className="space-y-1 text-center text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.url} alt="" className="aspect-square w-full rounded-xl object-cover" />
                <label className="flex items-center justify-center gap-1 text-red-700">
                  <input type="checkbox" name="delete_image" value={im.id} /> حذف
                </label>
              </li>
            ))}
          </ul>
        )}
        <input className={input} type="file" name="images" multiple accept="image/jpeg,image/png,image/webp" />
        <p className="text-xs text-plum/60">JPG أو PNG أو WebP، حتى 5 ميغابايت للصورة، وبحد أقصى 8 صور للمنتج.</p>
      </fieldset>

      <div className="flex gap-3">
        <button className={btn} disabled={pending}>{pending ? "جارٍ الحفظ…" : "حفظ المنتج"}</button>
        <Link href="/admin/products" className={btnGhost}>إلغاء</Link>
      </div>
    </form>
  );
}
