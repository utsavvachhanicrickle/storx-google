"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function AboutUsPage() {
  const router = useRouter();

  return (
    <main>
      {/* ============================ HERO ============================ */}
      <section id="top" className="cy-hero">
        <div className="cy-hero__bg cy-grid-bg" />
        <div className="cy-hero__vignette" />
        <div className="cy-hero__fade" />
        <div className="cy-about-hero-shield">
          <svg width="520" height="614" viewBox="0 0 100 118" fill="none" aria-hidden="true">
            <path d="M50 4 L92 20 V58 C92 88 73 106 50 114 C27 106 8 88 8 58 V20 Z" stroke="#5C9CFF" strokeWidth="5"
              fill="rgba(92,156,255,0.06)" strokeLinejoin="round" />
            <path d="M50 12 L85 25 V58 C85 83 69 98 50 105 C31 98 15 83 15 58 V25 Z" stroke="rgba(92,156,255,0.35)"
              strokeWidth="1.5" fill="none" strokeLinejoin="round" />
            <path d="M34 58 L46 70 L68 44" stroke="#5C9CFF" strokeWidth="8" strokeLinecap="round"
              strokeLinejoin="round" fill="none" />
          </svg>
        </div>

        <div className="cy-container cy-hero__content">
          <h1 className="cy-heading cy-heading--hero" style={{ maxWidth: "48rem" }}>
            Backup, Built by People Who Have Run Infrastructure <span className="cy-t-signal">Since 1998</span>
          </h1>
          <p className="cy-hero__lead" style={{ maxWidth: "48rem" }}>
            CyberLS is a division of Indsoft Systems — a managed cloud and IT services provider that has been keeping Indian and global businesses online for over 25 years. We built CyberLS because we kept seeing the same gap in every Google Workspace environment we managed: no real backup, no Indian jurisdiction, no plan for the day something goes wrong.
          </p>
        </div>
      </section>

      {/* ============================ OUR STORY ============================ */}
      <section className="cy-section cy-section--band">
        <div className="cy-container">
          <div><span className="cy-eyebrow">WHERE WE COME FROM</span></div>
          <h2 className="cy-heading cy-heading--section" style={{ maxWidth: "56rem", marginTop: 8 }}>
            A Hosting Company That Got Tired of Watching Businesses <span className="cy-t-cool">Lose Data They Thought Was Safe</span>
          </h2>
          <div className="cy-about-section" style={{ marginTop: 40 }}>
            <div className="cy-about-split">
              <div className="cy-about-split__content">
                <div className="cy-about-icon-accent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
                </div>
                <p className="cy-about-text">Indsoft Systems was founded in 1998, long before "cloud" was a word most businesses used. Over more than two decades, Indsoft has managed servers, hosting infrastructure, and IT operations for businesses that needed their technology to simply work — reliably, securely, without drama — so they could focus on running their company instead of worrying about their infrastructure.</p>
                <p className="cy-about-text">Along the way, Indsoft's teams supported countless businesses migrating to Google Workspace — moving email, files, and collaboration into the cloud for the productivity and flexibility it offered. But a pattern kept repeating: businesses assumed that because their data lived in Google's cloud, Google was responsible for backing it up. It isn't. Google secures its own infrastructure; it does not promise to recover what a business accidentally deletes, what a departing employee wipes on their way out, or what a ransomware attack encrypts.</p>
                <p className="cy-about-text">CyberLS was built to close that gap — as a dedicated, independent backup layer for Google Workspace, designed specifically for the realities Indian businesses face: emerging data protection law, a fast-moving cyber threat landscape, and a real question about where their data actually sits under the law.</p>
              </div>
              <div className="cy-about-split__graphic">
                <div className="cy-about-split__graphic-glow" style={{ width: "350px", height: "350px", background: "radial-gradient(circle, rgba(92,156,255,0.22) 0%, transparent 70%)", filter: "blur(50px)" }}></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: "300px", height: "300px", color: "var(--cy-cool)" }}>
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ CYBERLS TODAY ============================ */}
      <section className="cy-section">
        <div className="cy-container">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><span className="cy-eyebrow cy-eyebrow--center">CYBERLS TODAY</span></div>
          <h2 className="cy-heading cy-heading--section" style={{ textAlign: "center", marginInline: "auto", maxWidth: "48rem", marginTop: 8 }}>
            A Focused Product, Backed by an <span className="cy-t-cool">Established Company</span>
          </h2>
          <div className="cy-about-section" style={{ marginInline: "auto", maxWidth: "48rem", marginTop: 40 }}>
            <div className="cy-about-banner">
              <div className="cy-about-banner__glow"></div>
              <div className="cy-about-icon-accent" style={{ marginInline: "auto" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <p className="cy-about-text" style={{ fontSize: "16.5px" }}>
                CyberLS is a division of Indsoft Systems. We are not a venture-funded startup racing to find a business model, and we are not a side feature bolted onto someone else's platform. CyberLS exists because Indsoft has spent 25+ years in the business of keeping other people's infrastructure running — and backup is, at its core, an extension of that same responsibility: make sure that when something goes wrong, our customers don't have to find out the hard way that nobody had their back.
              </p>
              <p className="cy-about-highlight">That heritage shapes how we operate:</p>
            </div>
          </div>

          <div className="cy-arch-grid" style={{ marginTop: 32 }}>
            <div className="cy-arch-card-wrap">
              <div className="cy-arch-card cy-glass">
                <div className="cy-arch-card__top">
                  <span className="cy-arch-card__num">01</span>
                  <span className="cy-arch-card__icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                  </span>
                </div>
                <h3 className="cy-arch-card__title">We think in terms of reliability, not just features.</h3>
                <p className="cy-arch-card__desc">Decades of managing hosting and server infrastructure means we approach backup the way infrastructure people do — with redundancy, monitoring, and a bias toward boring, dependable engineering over flashy promises.</p>
              </div>
            </div>
            <div className="cy-arch-card-wrap">
              <div className="cy-arch-card cy-glass">
                <div className="cy-arch-card__top">
                  <span className="cy-arch-card__num">02</span>
                  <span className="cy-arch-card__icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </span>
                </div>
                <h3 className="cy-arch-card__title">We understand Indian business technology needs first-hand.</h3>
                <p className="cy-arch-card__desc">Indsoft has spent its history supporting Indian businesses navigating cloud infrastructure, and CyberLS is built specifically around what Indian companies need from a compliance, pricing, and jurisdiction standpoint — not a global product with India bolted on as an afterthought.</p>
              </div>
            </div>
            <div className="cy-arch-card-wrap">
              <div className="cy-arch-card cy-glass">
                <div className="cy-arch-card__top">
                  <span className="cy-arch-card__num">03</span>
                  <span className="cy-arch-card__icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </span>
                </div>
                <h3 className="cy-arch-card__title">We are accountable, not anonymous.</h3>
                <p className="cy-arch-card__desc">As a division of an established company with a track record, CyberLS is not a faceless SaaS tool — there is a real company, with a real history, standing behind it.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ REASON FOR EXISTING ============================ */}
      <section className="cy-section cy-section--band">
        <div className="cy-container">
          <div><span className="cy-eyebrow">OUR REASON FOR EXISTING</span></div>
          <h2 className="cy-heading cy-heading--section" style={{ maxWidth: "56rem", marginTop: 8 }}>
            Because "It's in the Cloud" Is Not the Same as <span className="cy-t-cool">"It's Backed Up"</span>
          </h2>
          <div className="cy-about-section" style={{ marginTop: 40 }}>
            <div className="cy-about-split cy-about-split--reverse">
              <div className="cy-about-split__content">
                <div className="cy-about-icon-accent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <p className="cy-about-text">Every business we've ever supported eventually asks some version of the same question: if something happened to our data right now — an accidental deletion, a malicious insider, a ransomware attack — how would we get it back?</p>
                <p className="cy-about-text">For Google Workspace specifically, the honest answer for most businesses is: not easily, and not completely. Google's native recovery windows are limited. Google Vault is an archiving and eDiscovery tool, not a backup or restore system. And for Indian businesses, there's a second question layered on top of the first: even if the data could be recovered, whose laws govern it, and where does it actually sit?</p>
                <p className="cy-about-text cy-about-text--bordered">CyberLS exists to give a better answer to both questions — an independent, automated backup of your Google Workspace data, encrypted, stored on Indian infrastructure, with a Data Processing Agreement that reflects Indian law, not a foreign jurisdiction's idea of what your data needs.</p>
              </div>
              <div className="cy-about-split__graphic">
                <div className="cy-about-split__graphic-glow" style={{ width: "350px", height: "350px", background: "radial-gradient(circle, rgba(92,156,255,0.22) 0%, transparent 70%)", filter: "blur(50px)" }}></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: "300px", height: "300px", color: "var(--cy-cool)" }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ OUR PRINCIPLES ============================ */}
      <section className="cy-section">
        <div className="cy-container">
          <div><span className="cy-eyebrow">OUR PRINCIPLES</span></div>
          <h2 className="cy-heading cy-heading--section" style={{ maxWidth: "56rem", marginTop: 8 }}>
            A Few Things We <span className="cy-t-cool">Won't Compromise On</span>
          </h2>

          <div className="cy-coverage-grid" style={{ marginTop: 40 }}>
            <div className="cy-coverage-card cy-glass" style={{ padding: 32 }}>
              <h3 style={{ fontFamily: "var(--cy-font-display)", fontSize: 20, fontWeight: 800, color: "var(--cy-cool)", marginBottom: 12, lineHeight: 1.4 }}>Your data should never depend on someone else's goodwill.</h3>
              <p style={{ fontSize: 15, lineHeight: 1.625, color: "var(--cy-slate)", margin: 0 }}>Google has no contractual obligation to recover what you've lost. We think that's the entire reason an independent backup needs to exist, and we built CyberLS around that responsibility — not around hoping you never need it.</p>
            </div>
            <div className="cy-coverage-card cy-glass" style={{ padding: 32 }}>
              <h3 style={{ fontFamily: "var(--cy-font-display)", fontSize: 20, fontWeight: 800, color: "var(--cy-cool)", marginBottom: 12, lineHeight: 1.4 }}>Indian businesses deserve Indian infrastructure.</h3>
              <p style={{ fontSize: 15, lineHeight: 1.625, color: "var(--cy-slate)", margin: 0 }}>Storing data in an "India region" of a foreign-owned cloud is not the same as storing it under Indian jurisdiction. CyberLS is built and operated with this distinction front and center, not as fine print.</p>
            </div>
            <div className="cy-coverage-card cy-glass" style={{ padding: 32 }}>
              <h3 style={{ fontFamily: "var(--cy-font-display)", fontSize: 20, fontWeight: 800, color: "var(--cy-cool)", marginBottom: 12, lineHeight: 1.4 }}>Compliance should make your life easier, not harder.</h3>
              <p style={{ fontSize: 15, lineHeight: 1.625, color: "var(--cy-slate)", margin: 0 }}>DPDPA, CERT-In, and India's evolving data protection landscape can feel overwhelming for a growing business. We try to build CyberLS so that using it is itself a step toward compliance — not one more thing to figure out on top of it.</p>
            </div>
            <div className="cy-coverage-card cy-glass" style={{ padding: 32 }}>
              <h3 style={{ fontFamily: "var(--cy-font-display)", fontSize: 20, fontWeight: 800, color: "var(--cy-cool)", marginBottom: 12, lineHeight: 1.4 }}>Support should sound like a person who understands infrastructure, not a script.</h3>
              <p style={{ fontSize: 15, lineHeight: 1.625, color: "var(--cy-slate)", margin: 0 }}>That's a standard Indsoft has held for over two decades of hosting support, and it's the standard we hold CyberLS to as well.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ WHERE WE'RE GOING ============================ */}
      <section className="cy-section cy-section--band">
        <div className="cy-container">
          <div><span className="cy-eyebrow">WHERE WE'RE GOING</span></div>
          <h2 className="cy-heading cy-heading--section" style={{ maxWidth: "56rem", marginTop: 8 }}>
            Built to Grow With Indian Businesses, Not Just <span className="cy-t-cool">Sell to Them Once</span>
          </h2>
          <div className="cy-about-section" style={{ marginInline: "auto", maxWidth: "48rem", marginTop: 40 }}>
            <div className="cy-about-banner">
              <div className="cy-about-banner__glow" style={{ background: "radial-gradient(circle at bottom, rgba(92,156,255,0.12) 0%, transparent 70%)" }}></div>
              <div className="cy-about-icon-accent" style={{ marginInline: "auto" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <p className="cy-about-text" style={{ fontSize: 18 }}>CyberLS is still early in its journey relative to Indsoft's 25+ years — and we think that's worth saying honestly rather than overstating it. What we bring from day one is real infrastructure experience, a genuine understanding of the Indian regulatory environment, and a product built specifically for the problem it solves, rather than retrofitted from somewhere else.</p>

              <div className="cy-about-callout" style={{ textAlign: "center", boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.7)" }}>
                <div className="cy-about-callout__bg"></div>
                <p className="cy-about-callout__text" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>As CyberLS grows, our commitment stays simple: keep Indian businesses' Google Workspace data safe, recoverable, and under Indian jurisdiction — and keep earning the trust that comes from actually being there when it matters.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section id="finalcta" className="cy-final-cta">
        <div className="cy-final-cta__bg" />
        <div className="cy-final-cta__grid cy-grid-bg" />
        <div className="cy-final-cta__shield">
          <svg width="360" height="425" viewBox="0 0 100 118" fill="none" aria-hidden="true">
            <path d="M50 4 L92 20 V58 C92 88 73 106 50 114 C27 106 8 88 8 58 V20 Z" stroke="#5C9CFF" strokeWidth="5"
              fill="rgba(92,156,255,0.06)" strokeLinejoin="round" />
            <path d="M50 12 L85 25 V58 C85 83 69 98 50 105 C31 98 15 83 15 58 V25 Z" stroke="rgba(92,156,255,0.35)"
              strokeWidth="1.5" fill="none" stroke-linejoin="round" />
            <path d="M34 58 L46 70 L68 44" stroke="#5C9CFF" strokeWidth="8" strokeLinecap="round"
              strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <div className="cy-container cy-container--narrow cy-final-cta__content">
          <h2 className="cy-heading cy-heading--cta">See for Yourself</h2>
          <p className="cy-final-cta__lead" style={{ marginTop: 16 }}>The best way to understand what CyberLS does is to try it. Start a free 14-day trial, or request a free Workspace Risk Assessment to see exactly where your current setup stands.</p>
          <div className="cy-final-cta__actions" style={{ marginTop: 40 }}>
            <button className="cy-btn cy-btn-primary cy-pulse cy-btn--lg cy-btn--responsive" onClick={() => router.push("/connect")}>
              Start Free Trial
            </button>
            <button className="cy-btn cy-btn-ghost cy-btn--lg cy-btn--responsive" onClick={() => router.push("/?openAssessment=true")}>
              Request a Workspace Risk Assessment
            </button>
          </div>
          <div className="cy-final-cta__rule cy-tricolor" />
        </div>
      </section>
    </main>
  );
}
