export const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"] as const;
export const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار", confirmed: "مؤكد", processing: "قيد التجهيز", shipped: "تم الشحن", completed: "مكتمل", cancelled: "ملغي",
};
export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800", confirmed: "bg-blue-100 text-blue-800", processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800", completed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800",
};
