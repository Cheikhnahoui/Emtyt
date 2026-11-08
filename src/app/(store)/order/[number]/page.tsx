import { OrderConfirmation } from "@/components/store/OrderConfirmation";
import { getSettings } from "@/lib/data";

export const metadata = { title: "تأكيد الطلب", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const s = await getSettings();
  return <OrderConfirmation number={number.replace(/\D/g, "")} whatsapp={s.whatsapp} />;
}
