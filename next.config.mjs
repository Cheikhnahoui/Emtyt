const host = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "localhost";

/** @type {import('next').NextConfig} */
export default {
  images: {
    remotePatterns: [{ protocol: "https", hostname: host, pathname: "/storage/v1/object/public/**" }],
  },
  // Allow product image uploads (up to 8 images x 5 MB) through server actions
  experimental: { serverActions: { bodySizeLimit: "45mb" } },
};
