import Link from "next/link";
import { AuthFooter, AuthShell, Field, PrimaryButton } from "../auth-ui";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Join our community"
      title="Create your account"
      description="Save your favourites, enjoy a faster checkout, and keep every order in one place."
    >
      <form className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="First name"
            placeholder="First name"
            autoComplete="given-name"
          />
          <Field
            label="Last name"
            placeholder="Last name"
            autoComplete="family-name"
          />
        </div>
        <Field
          label="Email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          placeholder="Create password"
          autoComplete="new-password"
        />
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-500">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-indigo-600" />
          <span>
            I agree to the{" "}
            <Link href="#" className="font-semibold text-indigo-700">
              Terms
            </Link>{" "}
            and Privacy Policy.
          </span>
        </label>
        <PrimaryButton>Create account</PrimaryButton>
      </form>
      <AuthFooter
        prompt="Already have an account?"
        href="/login"
        action="Sign in"
      />
    </AuthShell>
  );
}
