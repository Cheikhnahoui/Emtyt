import Image from "next/image";
import Link from "next/link";
import type { Settings } from "@/lib/types";
import { CartLink } from "./CartLink";

export function Header({ settings }: { settings: Settings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-plum/10 bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {settings.logo_url && <Image src={settings.logo_url} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />}
          <span className="font-display text-2xl text-plum">{settings.store_name ?? "Emteyt"}</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm sm:gap-6">
          <Link href="/shop" className="transition hover:text-gold">المتجر</Link>
          <Link href="/shop?offers=1" className="transition hover:text-gold">العروض</Link>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}
