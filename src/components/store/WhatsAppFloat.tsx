export function WhatsAppFloat({ number }: { number?: string | null }) {
  if (!number) return null;
  return (
    <a
      href={`https://wa.me/${number}`} target="_blank" rel="noopener noreferrer" aria-label="تواصلي معنا عبر واتساب"
      className="fixed bottom-5 start-5 z-50 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:scale-105"
    >
      واتساب
    </a>
  );
}
