"use client";

import { useEffect } from "react";
import { User, X } from "lucide-react";
import {
  ForgotPasswordForm,
  LoginForm,
  RegisterForm,
  ResetPasswordForm,
  VerifyEmailForm,
} from "./AuthForms";
import { useAuthStore } from "./store";

export function AuthDrawer() {
  const authDrawerOpen = useAuthStore((state) => state.authDrawerOpen);
  const authDrawerTab = useAuthStore((state) => state.authDrawerTab);
  const closeAuthDrawer = useAuthStore((state) => state.closeAuthDrawer);
  const setAuthDrawerTab = useAuthStore((state) => state.setAuthDrawerTab);

  useEffect(() => {
    if (!authDrawerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAuthDrawer();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("auth-drawer-open");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("auth-drawer-open");
    };
  }, [authDrawerOpen, closeAuthDrawer]);

  return (
    <>
      <div
        className={`auth-drawer-backdrop ${authDrawerOpen ? "is-open" : ""}`}
        onClick={closeAuthDrawer}
        aria-hidden="true"
      />
      <aside
        id="auth-drawer"
        className={`auth-drawer-panel ${authDrawerOpen ? "is-open" : ""}`}
        aria-label="Account Authentication Drawer"
        aria-hidden={!authDrawerOpen}
      >
        <div className="auth-drawer-accent-bar" aria-hidden="true" />
        <div className="auth-drawer-header">
          <div className="auth-drawer-title-group">
            <h3>
              <User size={18} aria-hidden="true" />
              {authDrawerTab === "login" && "Sign In"}
              {authDrawerTab === "register" && "Create Account"}
              {authDrawerTab === "verify-email" && "Verify Email"}
              {authDrawerTab === "forgot-password" && "Forgot Password"}
              {authDrawerTab === "reset-password" && "Reset Password"}
            </h3>
            {/* <p className="auth-drawer-subtitle">I-RAS STYLES Customer Portal</p> */}
          </div>
          <button
            type="button"
            className="auth-drawer-close"
            aria-label="Close authentication drawer"
            onClick={closeAuthDrawer}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {(authDrawerTab === "login" || authDrawerTab === "register") && (
          <div className="auth-drawer-tabs">
            <button
              type="button"
              className={authDrawerTab === "login" ? "active" : ""}
              onClick={() => setAuthDrawerTab("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={authDrawerTab === "register" ? "active" : ""}
              onClick={() => setAuthDrawerTab("register")}
            >
              Register
            </button>
          </div>
        )}

        <div className="auth-drawer-body">
          {authDrawerTab === "login" && <LoginForm />}
          {authDrawerTab === "register" && <RegisterForm />}
          {authDrawerTab === "verify-email" && <VerifyEmailForm />}
          {authDrawerTab === "forgot-password" && <ForgotPasswordForm />}
          {authDrawerTab === "reset-password" && <ResetPasswordForm />}
        </div>
      </aside>
    </>
  );
}
