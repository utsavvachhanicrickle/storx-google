"use client";

import React from "react";
import { usePathname } from "next/navigation";
import MarketingHeader from "./MarketingHeader";
import MarketingFooter from "./MarketingFooter";

export default function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define paths that should NOT have the marketing header/footer
  const isExcluded =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/connect") ||
    pathname.startsWith("/onbording") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/password-recovery");

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <div className="cyber-page">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
