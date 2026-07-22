import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export const metadata = {
  title: "CyberLs – Secure Data Storage - Dashboard",
  description:
    "Premium secure data storage platform with end‑to‑end encryption and seamless sign‑up experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
