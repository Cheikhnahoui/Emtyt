export const input =
  "w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30";
export const btn =
  "rounded-full bg-plum px-5 py-2.5 text-sm font-medium text-ivory transition hover:bg-plum-dark disabled:opacity-60";
export const btnGhost = "rounded-full border border-plum/25 px-4 py-2 text-sm text-plum transition hover:bg-rose-soft";
export const btnDanger = "rounded-full border border-red-300 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50";
export const card = "rounded-2xl border border-plum/10 bg-white p-5 shadow-sm";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-plum/60">{hint}</span>}
      {error && <span role="alert" className="block text-xs text-red-700">{error}</span>}
    </label>
  );
}
