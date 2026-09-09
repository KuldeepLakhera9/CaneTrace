import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaneTrace — Smart Sugarcane Farmer Data Platform",
  description:
    "Enterprise platform for authorized personnel to record, validate, trace, and analyze sugarcane farmer and cultivation data.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
