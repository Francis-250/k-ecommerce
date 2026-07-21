import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumb, CoronShell } from "@/components/coron/CoronShell";

export function AuthPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <CoronShell>
      <Breadcrumb title={title} />
      <div className="customer_login">
        <div className="row">
          <div className="col-lg-6 col-md-8 mx-auto">
            <div className="account_form">{children}</div>
          </div>
        </div>
      </div>
    </CoronShell>
  );
}

export function AccountField({
  id,
  label,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <p>
      <label htmlFor={id}>
        {label} <span>*</span>
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
      />
    </p>
  );
}

export function Submit({ children }: { children: ReactNode }) {
  return (
    <div className="login_submit">
      <button type="submit">{children}</button>
    </div>
  );
}

export function AccountLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <p>
      <Link href={href}>{children}</Link>
    </p>
  );
}
