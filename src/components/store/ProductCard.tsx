import Image from "next/image";
import Link from "next/link";
import { formatMRU } from "@/lib/format";
import { discountPercent, inStock } from "@/lib/product";
import type { StoreProduct } from "@/lib/types";

export function ProductCard({ p }: { p: StoreProduct }) {
  const img = p.product_images[0]?.url;
  const ok = inStock(p);
  const pct = discountPercent(p);
  return (
    <Link href={`/product/${p.slug}`} className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-plum/10 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[3/4] overflow-hidden bg-rose-soft">
        {img ? (
          <Image src={img} alt={p.name_ar} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center font-display text-3xl text-plum/30">Emteyt</div>
        )}
        {pct > 0 && <span className="absolute start-2 top-2 rounded-full bg-gold px-2 py-0.5 text-xs text-white">-{pct}%</span>}
        {!ok && <span className="absolute inset-x-0 bottom-0 bg-plum-dark/80 py-1 text-center text-xs text-ivory">غير متوفر</span>}
      </div>
      <div className="space-y-1 p-3">
        {p.categories && <p className="text-xs text-gold">{p.categories.name_ar}</p>}
        <h3 className="line-clamp-1 font-medium">{p.name_ar}</h3>
        {p.short_description && <p className="line-clamp-2 text-xs text-plum/60">{p.short_description}</p>}
        <p className="pt-1 text-sm">
          {p.discount_price != null
            ? <><span className="font-bold text-plum">{formatMRU(p.discount_price)}</span> <s className="text-xs text-plum/50">{formatMRU(p.price)}</s></>
            : <span className="font-bold text-plum">{formatMRU(p.price)}</span>}
        </p>
      </div>
    </Link>
  );
}
