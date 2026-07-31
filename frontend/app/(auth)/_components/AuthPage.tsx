import Link from "next/link";
import type { ReactNode } from "react";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";

import { AuthDrawerAutoOpen } from "@/features/auth/AuthDrawerAutoOpen";
import type { AuthDrawerTab } from "@/features/auth/store";

export function AuthPage({
  title,
  tab = "login",
  children,
}: {
  title: string;
  tab?: AuthDrawerTab;
  children: ReactNode;
}) {
  return (
    <StorefrontShell>
      <AuthDrawerAutoOpen tab={tab} />
      <Breadcrumb title={title} />
      <div className="customer_login">
        <div className="row">
          <div className="col-lg-6 col-md-8 mx-auto">
            <div className="account_form">{children}</div>
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}

export function AccountField({
  id,
  label,
  type = "text",
  autoComplete,
  defaultValue,
  inputMode,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  inputMode?: "text" | "numeric" | "email" | "tel";
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
        defaultValue={defaultValue}
        inputMode={inputMode}
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
