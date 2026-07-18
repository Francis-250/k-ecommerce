import Link from "next/link";
import { AuthFooter, AuthShell, Field, PrimaryButton } from "../auth-ui";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome to I-RAS Styles"
      title="Hello, Welcome back"
      description="Sign in to continue shopping, track your orders, and discover styles selected for you."
    >
    <form className="space-y-5">
        <Field
          label="Email"
          type="email"
          placeholder="Username or email"
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between gap-4 text-sm text-indigo-600">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-indigo-300 accent-indigo-600"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-medium hover:underline">
            Forgot password?
          </Link>
        </div>
        <PrimaryButton>Login</PrimaryButton>
      </form>
      <AuthFooter
        prompt="Don’t have an account?"
        href="/register"
        action="Create one"
      />
    </AuthShell>
  );
}
