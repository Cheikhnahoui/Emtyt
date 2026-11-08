import Link from "next/link";
import type { StoreProduct } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: StoreProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}

export function Section({ title, href, products }: { title: string; href?: string; products: StoreProduct[] }) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 pt-16">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-3xl text-plum">{title}</h2>
        {href && <Link href={href} className="text-sm text-gold underline-offset-4 hover:underline">عرض الكل ←</Link>}
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
