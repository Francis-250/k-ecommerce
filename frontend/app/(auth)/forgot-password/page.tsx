import { AccountLink, AuthPage } from "../_components/AuthPage";
import { ForgotPasswordForm } from "@/features/auth/AuthForms";
export default function ForgotPasswordPage() {
  return (
    <AuthPage title="Forgot password" tab="forgot-password">
      <h2>Forgot password</h2>
      <ForgotPasswordForm />
      <AccountLink href="/login">Back to login</AccountLink>
    </AuthPage>
  );
}
