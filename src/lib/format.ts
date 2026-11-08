export const formatMRU = (amount: number) =>
  `${new Intl.NumberFormat("ar-MR-u-nu-latn", { maximumFractionDigits: 0 }).format(amount)} MRU`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("ar-MR-u-nu-latn", { dateStyle: "medium", timeStyle: "short" });

export const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || crypto.randomUUID().slice(0, 8);
