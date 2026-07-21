import {
  AccountField,
  AccountLink,
  AuthPage,
  Submit,
} from "../_components/AuthPage";
export default function ForgotPasswordPage() {
  return (
    <AuthPage title="Forgot password">
      <h2>Forgot password</h2>
      <form>
        <p>
          Enter the email address linked to your account and we will send you a
          password reset link.
        </p>
        <AccountField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
        />
        <Submit>Send reset link</Submit>
      </form>
      <AccountLink href="/login">Back to login</AccountLink>
    </AuthPage>
  );
}
