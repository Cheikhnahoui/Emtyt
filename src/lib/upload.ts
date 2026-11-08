"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { BUCKET, storagePath } from "./storage";

export const MAX_IMAGES = 8;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT_BYTES = 30 * 1024 * 1024; // phone originals are big; we shrink them before upload

type Source = { source: CanvasImageSource; width: number; height: number; close: () => void };

async function load(file: File): Promise<Source> {
  if ("createImageBitmap" in window) {
    try {
      const b = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: b, width: b.width, height: b.height, close: () => b.close() };
    } catch { /* fall back to <img> below */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Resize (longest side <= maxSize) and re-encode. JPEG by default; PNG keeps transparency (logos). */
export async function compressImage(file: File, o: { maxSize: number; png?: boolean; quality?: number }): Promise<Blob> {
  const img = await load(file);
  try {
    const scale = Math.min(1, o.maxSize / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    if (!o.png) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
    ctx.drawImage(img.source, 0, 0, w, h);
    const type = o.png ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, o.quality ?? 0.82));
    if (!blob) throw new Error("encode");
    return blob;
  } finally {
    img.close();
  }
}

/** Compress a picked file and upload it straight to Supabase Storage. Returns the public URL. */
export async function prepareAndUpload(
  supabase: SupabaseClient, file: File, o: { folder?: string; maxSize?: number; png?: boolean } = {},
): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("نوع الصورة غير مسموح. استخدم JPG أو PNG أو WebP.");
  if (file.size > MAX_INPUT_BYTES) throw new Error("حجم الصورة كبير جدًا (الحد 30 ميغابايت).");

  let blob: Blob;
  try { blob = await compressImage(file, { maxSize: o.maxSize ?? 1600, png: o.png }); }
  catch { throw new Error("تعذر معالجة الصورة. جرّب صورة أخرى."); }

  const path = `${o.folder ?? "products"}/${crypto.randomUUID()}.${blob.type === "image/png" ? "png" : "jpg"}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
  if (error) throw new Error("تعذر رفع الصورة. تأكد من اتصالك وأنك مسجّل الدخول.");
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Best-effort cleanup of files uploaded for a save that then failed. */
export async function removeUploaded(supabase: SupabaseClient, urls: string[]) {
  const paths = urls.map(storagePath).filter(Boolean);
  if (!paths.length) return;
  try { await supabase.storage.from(BUCKET).remove(paths); } catch { /* ignore */ }
}
