import { AuthFooter, AuthShell, Field, PrimaryButton } from "../auth-ui";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Forgot password?"
      description="No worries. Enter the email linked to your account and we’ll send you a secure reset link."
    >
      <form className="space-y-5">
        <Field
          label="Email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
        />
        <PrimaryButton>Send reset link</PrimaryButton>
      </form>
      <AuthFooter
        prompt="Remembered your password?"
        href="/login"
        action="Back to login"
      />
    </AuthShell>
  );
}
