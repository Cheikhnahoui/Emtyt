import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "دخول الإدارة", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-rose-soft/40 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-3xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="font-display text-4xl text-plum">Emteyt</h1>
          <p className="mt-1 text-sm text-plum/70">لوحة التحكم</p>
        </div>
        <LoginForm forbidden={error === "forbidden"} />
      </div>
    </main>
  );
}
