import {
  AccountField,
  AccountLink,
  AuthPage,
  Submit,
} from "../_components/AuthPage";
export default function ResetPasswordPage() {
  return (
    <AuthPage title="Reset password">
      <h2>Reset password</h2>
      <form>
        <AccountField
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
        />
        <AccountField
          id="confirm-password"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
        />
        <Submit>Reset password</Submit>
      </form>
      <AccountLink href="/login">Back to login</AccountLink>
    </AuthPage>
  );
}
