import { CheckoutForm } from "@/components/store/CheckoutForm";
import { getSettings } from "@/lib/data";

export const metadata = { title: "إتمام الطلب", robots: { index: false } };

export default async function CheckoutPage() {
  const s = await getSettings();
  return <CheckoutForm whatsapp={s.whatsapp} storeName={s.store_name ?? "Emteyt"} />;
}
