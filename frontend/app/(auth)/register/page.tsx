import {
  AccountField,
  AccountLink,
  AuthPage,
  Submit,
} from "../_components/AuthPage";
export default function RegisterPage() {
  return (
    <AuthPage title="Register">
      <h2>Register</h2>
      <form>
        <AccountField
          id="first-name"
          label="First name"
          autoComplete="given-name"
        />
        <AccountField
          id="last-name"
          label="Last name"
          autoComplete="family-name"
        />
        <AccountField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
        />
        <AccountField
          id="password"
          label="Passwords"
          type="password"
          autoComplete="new-password"
        />
        <Submit>Register</Submit>
      </form>
      <AccountLink href="/login">Already have an account? Login</AccountLink>
    </AuthPage>
  );
}
