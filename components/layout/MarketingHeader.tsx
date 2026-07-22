"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";

export default function MarketingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavLink = (e: React.MouseEvent, targetId: string) => {
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    }
  };

  return (
    <header className={`cy-site-header ${scrolled ? "cy-scrolled" : ""}`} id="siteHeader">
      <div className="cy-container cy-nav-bar">
        <a
          href="/#top"
          className="cy-brand"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
            } else {
              router.push("/");
            }
          }}
        >
          <Logo className="cy-brand__logo" />
        </a>

        <nav className="cy-nav-links">
          <a href="/#pricing" className="cy-nav-link" onClick={(e) => handleNavLink(e, "pricing")}>Pricing</a>
          <a href="/#compare" className="cy-nav-link" onClick={(e) => handleNavLink(e, "compare")}>Compare</a>
          <a href="/#faq" className="cy-nav-link" onClick={(e) => handleNavLink(e, "faq")}>FAQ</a>
        </nav>

        <div className="cy-nav-cta">
          <button className="cy-btn cy-btn-primary cy-btn--sm" onClick={() => router.push("/connect")}>
            Start Free Trial
          </button>
          <button className="cy-btn cy-btn-ghost cy-btn--sm"
            onClick={() => mounted && router.push(user ? "/dashboard" : "/connect")}>
            {mounted ? (user ? "Dashboard" : "Log In") : "Log In"}
          </button>
        </div>

        <button className="cy-nav-toggle" onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu" aria-expanded={mobileOpen}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {mobileOpen
              ? <path d="M18 6L6 18M6 6l12 12" />
              : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <div className="cy-trust-strip">
        <div className="cy-container cy-trust-strip__inner">
          <span>Made in India 🇮🇳</span>
          <span className="cy-trust-strip__sep">|</span>
          <span>DPDPA 2023 Compliant</span>
          <span className="cy-trust-strip__sep">|</span>
          <span>Indian Data Residency</span>
        </div>
      </div>

      <div className={`cy-mobile-menu ${mobileOpen ? "cy-open" : ""}`} id="mobileMenu">
        <div className="cy-mobile-menu__inner">
          <a href="/#pricing" className="cy-mobile-link" onClick={(e) => handleNavLink(e, "pricing")}>Pricing</a>
          <a href="/#compare" className="cy-mobile-link" onClick={(e) => handleNavLink(e, "compare")}>Compare</a>
          <a href="/#faq" className="cy-mobile-link" onClick={(e) => handleNavLink(e, "faq")}>FAQ</a>
          <div className="cy-mobile-cta">
            <button className="cy-btn cy-btn-primary cy-btn--block"
              onClick={() => { router.push("/connect"); setMobileOpen(false); }}>
              Start Free Trial
            </button>
            <button className="cy-btn cy-btn-ghost cy-btn--block"
              onClick={() => { router.push(user ? "/dashboard" : "/connect"); setMobileOpen(false); }}>
              {mounted ? (user ? "Dashboard" : "Log In") : "Log In"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
