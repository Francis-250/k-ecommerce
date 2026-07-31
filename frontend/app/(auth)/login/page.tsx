import Link from "next/link";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { LoginForm } from "@/features/auth/AuthForms";
import { AuthenticatedRedirect } from "@/features/auth/AuthenticatedRedirect";
import { AuthDrawerAutoOpen } from "@/features/auth/AuthDrawerAutoOpen";

export default function LoginPage() {
  return (
    <StorefrontShell>
      <AuthenticatedRedirect />
      <AuthDrawerAutoOpen tab="login" />
      <Breadcrumb title="Login" />
      <div className="customer_login">
        <div className="row">
          <div className="col-lg-6 col-md-6">
            <div className="account_form">
              <h2>login</h2>
              <LoginForm />
            </div>
          </div>
          <div className="col-lg-6 col-md-6">
            <div className="account_form register">
              <h2>Register</h2>
              <p>Create an account to save addresses and review your orders.</p>
              <div className="login_submit">
                <Link href="/register">Register</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
