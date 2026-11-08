import Link from "next/link";
import { signOut } from "@/actions/auth";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "لوحة التحكم", robots: { index: false, follow: false } };

const nav = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/orders", label: "الطلبات" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/categories", label: "التصنيفات" },
  { href: "/admin/settings", label: "إعدادات المتجر" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-plum-dark text-ivory md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <div className="flex items-center justify-between p-4 md:block md:p-6">
          <Link href="/admin" className="font-display text-3xl">Emteyt</Link>
          <form action={signOut} className="md:mt-6"><button className="text-xs underline opacity-80 hover:opacity-100">تسجيل الخروج</button></form>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-4">
          {nav.map((n) => <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-xl px-4 py-2 text-sm transition hover:bg-white/10">{n.label}</Link>)}
          <Link href="/" target="_blank" className="whitespace-nowrap rounded-xl px-4 py-2 text-sm text-gold-light transition hover:bg-white/10">عرض المتجر ↗</Link>
        </nav>
        <p className="hidden px-6 pt-4 text-xs opacity-60 md:block" dir="ltr">{user.email}</p>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
