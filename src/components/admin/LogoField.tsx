"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { prepareAndUpload } from "@/lib/upload";
import { input } from "./ui";

/** Uploads the logo from the browser as soon as it is picked; the form then submits only its URL. */
export function LogoField({ current }: { current: string | null }) {
  const [url, setUrl] = useState(current ?? "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setStatus("جارٍ رفع الشعار…");
    try {
      setUrl(await prepareAndUpload(createClient(), file, { folder: "logos", maxSize: 1000, png: file.type === "image/png" }));
      setStatus("تم رفع الشعار. اضغط «حفظ الإعدادات» لتأكيده.");
    } catch (err) {
      setStatus("");
      setError(err instanceof Error ? err.message : "تعذر رفع الشعار.");
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url && <img src={url} alt="الشعار" className="h-12 w-12 rounded-full object-cover" />}
        <input type="hidden" name="logo_url" value={url} />
        <input className={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} />
      </div>
      {status && <p role="status" className="text-xs text-green-800">{status}</p>}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
