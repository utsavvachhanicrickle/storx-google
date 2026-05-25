import React from "react";
import SideBarDashbord from "@/components/ui/SideBarDashbord";

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
        <SideBarDashbord>{children}</SideBarDashbord>
      </body>
    </html>
  );
}
