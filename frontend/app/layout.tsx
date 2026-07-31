import type { Metadata } from "next";
import "./globals.css";
import "@/styles/storefront.css";
import "@/styles/auth.css";
import "@/styles/interactions.css";
import "@/styles/checkout.css";
import { CartProvider } from "@/features/storefront/cart";
import { Toaster } from "sonner";
import { AuthInitializer } from "@/features/auth/AuthInitializer";
import { QueryProvider } from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: { default: "I-RAS STYLES", template: "%s | I-RAS STYLES" },
  description: "I-RAS STYLES fashion ecommerce store.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link
          rel="stylesheet"
          href="/storefront/assets/css/bootstrap.min.css"
        />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/storefront/assets/css/style.css" />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/storefront/assets/css/responsive.css" />
      </head>
      <body suppressHydrationWarning>
        <QueryProvider>
          <CartProvider>
            <AuthInitializer />
            {children}
            <Toaster position="top-right" richColors closeButton />
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
