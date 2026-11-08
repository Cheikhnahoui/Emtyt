import { CartProvider } from "@/components/store/CartProvider";
import { Footer } from "@/components/store/Footer";
import { Header } from "@/components/store/Header";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { getSettings } from "@/lib/data";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <CartProvider>
      <Header settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
      <WhatsAppFloat number={settings.whatsapp} />
    </CartProvider>
  );
}
