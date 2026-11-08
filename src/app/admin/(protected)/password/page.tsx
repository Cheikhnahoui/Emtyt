import { changePassword } from "@/actions/password";
import { Field, btn, card, input } from "@/components/admin/ui";

export const metadata = { title: "كلمة المرور" };

export default async function PasswordPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  return (
    <div className="max-w-md space-y-6">
      <h1 className="font-display text-3xl">تغيير كلمة المرور</h1>
      {saved && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">تم تغيير كلمة المرور.</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <form action={changePassword} className={`${card} space-y-4`}>
        <Field label="كلمة المرور الجديدة" hint="8 أحرف على الأقل"><input className={input} type="password" name="password" required minLength={8} autoComplete="new-password" dir="ltr" /></Field>
        <Field label="أعد كتابة كلمة المرور"><input className={input} type="password" name="confirm" required minLength={8} autoComplete="new-password" dir="ltr" /></Field>
        <button className={btn}>حفظ</button>
      </form>
    </div>
  );
}