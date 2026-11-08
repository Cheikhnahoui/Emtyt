"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="relative rounded-full bg-plum px-4 py-1.5 text-ivory transition hover:bg-plum-dark">
      السلة
      {count > 0 && <span className="absolute -end-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px]">{count}</span>}
    </Link>
  );
}
