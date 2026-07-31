import { AccountLink, AuthPage } from "../_components/AuthPage";
import { RegisterForm } from "@/features/auth/AuthForms";
export default function RegisterPage() {
  return (
    <AuthPage title="Register" tab="register">
      <h2>Register</h2>
      <RegisterForm />
      <AccountLink href="/login">Already have an account? Login</AccountLink>
    </AuthPage>
  );
}
