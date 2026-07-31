import { AccountLink, AuthPage } from "../_components/AuthPage";
import { ResetPasswordForm } from "@/features/auth/AuthForms";
export default function ResetPasswordPage() {
  return (
    <AuthPage title="Reset password" tab="reset-password">
      <h2>Reset password</h2>
      <ResetPasswordForm />
      <AccountLink href="/login">Back to login</AccountLink>
    </AuthPage>
  );
}
