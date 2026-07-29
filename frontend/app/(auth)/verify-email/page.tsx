import { AccountLink, AuthPage } from "../_components/AuthPage";
import { VerifyEmailForm } from "@/features/auth/AuthForms";
export default function VerifyEmailPage() {
  return (
    <AuthPage title="Verify email">
      <h2>Verify email</h2>
      <VerifyEmailForm />
      <AccountLink href="/register">Return to registration</AccountLink>
    </AuthPage>
  );
}
