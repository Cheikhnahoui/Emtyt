import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/store/ProductGrid";
import { getBestSellers, getCategories, getProducts, getSettings } from "@/lib/data";

export const revalidate = 3600; // admin actions also call revalidatePath, so changes show immediately

export default async function Home() {
  const [settings, categories, featured, newest, best, offers] = await Promise.all([
    getSettings(), getCategories(),
    getProducts({ featured: true, limit: 8 }), getProducts({ limit: 8 }), getBestSellers(8),
    getProducts({ offers: true, limit: 8 }),
  ]);
  const heroImg = (featured[0] ?? newest[0])?.product_images[0]?.url;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-soft/70 to-ivory">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-24">
          <div className="animate-fade-up space-y-6">
            <p className="text-sm tracking-widest text-gold">ملاحف وأزياء نسائية موريتانية</p>
            <h1 className="font-display text-5xl leading-tight text-plum md:text-7xl">{settings.store_name ?? "Emteyt"}</h1>
            <p className="max-w-md leading-relaxed text-plum/80">
              {settings.description || "أناقة الملحفة الموريتانية بلمسة عصرية. تشكيلة مختارة بعناية من الملاحف والأزياء والإكسسوارات."}
            </p>
            <div className="flex gap-3">
              <Link href="/shop" className="rounded-full bg-plum px-7 py-3 text-ivory transition hover:bg-plum-dark">تسوقي الآن</Link>
              <Link href="/shop?offers=1" className="rounded-full border border-plum/30 px-7 py-3 transition hover:bg-white">العروض</Link>
            </div>
          </div>
          <div className="animate-fade-up mx-auto w-full max-w-sm [animation-delay:150ms]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-3xl bg-gradient-to-br from-gold-light to-plum shadow-2xl ring-8 ring-white/60">
              {heroImg && <Image src={heroImg} alt="" fill priority sizes="(max-width:768px) 80vw, 400px" className="object-cover" />}
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl space-y-6 px-4 pt-16">
          <h2 className="font-display text-3xl text-plum">تسوقي حسب التصنيف</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.id} href={`/shop?category=${c.slug}`}
                className="rounded-2xl bg-white px-4 py-8 text-center font-display text-xl text-plum shadow-sm ring-1 ring-plum/10 transition hover:-translate-y-1 hover:bg-rose-soft hover:shadow-md">
                {c.name_ar}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Section title="منتجات مميزة" href="/shop" products={featured} />
      <Section title="وصل حديثًا" href="/shop" products={newest} />
      <Section title="الأكثر مبيعًا" products={best} />
      <Section title="عروض وتخفيضات" href="/shop?offers=1" products={offers} />

      {!featured.length && !newest.length && (
        <p className="mx-auto max-w-6xl px-4 py-20 text-center text-plum/60">سيتم عرض المنتجات هنا قريبًا.</p>
      )}
    </>
  );
}
