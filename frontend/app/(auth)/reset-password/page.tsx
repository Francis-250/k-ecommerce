import { AuthFooter, AuthShell, Field, PrimaryButton } from "../auth-ui";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Secure your account"
      title="Set a new password"
      description="Choose a strong password you haven’t used before. It must contain at least eight characters."
    >
      <form className="space-y-5">
        <Field
          label="New password"
          type="password"
          placeholder="New password"
          autoComplete="new-password"
        />
        <Field
          label="Confirm password"
          type="password"
          placeholder="Confirm new password"
          autoComplete="new-password"
        />
        <p className="text-xs text-slate-400">
          Use 8+ characters with a number and a symbol.
        </p>
        <PrimaryButton>Reset password</PrimaryButton>
      </form>
      <AuthFooter
        prompt="Return to your account"
        href="/login"
        action="Back to login"
      />
    </AuthShell>
  );
}
