import Link from "next/link";

export function DashboardPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">I</span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">I-RAS Styles</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
        <Link href="/" className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700">Back to home</Link>
      </section>
    </main>
  );
}
