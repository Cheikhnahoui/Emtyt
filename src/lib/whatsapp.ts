import { formatMRU } from "./format";

export const waLink = (number: string | null | undefined, text: string) =>
  `https://wa.me/${(number ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

type Line = { name: string; quantity: number; price: number; color?: string; size?: string };

export function orderMessage(o: { store: string; number: number; name: string; phone: string; address: string; items: Line[]; total: number }) {
  const lines = o.items.map((i) =>
    `• ${i.name} × ${i.quantity}${i.color ? ` | اللون: ${i.color}` : ""}${i.size ? ` | المقاس: ${i.size}` : ""} — ${formatMRU(i.price * i.quantity)}`);
  return [
    `طلب جديد من ${o.store} — رقم #${o.number}`, "", ...lines, "",
    `الإجمالي: ${formatMRU(o.total)}`, `الاسم: ${o.name}`, `الهاتف: ${o.phone}`, `العنوان: ${o.address}`,
  ].join("\n");
}
