/** Shared (server + browser) helpers for the public product-images bucket. */
export const BUCKET = "product-images";

const publicPrefix = () =>
  `${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin}/storage/v1/object/public/${BUCKET}/`;

/** True only for URLs that point into OUR bucket (the server never trusts arbitrary image URLs). */
export const isOwnImageUrl = (url: string) => url.startsWith(publicPrefix()) && !url.includes("..");

/** Storage object path from a public URL (used when deleting images). */
export const storagePath = (url: string) => decodeURIComponent(url.split(`/${BUCKET}/`)[1] ?? "");
