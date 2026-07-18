import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="h-dvh overflow-hidden bg-white text-slate-950">
      <div className="grid h-full lg:grid-cols-[42%_58%]">
        <section className="relative hidden h-full overflow-hidden lg:block">
          <Image
            src="/images/auth-fashion.jpg"
            alt="A smiling customer shopping for fashion"
            fill
            priority
            className="object-cover object-center"
            sizes="42vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/35 via-transparent to-transparent" />
          <Link
            href="/"
            className="absolute left-8 top-7 rounded-full bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm"
          >
            I-RAS Styles
          </Link>
        </section>
        <section className="flex h-full items-center overflow-hidden px-6 py-5 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-lg">
            <Link
              href="/"
              className="mb-7 inline-flex items-center gap-2 font-bold text-indigo-700 lg:hidden"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
                I
              </span>
              I-RAS Styles
            </Link>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#17175c] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
              {description}
            </p>
            <div className="mt-6">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function Field({
  label,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 w-full border-0 border-b border-slate-200 bg-transparent px-1 text-base text-[#17175c] outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0"
      />
    </label>
  );
}

export function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="h-12 w-full rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
    >
      {children}
    </button>
  );
}

export function AuthFooter({
  prompt,
  href,
  action,
}: {
  prompt: string;
  href: string;
  action: string;
}) {
  return (
    <p className="mt-5 text-center text-sm text-slate-500">
      {prompt}{" "}
      <Link href={href} className="font-bold text-indigo-800 hover:underline">
        {action}
      </Link>
    </p>
  );
}
