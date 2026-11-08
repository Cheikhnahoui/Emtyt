"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div className="space-y-4">
        <h1 className="text-xl">حدث خطأ غير متوقع</h1>
        <button onClick={reset} className="rounded-full bg-plum px-6 py-2.5 text-ivory">إعادة المحاولة</button>
      </div>
    </main>
  );
}
