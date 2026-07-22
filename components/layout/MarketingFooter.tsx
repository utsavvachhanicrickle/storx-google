"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";

export default function MarketingFooter() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavLink = (e: React.MouseEvent, targetId: string) => {
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="cy-site-footer">
      <div className="cy-container" style={{ paddingBlock: 64 }}>
        <div className="cy-footer-grid">
          <div className="cy-footer-brand">
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
            <p className="cy-footer-desc">
              India's own automatic Google Workspace backup. Encrypted, Fragmented, Distributed and stored securely.
            </p>
            <div className="cy-footer-badges">
              <span className="cy-pill">Made in India 🇮🇳</span>
              <span className="cy-pill">DPDPA 2023</span>
              <span className="cy-pill">AES-256</span>
            </div>
          </div>

          <div className="cy-footer-cols">
            <div className="cy-footer-col">
              <h4 className="cy-footer-col__title">Product</h4>
              <ul>
                <li><a href="/#workspace-features" className="cy-footer-link" onClick={(e) => handleNavLink(e, "workspace-features")}>Features</a></li>
                <li><a href="/#pricing" className="cy-footer-link" onClick={(e) => handleNavLink(e, "pricing")}>Pricing</a></li>
                <li><a href="/#how" className="cy-footer-link" onClick={(e) => handleNavLink(e, "how")}>How It Works</a></li>
              </ul>
            </div>
            <div className="cy-footer-col">
              <h4 className="cy-footer-col__title">Company</h4>
              <ul>
                <li><a href="/about-us" className="cy-footer-link">About CyberLS</a></li>
                {/* <li><a href="#" className="cy-footer-link">Partner Program</a></li> */}
              </ul>
            </div>
          </div>
        </div>

        <div className="cy-footer-divider cy-tricolor" />
        <div className="cy-footer-bottom">
          <p className="cy-footer-copy">© 2026 CyberLS. Made in India 🇮🇳</p>
          <div className="cy-footer-legal">
            <a href="/privacy-policy" className="cy-footer-link">Privacy Policy</a>
            <a href="/terms-and-conditions" className="cy-footer-link">Terms of Service</a>
            {/* <span className="cy-footer-gst">GST: [GSTIN]</span> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
