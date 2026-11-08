import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/store/AddToCart";
import { Gallery } from "@/components/store/Gallery";
import { Section } from "@/components/store/ProductGrid";
import { getProductBySlug, getProducts, getSettings } from "@/lib/data";
import { formatMRU } from "@/lib/format";
import { discountPercent, finalPrice, inStock } from "@/lib/product";

export const revalidate = 3600;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const dec = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProductBySlug(dec((await params).slug));
  if (!p) return {};
  const desc = p.short_description || p.description?.slice(0, 160) || undefined;
  return {
    title: p.name_ar, description: desc, alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title: p.name_ar, description: desc, images: p.product_images[0] ? [p.product_images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProductBySlug(dec((await params).slug));
  if (!p) notFound();
  const [settings, related] = await Promise.all([getSettings(), p.category_id ? getProducts({ category: p.categories?.slug, limit: 5 }) : Promise.resolve([])]);
  const ok = inStock(p);
  const pct = discountPercent(p);

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: p.name_ar, description: p.short_description || p.description || undefined,
    image: p.product_images.map((i) => i.url), url: `${SITE}/product/${p.slug}`,
    offers: { "@type": "Offer", priceCurrency: "MRU", price: finalPrice(p), availability: ok ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
        <Gallery images={p.product_images} alt={p.name_ar} />
        <div className="space-y-6">
          {p.categories && <p className="text-sm text-gold">{p.categories.name_ar}</p>}
          <h1 className="font-display text-4xl text-plum">{p.name_ar}</h1>
          <p className="flex flex-wrap items-center gap-3 text-2xl">
            <span className="font-bold text-plum">{formatMRU(finalPrice(p))}</span>
            {p.discount_price != null && <><s className="text-base text-plum/50">{formatMRU(p.price)}</s><span className="rounded-full bg-gold px-3 py-0.5 text-sm text-white">وفّري {pct}%</span></>}
          </p>
          <span className={`inline-block rounded-full px-3 py-1 text-xs ${ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{ok ? "متوفر" : "غير متوفر"}</span>
          {p.short_description && <p className="text-plum/80">{p.short_description}</p>}
          <AddToCart
            whatsapp={settings.whatsapp} storeName={settings.store_name ?? "Emteyt"}
            product={{ id: p.id, slug: p.slug, name: p.name_ar, price: finalPrice(p), image: p.product_images[0]?.url ?? null, colors: p.colors ?? [], sizes: p.sizes ?? [], stock: p.stock, available: ok }}
          />
          {p.description && <div className="border-t border-plum/10 pt-6"><h2 className="mb-2 font-medium">الوصف</h2><p className="whitespace-pre-line leading-relaxed text-plum/80">{p.description}</p></div>}
        </div>
      </div>
      <Section title="قد يعجبك أيضًا" products={related.filter((r) => r.id !== p.id).slice(0, 4)} />
    </>
  );
}
