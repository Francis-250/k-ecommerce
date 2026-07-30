"use client";

import { create } from "zustand";
import { authApi, AuthApiError, setAuthToken, type AuthUser } from "./api";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  pendingVerificationEmail: string;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    otp: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  setPendingVerificationEmail: (email: string) => void;
};

const PENDING_EMAIL_KEY = "auth.pendingVerificationEmail";

function savePendingEmail(email: string) {
  if (typeof window === "undefined") return;

  if (email) {
    window.sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  } else {
    window.sessionStorage.removeItem(PENDING_EMAIL_KEY);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "idle",
  pendingVerificationEmail: "",

  initialize: async () => {
    if (get().status !== "idle") return;

    const pendingVerificationEmail =
      typeof window === "undefined"
        ? ""
        : (window.sessionStorage.getItem(PENDING_EMAIL_KEY) ?? "");

    set({ status: "loading", pendingVerificationEmail });

    try {
      const response = await authApi.session();
      set({
        user: response.user ?? null,
        status: response.user ? "authenticated" : "unauthenticated",
      });
    } catch (error) {
      if (!(error instanceof AuthApiError) || error.status !== 401) {
        console.error("Unable to restore authentication session", error);
      }
      set({ user: null, status: "unauthenticated" });
    }
  },

  login: async (email, password) => {
    set({ status: "loading" });

    try {
      const loginRes = await authApi.login({ email, password });
      if (loginRes.token) {
        setAuthToken(loginRes.token);
      }

      let user = loginRes.user ?? null;
      if (!user) {
        try {
          const response = await authApi.session();
          user = response.user ?? null;
        } catch {
          // ignore session fetch error if login returned success
        }
      }

      savePendingEmail("");
      set({
        user,
        status: user ? "authenticated" : "unauthenticated",
        pendingVerificationEmail: "",
      });
    } catch (error) {
      setAuthToken(null);
      set({ user: null, status: "unauthenticated" });
      throw error;
    }
  },

  googleLogin: async (credential) => {
    set({ status: "loading" });

    try {
      const loginRes = await authApi.googleLogin(credential);
      if (loginRes.token) {
        setAuthToken(loginRes.token);
      }

      let user = loginRes.user ?? null;
      if (!user) {
        try {
          const response = await authApi.session();
          user = response.user ?? null;
        } catch {
          // ignore session fetch error if login returned success
        }
      }

      savePendingEmail("");
      set({
        user,
        status: user ? "authenticated" : "unauthenticated",
        pendingVerificationEmail: "",
      });
    } catch (error) {
      setAuthToken(null);
      set({ user: null, status: "unauthenticated" });
      throw error;
    }
  },

  register: async (input) => {
    set({ status: "loading" });

    try {
      await authApi.register(input);
      savePendingEmail(input.email);
      set({
        user: null,
        status: "unauthenticated",
        pendingVerificationEmail: input.email,
      });
    } catch (error) {
      set({ status: "unauthenticated" });
      throw error;
    }
  },

  verifyEmail: async (email, otp) => {
    set({ status: "loading" });

    try {
      await authApi.verifyEmail({ email, otp });
      savePendingEmail("");
      set({
        status: "unauthenticated",
        pendingVerificationEmail: "",
      });
    } catch (error) {
      set({ status: "unauthenticated" });
      throw error;
    }
  },

  requestPasswordReset: async (email) => {
    set({ status: "loading" });

    try {
      await authApi.forgotPassword(email);
      savePendingEmail(email);
      set({
        status: "unauthenticated",
        pendingVerificationEmail: email,
      });
    } catch (error) {
      set({ status: "unauthenticated" });
      throw error;
    }
  },

  resetPassword: async (email, otp, password) => {
    set({ status: "loading" });

    try {
      await authApi.resetPassword({ email, otp, password });
      savePendingEmail("");
      set({
        user: null,
        status: "unauthenticated",
        pendingVerificationEmail: "",
      });
    } catch (error) {
      set({ status: "unauthenticated" });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      setAuthToken(null);
      set({ user: null, status: "unauthenticated" });
    }
  },

  setPendingVerificationEmail: (email) => {
    savePendingEmail(email);
    set({ pendingVerificationEmail: email });
  },
}));
