"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi, AuthApiError } from "./api";
import { useAuthStore } from "./store";

type GoogleCredentialResponse = {
  credential: string;
};

type GoogleIdentity = {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: "popup" | "redirect";
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: "outline";
      size: "large";
      text: "continue_with";
      shape: "rectangular";
      width: number;
    },
  ): void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

function googleErrorMessage(error: unknown) {
  return error instanceof AuthApiError
    ? error.message
    : "Unable to complete Google sign-in.";
}

export function GoogleSignIn() {
  const router = useRouter();
  const button = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [buttonRendered, setButtonRendered] = useState(false);
  const googleLogin = useAuthStore((state) => state.logout ? state.googleLogin : state.googleLogin);
  const closeAuthDrawer = useAuthStore((state) => state.closeAuthDrawer);
  
  const config = useQuery({
    queryKey: ["auth", "google-config"],
    queryFn: authApi.googleConfig,
    staleTime: Infinity,
    retry: false,
  });

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    config.data?.clientId ||
    "641218864226-1erj1m1802o0n0l04iu5aecianc182h5.apps.googleusercontent.com";

  const handleCredential = useCallback(
    async ({ credential }: GoogleCredentialResponse) => {
      try {
        await googleLogin(credential);
        toast.success("Signed in with Google");
        closeAuthDrawer();
        const user = useAuthStore.getState().user;
        router.push(
          user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
            ? "/admin"
            : "/",
        );
      } catch (error) {
        toast.error(googleErrorMessage(error));
      }
    },
    [closeAuthDrawer, googleLogin, router],
  );

  useEffect(() => {
    // Check if script is already present on window
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    const googleIdentity = window.google?.accounts?.id;

    if (!clientId || !googleIdentity || !button.current) {
      return;
    }

    try {
      googleIdentity.initialize({
        client_id: clientId,
        callback: handleCredential,
        ux_mode: "popup",
      });
      button.current.replaceChildren();
      googleIdentity.renderButton(button.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        locale: "en",
        width: Math.min(360, button.current.clientWidth || 360),
      });
      setButtonRendered(true);
    } catch (e) {
      console.error("Failed to render Google button", e);
    }
  }, [clientId, handleCredential, scriptLoaded]);

  return (
    <div className="mt-4">
      <Script
        src="https://accounts.google.com/gsi/client?hl=en"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => toast.error("Unable to load Google sign-in.")}
      />
      <div className="mb-4 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          or
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="relative min-h-[44px] w-full flex justify-center items-center">
        {!buttonRendered && (
          <div className="absolute inset-0 flex items-center justify-center rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm animate-pulse">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Loading Google Sign-In...
          </div>
        )}
        <div
          ref={button}
          className={`flex min-h-[44px] w-full justify-center ${buttonRendered ? "opacity-100" : "opacity-0"}`}
          aria-label="Continue with Google"
        />
      </div>
    </div>
  );
}
