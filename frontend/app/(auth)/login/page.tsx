import Link from "next/link";
import { AccountField } from "../_components/AuthPage";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";

export default function LoginPage() {
  return (
    <StorefrontShell>
      <Breadcrumb title="Login" />
      <div className="customer_login">
        <div className="row">
          <div className="col-lg-6 col-md-6">
            <div className="account_form">
              <h2>login</h2>
              <form>
                <AccountField
                  id="login-email"
                  label="Username or email"
                  autoComplete="email"
                />
                <AccountField
                  id="login-password"
                  label="Passwords"
                  type="password"
                  autoComplete="current-password"
                />
                <div className="login_submit">
                  <button type="submit">login</button>
                  <label htmlFor="remember">
                    <input id="remember" type="checkbox" /> Remember me
                  </label>
                  <Link href="/forgot-password">Lost your password?</Link>
                </div>
              </form>
            </div>
          </div>
          <div className="col-lg-6 col-md-6">
            <div className="account_form register">
              <h2>Register</h2>
              <form>
                <AccountField
                  id="register-email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                />
                <AccountField
                  id="register-password"
                  label="Passwords"
                  type="password"
                  autoComplete="new-password"
                />
                <div className="login_submit">
                  <button type="submit">Register</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
