import Link from "next/link";
import type { Settings } from "@/lib/types";

export function Footer({ settings }: { settings: Settings }) {
  const social = [["إنستغرام", settings.instagram], ["فيسبوك", settings.facebook], ["تيك توك", settings.tiktok]].filter(([, u]) => u);
  return (
    <footer className="mt-20 bg-plum-dark text-ivory">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <p className="font-display text-3xl">{settings.store_name ?? "Emteyt"}</p>
          {settings.description && <p className="text-sm leading-relaxed opacity-80">{settings.description}</p>}
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium text-gold-light">تواصلي معنا</p>
          {settings.phone && <p dir="ltr" className="text-end">{settings.phone}</p>}
          {settings.whatsapp && <a href={`https://wa.me/${settings.whatsapp}`} className="block underline">واتساب</a>}
          <div className="flex gap-4 pt-1">
            {social.map(([n, u]) => <a key={n} href={u!} target="_blank" rel="noopener noreferrer" className="underline">{n}</a>)}
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium text-gold-light">التوصيل والدفع</p>
          <p className="whitespace-pre-line leading-relaxed opacity-80">{settings.delivery_info || "تواصلي معنا لمعرفة تفاصيل التوصيل."}</p>
          <Link href="/shop" className="inline-block pt-2 underline">تصفحي المتجر</Link>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs opacity-60">© {new Date().getFullYear()} {settings.store_name ?? "Emteyt"}</p>
    </footer>
  );
}
