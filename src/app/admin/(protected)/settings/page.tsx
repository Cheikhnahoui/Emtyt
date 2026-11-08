import { saveSettings } from "@/actions/settings";
import { LogoField } from "@/components/admin/LogoField";
import { Field, btn, card, input } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "إعدادات المتجر" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();
  const { data: s } = await supabase.from("settings").select("*").eq("id", 1).single();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-3xl">إعدادات المتجر</h1>
      {saved && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">تم حفظ الإعدادات.</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <form action={saveSettings} className={`${card} space-y-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="اسم المتجر *"><input className={input} name="store_name" required defaultValue={s?.store_name ?? "Emteyt"} /></Field>
          <Field label="الشعار" hint="JPG أو PNG أو WebP">
            <LogoField current={s?.logo_url ?? null} />
          </Field>
          <Field label="رقم الهاتف"><input className={input} name="phone" dir="ltr" defaultValue={s?.phone ?? ""} /></Field>
          <Field label="رقم واتساب" hint="بالصيغة الدولية دون + أو مسافات، مثال: 22212345678">
            <input className={input} name="whatsapp" dir="ltr" defaultValue={s?.whatsapp ?? ""} />
          </Field>
          <Field label="إنستغرام"><input className={input} name="instagram" dir="ltr" placeholder="https://" defaultValue={s?.instagram ?? ""} /></Field>
          <Field label="فيسبوك"><input className={input} name="facebook" dir="ltr" placeholder="https://" defaultValue={s?.facebook ?? ""} /></Field>
          <Field label="تيك توك"><input className={input} name="tiktok" dir="ltr" placeholder="https://" defaultValue={s?.tiktok ?? ""} /></Field>
        </div>
        <Field label="وصف المتجر"><textarea className={input} name="description" rows={3} defaultValue={s?.description ?? ""} /></Field>
        <Field label="معلومات التوصيل والدفع" hint="مثال: مناطق التوصيل، الأسعار، طرق الدفع (نقدًا عند الاستلام، بنكيلي، مصرفي…)">
          <textarea className={input} name="delivery_info" rows={4} defaultValue={s?.delivery_info ?? ""} />
        </Field>
        <button className={btn}>حفظ الإعدادات</button>
      </form>
    </div>
  );
}
