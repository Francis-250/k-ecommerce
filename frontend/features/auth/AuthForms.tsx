"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { AccountField, Submit } from "@/app/(auth)/_components/AuthPage";
import { AuthApiError } from "./api";
import { useAuthStore } from "./store";
import { GoogleSignIn } from "./GoogleSignIn";

function errorMessage(error: unknown) {
  return error instanceof AuthApiError
    ? error.message
    : "Unable to connect to the authentication server.";
}

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      await login(
        String(form.get("login-email")),
        String(form.get("login-password")),
      );
      toast.success("Welcome back");
      const user = useAuthStore.getState().user;
      router.push(
        user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
          ? "/admin"
          : "/my-account",
      );
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <>
      <form onSubmit={submit}>
        <AccountField
          id="login-email"
          label="Username or email"
          type="email"
          autoComplete="email"
        />
        <AccountField
          id="login-password"
          label="Password"
          type="password"

          autoComplete="current-password"
        />
        <div className="login_submit">
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Login"}
          </button>
          <label htmlFor="remember">
            <input id="remember" type="checkbox" /> Remember me
          </label>
          <Link href="/forgot-password">Lost your password?</Link>
        </div>
      </form>
      {/* <GoogleSignIn /> */}
    </>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const status = useAuthStore((state) => state.status);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      await register({
        firstName: String(form.get("first-name")),
        lastName: String(form.get("last-name")),
        email: String(form.get("email")).trim().toLowerCase(),
        password: String(form.get("password")),
      });
      toast.success("Account created", {
        description: "Enter the verification code sent to your email.",
      });
      router.push("/verify-email");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <form onSubmit={submit}>
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
        label="Password"
        type="password"
        autoComplete="new-password"
      />
      <Submit>
        {status === "loading" ? "Creating account..." : "Register"}
      </Submit>
    </form>
  );
}

export function VerifyEmailForm() {
  const router = useRouter();
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const pendingEmail = useAuthStore((state) => state.pendingVerificationEmail);
  const status = useAuthStore((state) => state.status);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("verification-email")).trim().toLowerCase();

    try {
      await verifyEmail(email, String(form.get("verification-code")).trim());
      toast.success("Email verified", {
        description: "You can now sign in to your account.",
      });
      router.push("/login");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <form onSubmit={submit}>
      <p>Enter the verification code sent to your email address.</p>
      <AccountField
        key={pendingEmail}
        id="verification-email"
        label="Email address"
        type="email"
        autoComplete="email"
        defaultValue={pendingEmail}
      />
      <AccountField
        id="verification-code"
        label="Verification code"
        autoComplete="one-time-code"
        inputMode="numeric"
      />
      <Submit>{status === "loading" ? "Verifying..." : "Verify email"}</Submit>
    </form>
  );
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const requestPasswordReset = useAuthStore(
    (state) => state.requestPasswordReset,
  );
  const status = useAuthStore((state) => state.status);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();

    try {
      await requestPasswordReset(email);
      toast.success("Check your email", {
        description: "Enter the password reset code we sent you.",
      });
      router.push("/reset-password");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <form onSubmit={submit}>
      <p>
        Enter the email address linked to your account and we will send you a
        password reset code.
      </p>
      <AccountField
        id="email"
        label="Email address"
        type="email"
        autoComplete="email"
      />
      <Submit>
        {status === "loading" ? "Sending code..." : "Send reset code"}
      </Submit>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const pendingEmail = useAuthStore((state) => state.pendingVerificationEmail);
  const status = useAuthStore((state) => state.status);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmation = String(form.get("confirm-password"));

    if (password !== confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetPassword(
        String(form.get("reset-email")).trim().toLowerCase(),
        String(form.get("reset-code")).trim(),
        password,
      );
      toast.success("Password updated", {
        description: "Sign in with your new password.",
      });
      router.push("/login");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <form onSubmit={submit}>
      <AccountField
        key={pendingEmail}
        id="reset-email"
        label="Email address"
        type="email"
        autoComplete="email"
        defaultValue={pendingEmail}
      />
      <AccountField
        id="reset-code"
        label="Reset code"
        autoComplete="one-time-code"
        inputMode="numeric"
      />
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
      <Submit>
        {status === "loading" ? "Updating password..." : "Reset password"}
      </Submit>
    </form>
  );
}
