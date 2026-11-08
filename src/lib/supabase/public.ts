import { createClient } from "@supabase/supabase-js";

/** Cookie-less anon client for public reads, so storefront pages can be cached (ISR). */
export const publicClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
