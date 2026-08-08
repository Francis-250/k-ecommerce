"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { AuthApiError } from "./api";
import { GoogleSignIn } from "./GoogleSignIn";
import { useAuthStore } from "./store";

function errorMessage(error: unknown) {
  return error instanceof AuthApiError
    ? error.message
    : "Unable to connect to the authentication server.";
}

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const setAuthDrawerTab = useAuthStore((state) => state.setAuthDrawerTab);
  const setPendingVerificationEmail = useAuthStore(
    (state) => state.setPendingVerificationEmail,
  );
  const closeAuthDrawer = useAuthStore((state) => state.closeAuthDrawer);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();

    try {
      await login(
        email,
        String(form.get("password")),
      );
      toast.success("Welcome back!");
      closeAuthDrawer();
      const currentUser = useAuthStore.getState().user;
      const redirect =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null;
      if (redirect && redirect.startsWith("/")) {
        router.push(redirect);
      } else if (
        currentUser?.role === "ADMIN" ||
        currentUser?.role === "SUPER_ADMIN"
      ) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error) {
      const msg = errorMessage(error);
      toast.error(msg);

      if (
        error instanceof AuthApiError &&
        (error.status === 403 || msg.toLowerCase().includes("verify"))
      ) {
        setPendingVerificationEmail(email);
        setAuthDrawerTab("verify-email");
      }
    }
  }

  return (
    <form onSubmit={submit} className="auth_drawer_form">
      <div className="auth_field">
        <label htmlFor="drawer-login-email">Email or Username</label>
        <div className="auth_input_wrap">
          <Mail size={16} className="input_icon" aria-hidden="true" />
          <input
            id="drawer-login-email"
            name="email"
            type="email"
            placeholder="your.email@example.com"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="auth_field">
        <label htmlFor="drawer-login-password">Password</label>
        <div className="auth_input_wrap">
          <Lock size={16} className="input_icon" aria-hidden="true" />
          <input
            id="drawer-login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="toggle_password_btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="auth_options_row">
        <label htmlFor="drawer-remember" className="remember_label">
          <input id="drawer-remember" type="checkbox" />
          <span>Remember me</span>
        </label>
        <button
          type="button"
          className="forgot_password_btn"
          onClick={() => setAuthDrawerTab("forgot-password")}
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        className="auth_primary_btn"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Signing in..." : "Sign In"}
      </button>

      <div className="auth_switch_footer">
        <span>Don't have an account?</span>{" "}
        <button
          type="button"
          className="switch_tab_btn"
          onClick={() => setAuthDrawerTab("register")}
        >
          Create Account
        </button>
      </div>

      <GoogleSignIn />
    </form>
  );
}

export function RegisterForm() {
  const register = useAuthStore((state) => state.register);
  const status = useAuthStore((state) => state.status);
  const setAuthDrawerTab = useAuthStore((state) => state.setAuthDrawerTab);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      await register({
        firstName: String(form.get("first-name")).trim(),
        lastName: String(form.get("last-name")).trim(),
        email: String(form.get("email")).trim().toLowerCase(),
        password: String(form.get("password")),
        role: "CUSTOMER", // Role selection removed, default to CUSTOMER
      });
      toast.success("Account created!", {
        description: "Enter the verification code sent to your email.",
      });
      setAuthDrawerTab("verify-email");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <form onSubmit={submit} className="auth_drawer_form">
      <div className="auth_field_row">
        <div className="auth_field">
          <label htmlFor="drawer-first-name">First Name</label>
          <div className="auth_input_wrap">
            <User size={16} className="input_icon" aria-hidden="true" />
            <input
              id="drawer-first-name"
              name="first-name"
              type="text"
              placeholder="First name"
              autoComplete="given-name"
              required
            />
          </div>
        </div>

        <div className="auth_field">
          <label htmlFor="drawer-last-name">Last Name</label>
          <div className="auth_input_wrap">
            <User size={16} className="input_icon" aria-hidden="true" />
            <input
              id="drawer-last-name"
              name="last-name"
              type="text"
              placeholder="Last name"
              autoComplete="family-name"
              required
            />
          </div>
        </div>
      </div>

      <div className="auth_field">
        <label htmlFor="drawer-register-email">Email Address</label>
        <div className="auth_input_wrap">
          <Mail size={16} className="input_icon" aria-hidden="true" />
          <input
            id="drawer-register-email"
            name="email"
            type="email"
            placeholder="your.email@example.com"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="auth_field">
        <label htmlFor="drawer-register-password">Password</label>
        <div className="auth_input_wrap">
          <Lock size={16} className="input_icon" aria-hidden="true" />
          <input
            id="drawer-register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="toggle_password_btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="auth_primary_btn"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Creating Account..." : "Create Account"}
      </button>

      <div className="auth_switch_footer">
        <span>Already have an account?</span>{" "}
        <button
          type="button"
          className="switch_tab_btn"
          onClick={() => setAuthDrawerTab("login")}
        >
          Sign In
        </button>
      </div>

      <GoogleSignIn />
    </form>
  );
}

export function VerifyEmailForm() {
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const resendOtp = useAuthStore((state) => state.resendOtp);
  const pendingEmail = useAuthStore((state) => state.pendingVerificationEmail);
  const status = useAuthStore((state) => state.status);
  const setAuthDrawerTab = useAuthStore((state) => state.setAuthDrawerTab);
  const [resending, setResending] = useState(false);
  const [emailInput, setEmailInput] = useState(pendingEmail);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();

    try {
      await verifyEmail(email, String(form.get("otp")).trim());
      toast.success("Email verified successfully!", {
        description: "You can now sign in with your credentials.",
      });
      setAuthDrawerTab("login");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function handleResend() {
    if (!emailInput) {
      toast.error("Please enter your email address to resend code.");
      return;
    }
    setResending(true);
    try {
      await resendOtp(emailInput.trim().toLowerCase());
      toast.success("Verification code resent!", {
        description: "Please check your email inbox (and spam folder).",
      });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={submit} className="auth_drawer_form">
      <p className="auth_info_desc">
        We sent a verification code to your email. Enter it below to verify your account.
      </p>

      <div className="auth_field">
        <label htmlFor="drawer-verify-email">Email Address</label>
        <div className="auth_input_wrap">
          <Mail size={16} className="input_icon" aria-hidden="true" />
          <input
            id="drawer-verify-email"
            name="email"
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="your.email@example.com"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="auth_field">
        <div className="auth_field_header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <label htmlFor="drawer-otp">Verification Code</label>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || status === "loading"}
            className="forgot_password_btn"
            style={{ fontSize: "0.8rem" }}
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
        </div>
        <div className="auth_input_wrap">
          <Lock size={16} className="input_icon" aria-hidden="true" />
          <input
            id="drawer-otp"
            name="otp"
            type="text"
            placeholder="Enter code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="auth_primary_btn"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Verifying..." : "Verify Email"}
      </button>

      <div className="auth_switch_footer">
        <button
          type="button"
          className="switch_tab_btn"
          onClick={() => setAuthDrawerTab("login")}
        >
          ← Back to Sign In
        </button>
      </div>
    </form>
  );
}

export function ForgotPasswordForm() {
  const requestPasswordReset = useAuthStore(
    (state) => state.requestPasswordReset,
  );
  const status = useAuthStore((state) => state.status);
  const setAuthDrawerTab = useAuthStore((state) => state.setAuthDrawerTab);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();

    try {
      await requestPasswordReset(email);
      toast.success("Reset code sent!", {
        description: "Check your email for the password reset code.",
      });
      setAuthDrawerTab("reset-password");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <form onSubmit={submit} className="auth_drawer_form">
      <p className="auth_info_desc">
        Enter the email address associated with your account and we will send you a reset code.
      </p>

      <div className="auth_field">
        <label htmlFor="drawer-forgot-email">Email Address</label>
        <div className="auth_input_wrap">
          <Mail size={16} className="input_icon" aria-hidden="true" />
          <input
            id="drawer-forgot-email"
            name="email"
            type="email"
            placeholder="your.email@example.com"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="auth_primary_btn"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending Code..." : "Send Reset Code"}
      </button>

      <div className="auth_switch_footer">
        <button
          type="button"
          className="switch_tab_btn"
          onClick={() => setAuthDrawerTab("login")}
        >
          ← Back to Sign In
        </button>
      </div>
    </form>
  );
}

export function ResetPasswordForm() {
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const pendingEmail = useAuthStore((state) => state.pendingVerificationEmail);
  const status = useAuthStore((state) => state.status);
  const setAuthDrawerTab = useAuthStore((state) => state.setAuthDrawerTab);
  const [showPassword, setShowPassword] = useState(false);

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
        String(form.get("email")).trim().toLowerCase(),
        String(form.get("otp")).trim(),
        password,
      );
      toast.success("Password reset successfully!", {
        description: "Sign in with your new password.",
      });
      setAuthDrawerTab("login");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <form onSubmit={submit} className="auth_drawer_form">
      <div className="auth_field">
        <label htmlFor="drawer-reset-email">Email Address</label>
        <div className="auth_input_wrap">
          <Mail size={16} className="input_icon" aria-hidden="true" />
          <input
            id="drawer-reset-email"
            name="email"
            type="email"
            defaultValue={pendingEmail}
            placeholder="your.email@example.com"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="auth_field">
        <label htmlFor="drawer-reset-otp">Reset Code</label>
        <div className="auth_input_wrap">
          <Lock size={16} className="input_icon" aria-hidden="true" />
          <input
            id="drawer-reset-otp"
            name="otp"
            type="text"
            placeholder="Enter code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
        </div>
      </div>

      <div className="auth_field">
        <label htmlFor="drawer-new-password">New Password</label>
        <div className="auth_input_wrap">
          <Lock size={16} className="input_icon" aria-hidden="true" />
          <input
            id="drawer-new-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="toggle_password_btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="auth_field">
        <label htmlFor="drawer-confirm-password">Confirm Password</label>
        <div className="auth_input_wrap">
          <Lock size={16} className="input_icon" aria-hidden="true" />
          <input
            id="drawer-confirm-password"
            name="confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="auth_primary_btn"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Updating Password..." : "Update Password"}
      </button>

      <div className="auth_switch_footer">
        <button
          type="button"
          className="switch_tab_btn"
          onClick={() => setAuthDrawerTab("login")}
        >
          ← Back to Sign In
        </button>
      </div>
    </form>
  );
}
