export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string | null;
  avatar: string | null;
  role: "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN";
  isVerified: boolean;
  isActive: boolean;
};

type ApiEnvelope<T = undefined> = {
  success: boolean;
  message?: string;
  user?: T;
  clientId?: string;
};

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

async function authRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${API_URL}/auth${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok) {
    throw new AuthApiError(
      body.message ?? "Authentication request failed",
      response.status,
    );
  }

  return body;
}

export const authApi = {
  register(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    return authRequest<AuthUser>("/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  login(input: { email: string; password: string }) {
    return authRequest("/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  googleConfig() {
    return authRequest("/google/config");
  },

  googleLogin(credential: string) {
    return authRequest("/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
  },

  verifyEmail(input: { email: string; otp: string }) {
    return authRequest("/verify-email", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  forgotPassword(email: string) {
    return authRequest("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(input: { email: string; otp: string; password: string }) {
    return authRequest("/reset-password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  session() {
    return authRequest<AuthUser>("/me");
  },

  logout() {
    return authRequest("/logout", { method: "POST" });
  },
};
