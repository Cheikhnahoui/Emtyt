import { STATUS_COLORS, STATUS_LABELS } from "@/lib/orders";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_COLORS[status] ?? "bg-gray-100"}`}>{STATUS_LABELS[status] ?? status}</span>;
}
