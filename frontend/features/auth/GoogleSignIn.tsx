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
  const [scriptReady, setScriptReady] = useState(false);
  const googleLogin = useAuthStore((state) => state.googleLogin);
  const closeAuthDrawer = useAuthStore((state) => state.closeAuthDrawer);
  const config = useQuery({
    queryKey: ["auth", "google-config"],
    queryFn: authApi.googleConfig,
    staleTime: Infinity,
    retry: false,
  });

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
    const clientId = config.data?.clientId;
    const googleIdentity = window.google?.accounts.id;

    if (!scriptReady || !clientId || !googleIdentity || !button.current) {
      return;
    }

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
      width: Math.min(360, button.current.clientWidth || 360),
    });
  }, [config.data?.clientId, handleCredential, scriptReady]);

  return (
    <div className="mt-6">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => toast.error("Unable to load Google sign-in.")}
      />
      <div className="mb-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          or
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      {config.isError ? (
        <p className="text-center text-sm text-red-600">
          Google sign-in is currently unavailable.
        </p>
      ) : (
        <div
          ref={button}
          className="flex min-h-11 w-full justify-center"
          aria-label="Continue with Google"
        />
      )}
    </div>
  );
}
