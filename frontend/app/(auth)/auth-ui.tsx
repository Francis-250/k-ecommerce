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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-white to-violet-100 text-slate-950">
      <div className="absolute -left-16 -top-20 h-48 w-48 rotate-12 rounded-[3rem] bg-violet-200/50" />
      <div className="absolute -bottom-24 right-24 h-64 w-64 rotate-12 rounded-[4rem] bg-fuchsia-200/40" />
      <div className="relative mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden min-h-screen overflow-hidden lg:block">
          <Image
            src="/images/auth-reference.png"
            alt="People shopping securely online"
            fill
            priority
            className="object-cover object-left"
            sizes="58vw"
          />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-white" />
          <Link
            href="/"
            className="absolute left-10 top-9 rounded-full bg-white/90 px-5 py-2 text-sm font-bold tracking-wide text-indigo-700 shadow-sm backdrop-blur"
          >
            I-RAS Styles
          </Link>
        </section>
        <section className="relative flex items-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-xl">
            <Link
              href="/"
              className="mb-14 inline-flex items-center gap-2 font-bold text-indigo-700 lg:hidden"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
                I
              </span>
              I-RAS Styles
            </Link>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-indigo-500">
              {eyebrow}
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-[#17175c] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-500">
              {description}
            </p>
            <div className="mt-10">{children}</div>
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
        className="h-14 w-full border-0 border-b border-indigo-100 bg-transparent px-1 text-lg text-[#17175c] outline-none transition placeholder:text-indigo-200 focus:border-indigo-500 focus:ring-0"
      />
    </label>
  );
}

export function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="h-14 w-full rounded-md bg-indigo-600 px-6 text-base font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
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
    <p className="mt-8 text-center text-sm text-indigo-500">
      {prompt}{" "}
      <Link href={href} className="font-bold text-indigo-800 hover:underline">
        {action}
      </Link>
    </p>
  );
}
