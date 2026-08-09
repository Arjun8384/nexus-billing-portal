import type { Metadata } from "next";

import { AuthProvider } from "@/providers/AuthProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Billing Portal",
  description:
    "Secure B2B billing and invoice management portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}