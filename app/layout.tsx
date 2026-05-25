import React from "react";
import "./global.css";
import { DarkModeContextProvider } from "@/context/darkModeContext.jsx";

export const metadata = {
  title: "StorX – Secure Data Storage",
  description:
    "Premium secure data storage platform with end‑to‑end encryption and seamless sign‑up experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-(--bg) text-(--text-primary) transition-colors duration-300">
        <DarkModeContextProvider>{children}</DarkModeContextProvider>
      </body>
    </html>
  );
}
