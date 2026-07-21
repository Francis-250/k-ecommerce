import type { Metadata } from "next";
import "./globals.css";
import "@/styles/storefront.css";
import "@/styles/auth.css";
import "@/styles/interactions.css";
import { CartProvider } from "@/features/storefront/cart";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "I-RAS STYLES", template: "%s | I-RAS STYLES" },
  description: "I-RAS STYLES fashion ecommerce store.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
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
      <body>
        <CartProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </CartProvider>
      </body>
    </html>
  );
}
