import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div className="space-y-4">
        <p className="font-display text-7xl text-gold">404</p>
        <h1 className="text-xl">الصفحة غير موجودة</h1>
        <Link href="/" className="inline-block rounded-full bg-plum px-6 py-2.5 text-ivory">العودة للرئيسية</Link>
      </div>
    </main>
  );
}
