import type { Metadata } from "next";
import "./globals.css";
import "./coron.css";
import "./coron-auth.css";
import "./storefront-interactions.css";
import { CartProvider } from "@/features/storefront/cart";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "Coron Fashion", template: "%s | Coron" },
  description: "Coron fashion ecommerce store.",
  icons: { icon: "/coron/assets/img/favicon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="no-js">
      <head>
        {/* The legacy Coron cascade must remain in this exact order. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/coron/assets/css/bootstrap.min.css" />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/coron/assets/css/bundle.css" />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/coron/assets/css/plugin.css" />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/coron/assets/css/style.css" />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/coron/assets/css/responsive.css" />
      </head>
      <body><CartProvider>{children}<Toaster position="top-right" richColors closeButton /></CartProvider></body>
    </html>
  );
}
