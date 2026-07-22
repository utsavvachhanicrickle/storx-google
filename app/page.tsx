"use client";

import "./cyber.css";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  GmailIcon,
  DriveIcon,
  CalendarIcon,
  ContactsIcon,
  PhotosIcon,
} from "@/components/ui/ServiceIcon";
import Logo from "@/components/ui/Logo";

/* ============================================================
   Generic SVG helpers
   ============================================================ */
const CheckIcon = ({ cls = "", size = 17 }) => (
  <svg
    className={cls}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const CrossIcon = ({ cls = "", size = 17 }) => (
  <svg
    className={cls}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const ArrowIcon = ({ cls = "", size = 18 }) => (
  <svg
    className={cls}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const PlusIcon = ({ cls = "", size = 20 }) => (
  <svg
    className={cls}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const ChevDownIcon = ({ cls = "", size = 20 }) => (
  <svg
    className={cls}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const ShieldCheckIcon = ({ cls = "", size = 17 }) => (
  <svg
    className={cls}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3l7 3v5c0 5-3.2 8.5-7 10-3.8-1.5-7-5-7-10V6l7-3Z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

/* Shared Drive — no matching icon in ServiceIcon.tsx, keep inline */
const SharedDriveSvgIcon = () => (
  <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true">
    <rect x="4" y="14" width="40" height="26" rx="3" fill="#1A73E8" />
    <rect x="4" y="14" width="40" height="8" rx="3" fill="#4285F4" />
    <circle cx="16" cy="30" r="3" fill="#fff" />
    <circle cx="24" cy="30" r="3" fill="#fff" />
    <circle cx="32" cy="30" r="3" fill="#fff" />
    <rect x="14" y="8" width="20" height="8" rx="2" fill="#FBBC05" />
  </svg>
);

const ShieldSvg = ({
  width = 520,
  height = 614,
}: {
  width?: number;
  height?: number;
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 100 118"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M50 4 L92 20 V58 C92 88 73 106 50 114 C27 106 8 88 8 58 V20 Z"
      stroke="#5C9CFF"
      strokeWidth="5"
      fill="rgba(92,156,255,0.06)"
      strokeLinejoin="round"
    />
    <path
      d="M50 12 L85 25 V58 C85 83 69 98 50 105 C31 98 15 83 15 58 V25 Z"
      stroke="rgba(92,156,255,0.35)"
      strokeWidth="1.5"
      fill="none"
      strokeLinejoin="round"
    />
    <path
      d="M34 58 L46 70 L68 44"
      stroke="#5C9CFF"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/* ============================================================
   Static data
   ============================================================ */
const TRUTH_ROWS = [
  {
    scenario: "Deleted file recovery",
    assume: "Google keeps it forever",
    reality: "Gone after 30 days trash + 25 days admin window",
  },
  {
    scenario: "Single file restore",
    assume: "Restore the one file I need",
    reality: "All-or-nothing restore for entire date range",
  },
  {
    scenario: "Employee leaves",
    assume: "Data stays in the system",
    reality: "Permanently deleted after 20 days if license removed",
  },
  {
    scenario: "Email backup",
    assume: "Gmail is backed up automatically",
    reality: "No email backup exists. Zero.",
  },
  {
    scenario: "Ransomware recovery",
    assume: "Google will roll it back",
    reality: "No point-in-time restore available",
  },
  {
    scenario: "Google Vault",
    assume: "It is a backup solution",
    reality: "It is an archival/legal tool. Cannot restore to accounts.",
  },
  {
    scenario: "Version history",
    assume: "Keeps all versions forever",
    reality: "Only keeps 25 days of revisions",
  },
  {
    scenario: "Data location",
    assume: "Stored securely somewhere",
    reality: "Stored on US servers, subject to US CLOUD Act",
  },
];

const COVERAGE_ITEMS = [
  {
    icon: <GmailIcon className="w-7 h-7" />,
    title: "Gmail Backup",
    desc: "Every email, attachment, label, and folder structure preserved daily. Survives accidental deletion, ransomware, and account compromise — restorable to the original mailbox in seconds.",
  },
  {
    icon: <DriveIcon className="w-7 h-7" />,
    title: "Google Drive Backup",
    desc: "All files, folders, and permissions captured with full version history. Recover any file at any past version without overwriting the current copy.",
  },
  {
    icon: <CalendarIcon className="w-7 h-7" />,
    title: "Google Calendar Backup",
    desc: "Events, invitees, recurring schedules, and reminders backed up automatically. Restore a deleted calendar or a single event exactly as it was.",
  },
  {
    icon: <ContactsIcon className="w-7 h-7" />,
    title: "Google Contacts Backup",
    desc: "Your entire address book — including groups, labels, and custom fields — protected. No more lost client or vendor contacts when an account is removed.",
  },
  {
    icon: <SharedDriveSvgIcon />,
    title: "Shared Drive Backup",
    desc: "Team and Shared Drives backed up with membership and access roles intact. Critical for organisations where shared data lives outside individual accounts.",
  },
  {
    icon: <PhotosIcon className="w-7 h-7" />,
    title: "Google Photos Backup",
    desc: "Photos and albums preserved in full resolution with metadata intact, so memories and visual assets can be restored after accidental loss.",
  },
];

const PRICING_PLANS = [
  {
    name: "Starter",
    monthly: 349,
    annual: 279,
    billing_monthly: "billed monthly",
    billing_annual: "billed annually · save 20%",
    blurb: "For small teams getting protected fast.",
    recommended: false,
    features: [
      "Up to 25 users",
      "Daily backup",
      "1-year retention",
      "Email support",
    ],
    cta: "Start Free Trial",
    ctaVariant: "ghost",
  },
  {
    name: "Business",
    monthly: 549,
    annual: 439,
    billing_monthly: "billed monthly",
    billing_annual: "billed annually · save 20%",
    blurb: "Everything growing businesses need.",
    recommended: true,
    features: [
      "Unlimited users",
      "3× daily backup",
      "Unlimited retention",
      "All Workspace apps",
      "Priority support",
      "DPDPA documentation",
    ],
    cta: "Start Free Trial",
    ctaVariant: "primary",
  },
  {
    name: "Enterprise",
    monthly: null,
    annual: null,
    billing_monthly: "Tailored to your organisation",
    billing_annual: "Tailored to your organisation",
    blurb: "For regulated and large organisations.",
    recommended: false,
    features: [
      "Dedicated account manager",
      "Custom retention",
      "DPIA support",
      "SLA-backed recovery",
      "API + SSO",
    ],
    cta: "Contact Sales",
    ctaVariant: "ghost",
  },
];

const COMPARE_ROWS: [
  string,
  boolean | string,
  boolean | string,
  boolean | string,
][] = [
  ["Company origin", "USA / Europe", "USA (Google)", "India"],
  [
    "Data location",
    "AWS / Azure / GCP (US)",
    "Google US servers",
    "Indian storage nodes",
  ],
  ["Pricing currency", "USD", "Bundled (USD)", "INR (₹)"],
  ["GST invoicing", false, false, true],
  ["Indian timezone support", false, false, true],
  ["DPDPA compliance docs", false, false, true],
  ["Point-in-time recovery", true, false, true],
  ["Granular restore", "Limited", false, true],
  ["Offboarded user data", "Add-on cost", false, true],
  ["Data jurisdiction", "US CLOUD Act", "US CLOUD Act", "Indian law"],
  ["Typical cost", "$3–7/user", "Enterprise tier only", "₹49–439/user"],
];

const TESTIMONIALS = [
  {
    initials: "AM",
    name: "Aarav Mehta",
    role: "CTO, SaaS Startup · Bengaluru",
    text: "A ransomware hit took out three departments overnight. CyberLS rolled the entire workspace back to the morning before — we lost nothing. It paid for a decade of subscription in one afternoon.",
  },
  {
    initials: "PN",
    name: "Priya Nair",
    role: "IT Manager, Mid-Market Firm · Pune",
    text: "We moved off a US provider the moment we understood the CLOUD Act exposure. Same protection, INR billing, a proper GST invoice, and support that picks up in IST.",
  },
  {
    initials: "RI",
    name: "Rohan Iyer",
    role: "Head of Compliance · Mumbai",
    text: "Our DPDPA readiness review was painless. Data residency, encryption, access controls and documentation were already in place. CyberLS made the auditor's checklist trivial.",
  },
];

const FAQS = [
  {
    q: "Does Google not already keep my data safe?",
    a: "Google keeps their platform online — that is their 99.9% uptime SLA. They do not guarantee recovery of your data. Deleted files are gone after the trash + admin window, there is no point-in-time restore for ransomware, and Gmail has no native backup at all. CyberLS provides the independent, recoverable copy Google does not.",
  },
  {
    q: "Where is my backup data stored?",
    a: "Entirely on Indian infrastructure — decentralised storage nodes within India. Your data is encrypted with AES-256, fragmented using erasure coding, and never crosses national borders, keeping it under Indian jurisdiction.",
  },
  {
    q: "Is CyberLS compliant with DPDPA 2023?",
    a: "Yes. CyberLS is built for the Digital Personal Data Protection Act with encryption, access controls, audit logging, and Indian data residency. We provide compliance documentation to support your obligations ahead of the Phase 2 deadline in November 2026.",
  },
  {
    q: "What happens to data when an employee leaves?",
    a: "Their entire Workspace footprint is preserved indefinitely in your backup — even after you remove their Google Workspace license. No more losing client emails or project files 20 days after offboarding.",
  },
  {
    q: "How is pricing structured? Is it in INR?",
    a: "Pricing is per user, per month, billed in Indian Rupees with a proper GST invoice — no per-GB charges and no USD conversion surprises. Plans start at ₹49/user/month, with annual billing saving 20%.",
  },
  {
    q: "How quickly can I recover data?",
    a: "Most restores complete in seconds. Search for any file, email, or version, select the exact point in time, and restore it directly back into the user's account. Average restore time across our base is under two minutes.",
  },
  {
    q: "What if my internet goes down?",
    a: "Backups run automatically from the cloud-to-cloud connection to your Google Workspace, independent of your office network. When you need to recover, you simply sign in from any connection and restore.",
  },
  {
    q: "Is there Indian-timezone support?",
    a: "Yes. Our team operates in IST and provides support during Indian business hours, with priority and SLA-backed options on higher tiers. No overnight waits for a US helpdesk to wake up.",
  },
];

const ASSESSMENT_QUESTIONS = [
  {
    q: "How is your Google Workspace data backed up today?",
    opts: [
      ["No backup at all — we rely on Google", 0],
      ["Occasional manual exports (Takeout / downloads)", 1],
      ["Google Vault for retention", 1],
      ["A dedicated third-party backup runs daily", 3],
    ],
  },
  {
    q: "Could you restore a single file a user deleted 60 days ago?",
    opts: [
      ["No — it would be gone", 0],
      ["I'm honestly not sure", 0],
      ["Maybe, if it is still in Vault", 1],
      ["Yes — any file, any version, in seconds", 3],
    ],
  },
  {
    q: "If ransomware hit tomorrow, could you roll the workspace back to yesterday?",
    opts: [
      ["No point-in-time restore exists", 0],
      ["Not sure how that would work", 0],
      ["Yes — one-click rollback to a clean point", 3],
    ],
  },
  {
    q: "When an employee leaves, what happens to their data?",
    opts: [
      ["It is deleted once we remove the licence", 0],
      ["I don't know", 0],
      ["Preserved independently in our backup", 3],
    ],
  },
  {
    q: "Where does your backup data physically live?",
    opts: [
      ["We have no separate backup", 0],
      ["On US servers (AWS / Azure / GCP)", 1],
      ["Not sure where it is stored", 0],
      ["On Indian infrastructure", 3],
    ],
  },
];
const ASSESSMENT_MAX = ASSESSMENT_QUESTIONS.length * 3;

function bandFor(pct: number) {
  if (pct < 40)
    return {
      label: "HIGH RISK",
      color: "#FF3333",
      note: "Your Google Workspace data is largely unprotected. A deletion, ransomware hit, or departing employee could mean permanent loss.",
    };
  if (pct < 75)
    return {
      label: "MODERATE RISK",
      color: "#E8A13A",
      note: "You have partial coverage, but real gaps remain — granular recovery, ransomware rollback, or data residency are not fully handled.",
    };
  return {
    label: "LOW RISK",
    color: "#3FB97A",
    note: "You are in good shape. CyberLS can still simplify recovery, cut costs, and keep everything on Indian infrastructure.",
  };
}

/* ============================================================
   Counter hook (animates number from 0 → target)
   ============================================================ */
function useCounter(target: number, suffix: string, trigger: boolean) {
  const [display, setDisplay] = useState("0");
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!trigger) return;
    const duration = 1700;
    let start: number | null = null;
    function step(t: number) {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(
        (target * eased).toLocaleString("en-IN", { maximumFractionDigits: 0 }) +
          suffix,
      );
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trigger, target, suffix]);
  return display;
}

/* ============================================================
   Stat card with animated counter
   ============================================================ */
function StatCard({
  to,
  suffix,
  label,
  delay,
}: {
  to: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0 },
    );
    if (ref.current) obs.observe(ref.current);
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => {
      obs.disconnect();
      clearTimeout(timer);
    };
  }, []);
  const value = useCounter(to, suffix, visible);
  return (
    <div
      ref={ref}
      className={`cy-reveal ${visible ? "cy-in cy-settled" : ""} cy-stat-card cy-glass`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="cy-stat-value">{visible ? value : "0"}</div>
      <div className="cy-stat-label">{label}</div>
    </div>
  );
}

/* ============================================================
   Reveal wrapper — scroll-triggered fade/slide in
   ============================================================ */
function Reveal({
  children,
  delay = 0,
  className = "",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0 },
    );
    if (ref.current) obs.observe(ref.current);
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => {
      obs.disconnect();
      clearTimeout(timer);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`cy-reveal ${visible ? "cy-in cy-settled" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   Coverage card — controlled accordion
   ============================================================ */
function CoverageCard({
  icon,
  title,
  desc,
  isOpen,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`cy-coverage-card ${isOpen ? "cy-open" : ""}`}>
      <button
        className="cy-coverage-card__btn"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="cy-icon-tile">{icon}</span>
        <span className="cy-coverage-card__title">{title}</span>
        <span className="cy-coverage-card__chev">
          <ChevDownIcon />
        </span>
      </button>
      <div className={`cy-collapsible ${isOpen ? "cy-open" : ""}`}>
        <div className="cy-inner">
          <p className="cy-coverage-card__desc">{desc}</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Coverage section — exclusive accordion (one open at a time)
   ============================================================ */
function CoverageSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);
  return (
    <div className="cy-coverage-grid" id="coverageGrid">
      {COVERAGE_ITEMS.map((item, i) => (
        <Reveal key={item.title} delay={i * 0.06}>
          <CoverageCard
            icon={item.icon}
            title={item.title}
            desc={item.desc}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex((prev) => (prev === i ? -1 : i))}
          />
        </Reveal>
      ))}
    </div>
  );
}

/* ============================================================
   FAQ item
   ============================================================ */
function FaqItem({
  q,
  a,
  defaultOpen = false,
}: {
  q: string;
  a: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`cy-faq-item ${open ? "cy-open" : ""}`}>
      <button
        className="cy-faq-item__btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="cy-faq-item__q">{q}</span>
        <span className="cy-faq-item__icon">
          <PlusIcon />
        </span>
      </button>
      <div className={`cy-collapsible ${open ? "cy-open" : ""}`}>
        <div className="cy-inner">
          <p className="cy-faq-item__body">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Compare cell helper
   ============================================================ */
function CompareCell({
  value,
  accent = false,
}: {
  value: boolean | string;
  accent?: boolean;
}) {
  if (value === true) return <CheckIcon cls="cy-t-cool" size={18} />;
  if (value === false) return <CrossIcon cls="cy-t-slate" size={18} />;
  return (
    <span
      className={`cy-compare-val ${accent ? "cy-compare-val--accent" : ""}`}
    >
      {value}
    </span>
  );
}

/* ============================================================
   Risk assessment modal
   ============================================================ */
function AssessmentModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const router = useRouter();

  const reset = useCallback(() => {
    setStep(0);
    setAnswers([]);
  }, []);

  useEffect(() => {
    if (!open) return;
    reset();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, reset]);

  if (!open) return null;

  const isResult = step >= ASSESSMENT_QUESTIONS.length;
  const score = answers.reduce((s, p) => s + p, 0);
  const pct = Math.round((score / ASSESSMENT_MAX) * 100);
  const band = bandFor(pct);
  const circ = 2 * Math.PI * 52;
  const offset = isResult ? circ * (1 - pct / 100) : circ;

  return (
    <div
      className="cy-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Google Workspace Risk Assessment"
    >
      <div className="cy-modal__backdrop" onClick={onClose} />
      <div className="cy-modal__dialog">
        <div className="cy-modal__accent cy-tricolor" />
        <div className="cy-modal__header">
          <div className="cy-modal__title-wrap">
            <ShieldCheckIcon cls="cy-t-cool" size={20} />
            <span className="cy-modal__title">Workspace Risk Assessment</span>
          </div>
          <button
            className="cy-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <CrossIcon size={20} />
          </button>
        </div>
        {!isResult && (
          <div className="cy-modal__progress">
            <div
              className="cy-modal__progress-bar"
              style={{
                width: `${(step / ASSESSMENT_QUESTIONS.length) * 100}%`,
              }}
            />
          </div>
        )}
        <div className="cy-modal__body">
          {isResult ? (
            <div className="cy-modal__result">
              <div className="cy-modal__ring">
                <svg viewBox="0 0 120 120">
                  <circle
                    className="cy-modal__ring-track"
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke={band.color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset .7s ease" }}
                  />
                </svg>
                <div className="cy-modal__ring-center">
                  <span className="cy-modal__score">{pct}</span>
                  <span className="cy-modal__score-label">PROTECTED</span>
                </div>
              </div>
              <div
                className="cy-modal__band"
                style={{
                  color: band.color,
                  background: band.color + "1a",
                  border: `1px solid ${band.color}55`,
                }}
              >
                {band.label}
              </div>
              <p className="cy-modal__note">{band.note}</p>
              <div className="cy-modal__result-actions">
                <button
                  className="cy-btn cy-btn-primary cy-btn--block"
                  onClick={() => {
                    onClose();
                    router.push("/connect");
                  }}
                >
                  Protect My Workspace
                </button>
                <button className="cy-modal__retake" onClick={reset}>
                  ↺ Retake assessment
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="cy-modal__qnum">
                QUESTION {step + 1} / {ASSESSMENT_QUESTIONS.length}
              </div>
              <h3 className="cy-modal__question">
                {ASSESSMENT_QUESTIONS[step].q}
              </h3>
              <div className="cy-modal__options">
                {(ASSESSMENT_QUESTIONS[step].opts as [string, number][]).map(
                  ([text, pts], i) => (
                    <button
                      key={i}
                      className="cy-modal__option"
                      onClick={() => {
                        const newAnswers = [...answers.slice(0, step), pts];
                        setAnswers(newAnswers);
                        setTimeout(() => setStep((s) => s + 1), 180);
                      }}
                    >
                      <span>{text}</span>
                      <span className="cy-modal__option-arrow">
                        <ArrowIcon size={18} />
                      </span>
                    </button>
                  ),
                )}
              </div>
              {step > 0 && (
                <button
                  className="cy-modal__back"
                  onClick={() => setStep((s) => s - 1)}
                >
                  ← Back
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
export default function HomePage() {
  const router = useRouter();
  const [billingAnnual, setBillingAnnual] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("openAssessment") === "true") {
        setModalOpen(true);
        // Clear the query parameter so it doesn't reopen on reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const LOGOS = [
    "CyberLs Network",
    "Indian Company",
    "Startup India",
    "NASSCOM",
    "CII",
    "TiE India",
  ];

  return (
    <>
      {/* ========================= HERO ========================= */}
      <section id="top" className="cy-hero">
        <div className="cy-hero__bg cy-grid-bg" />
        <div className="cy-hero__vignette" />
        <div className="cy-hero__fade" />
        <div
          style={{
            position: "absolute",
            right: "-6%",
            top: 40,
            opacity: 0.07,
            pointerEvents: "none",
          }}
        >
          <ShieldSvg width={520} height={614} />
        </div>

        <div className="cy-container cy-hero__content">
          <Reveal>
            <h1
              className="cy-heading cy-heading--hero"
              style={{ maxWidth: "48rem" }}
            >
              Your Critical Google Workspace <br />{" "}
              <span className="cy-t-signal">Has No Real Backup</span>
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="cy-hero__lead">
              Google guarantees their platform stays online. What they don't
              guarantee is your data. CyberLS automatically backs up your Gmail,
              Google Drive, Calendar and Contacts — securely encrypted and
              stored across distributed Indian infrastructure.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="cy-hero__actions">
              <button
                className="cy-btn cy-btn-primary cy-pulse cy-btn--responsive"
                id="openAssessment"
                onClick={() => setModalOpen(true)}
              >
                Take Google Workspace Risk Assessment
                <ArrowIcon size={18} cls="cy-btn__icon" />
              </button>
              <button
                className="cy-btn cy-btn-ghost cy-btn--responsive"
                onClick={() => scrollTo("pricing")}
              >
                Start Free 14-Day Trial
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="cy-hero__note">
              No credit card required. Setup in under 5 minutes. Starts at{" "}
              <span className="cy-t-cool">₹49/user/month</span>.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="cy-hero__trust">
              {[
                "Made in India",
                "DPDPA 2023 Compliant",
                "Indian Data Residency",
                "AES-256 Encrypted",
              ].map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="cy-hero__trust-sep" />}
                  <div className="cy-hero__trust-item">
                    <ShieldCheckIcon cls="cy-t-cool" size={17} />
                    {item}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================= THREAT ========================= */}
      <section id="threat" className="cy-section cy-section--band">
        <div className="cy-container">
          <Reveal>
            <span className="cy-eyebrow">Threat Landscape</span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className="cy-heading cy-heading--threat"
              style={{ maxWidth: "56rem", marginTop: 8 }}
            >
              India Is the{" "}
              <span className="cy-t-cool">2nd Most Cyber-Attacked Country</span>{" "}
              in the World. Is Your Business Data Protected?
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="cy-threat__lead">
              Indian organisations faced 2,011 cyberattacks per week in 2025,
              far above the global average. CERT-In logged over 2.2 million
              incidents between 2021 and 2025. Ransomware attacks surged 31% in
              January 2026 alone.{" "}
              <span className="cy-t-ink">
                SMBs are primary targets because attackers know they lack IT
                sophistications, backup and recovery capabilities.
              </span>
            </p>
          </Reveal>

          <div className="cy-stat-grid">
            <StatCard
              to={2011}
              suffix=""
              label="Cyber attacks per week"
              delay={0}
            />
            <StatCard
              to={10}
              suffix=" Lakh+"
              label="Ransomware attacks encountered"
              delay={0.09}
            />
            <StatCard
              to={25}
              suffix=" Days"
              label="Default Retention in Google"
              delay={0.18}
            />
            <StatCard
              to={61}
              suffix="%"
              label="Agree cyberattacks can endanger Business"
              delay={0.27}
            />
          </div>
        </div>
      </section>

      {/* ========================= TRUTH TABLE ========================= */}
      <section className="cy-section">
        <div className="cy-container">
          <Reveal>
            <span className="cy-eyebrow">Myth-Busting</span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className="cy-heading cy-heading--section"
              style={{ maxWidth: "56rem", marginTop: 8 }}
            >
              "Google Cloud Mein Hai, Toh Safe Hai" — This Is the{" "}
              <span className="cy-t-cool">Most Expensive Assumption</span> Your
              Business Can Make.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="cy-truth__lead">
              Google guarantees that their servers will stay online 99.9% of the
              time. That is their SLA. They do not guarantee that your deleted
              files will be recoverable, your emails will survive a ransomware
              attack, or your departed employee's data will be preserved.
            </p>
          </Reveal>
          <Reveal delay={0.16} style={{ marginTop: 56 }}>
            <div className="cy-truth-table cy-glass">
              <div className="cy-truth-head">
                <div className="cy-truth-col-scenario">Scenario</div>
                <div className="cy-truth-col-assume cy-truth-head__assume">
                  <CheckIcon size={14} /> What You Assume
                </div>
                <div className="cy-truth-col-reality cy-truth-head__reality">
                  <CrossIcon size={14} /> What Actually Happens
                </div>
              </div>
              {TRUTH_ROWS.map((row) => (
                <div key={row.scenario} className="cy-truth-row">
                  <div className="cy-truth-col-scenario">{row.scenario}</div>
                  <div className="cy-truth-col-assume">
                    <CheckIcon cls="cy-t-cool" size={17} />
                    <span>{row.assume}</span>
                  </div>
                  <div className="cy-truth-col-reality">
                    <CrossIcon cls="cy-t-slate" size={17} />
                    <span>{row.reality}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================= ARCHITECTURE ========================= */}
      <section id="architecture" className="cy-section">
        <div className="cy-container">
          <Reveal>
            <span className="cy-eyebrow">How We Protect It</span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className="cy-heading cy-heading--section"
              style={{ maxWidth: "56rem", marginTop: 8 }}
            >
              Architectural Sovereignty:{" "}
              <span className="cy-t-cool">
                Protection Built Into the Mathematics.
              </span>
            </h2>
          </Reveal>
          <div className="cy-arch-grid">
            {[
              {
                num: "01",
                title: "ENCRYPT",
                desc: "Your data is encrypted with 256 AES encryption.",
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="4" y="11" width="16" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "SHARD & REPLICATE",
                desc: "Encrypted data is cryptographically fragmented and replicated.",
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 16.5l9 5 9-5" />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "DISTRIBUTE",
                desc: "Fragmented data is then distributed across multiple Indian nodes.",
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="6" cy="12" r="2.5" />
                    <circle cx="18" cy="6" r="2.5" />
                    <circle cx="18" cy="18" r="2.5" />
                    <path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" />
                  </svg>
                ),
              },
            ].map((card, i) => (
              <Reveal key={card.num} delay={i * 0.11}>
                <div className="cy-arch-card-wrap">
                  {i < 2 && (
                    <span className="cy-arch-connector">
                      <ArrowIcon size={22} />
                    </span>
                  )}
                  <div className="cy-arch-card cy-glass">
                    <div className="cy-arch-card__top">
                      <span className="cy-arch-card__num">{card.num}</span>
                      <span className="cy-arch-card__icon cy-t-cool-soft">
                        {card.icon}
                      </span>
                    </div>
                    <h3 className="cy-arch-card__title">{card.title}</h3>
                    <p className="cy-arch-card__desc">{card.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= SOLUTION / TIMELINE ========================= */}
      <section
        id="how"
        className="cy-section cy-section--band"
        style={{ position: "relative" }}
      >
        <div className="cy-solution__bg cy-grid-bg" />
        <div className="cy-container" style={{ position: "relative" }}>
          <Reveal>
            <span className="cy-eyebrow">The CyberLS Solution</span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className="cy-heading cy-heading--section"
              style={{ maxWidth: "56rem", marginTop: 8 }}
            >
              Automatic Backup. Seamless Recovery.{" "}
              <span className="cy-t-cool">Affordable Price.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="cy-solution__lead">
              CyberLS does one thing and does it well: it creates an
              independent, encrypted copy of your entire Google Workspace —
              Gmail, Drive, Calendar, Contacts, Shared Drives — automatically
              every day. If anything goes wrong, you recover what you need in
              seconds.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="cy-solution__setup" style={{ textAlign: "center" }}>
              <h3 className="cy-solution__setup-title">Easy to Setup</h3>
              <p className="cy-solution__setup-desc">
                Three steps. Under 10 minutes. From signup to holistic security
                of your Google Workspace.
              </p>
            </div>
          </Reveal>

          <div className="cy-timeline">
            <div className="cy-timeline__line" />
            <div className="cy-timeline__list">
              {[
                {
                  num: "01",
                  title: "CONNECT",
                  time: "(60 seconds)",
                  desc: "Link your Google Workspace admin account with secure OAuth2. No passwords stored, no agents to install. One-click authorisation.",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0V8ZM12 16v6" />
                    </svg>
                  ),
                },
                {
                  num: "02",
                  title: "PROTECT",
                  time: "(automatic)",
                  desc: "CyberLS backs up your entire workspace immediately. Data encrypted with AES-256, fragmented using erasure coding, distributed across Indian storage nodes.",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3l7 3v5c0 5-3.2 8.5-7 10-3.8-1.5-7-5-7-10V6l7-3Z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  ),
                },
                {
                  num: "03",
                  title: "RECOVER",
                  time: "(seconds)",
                  desc: "Search, select, restore. Any file. Any version. Any point in time. Directly back into the user's account.",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <Reveal key={item.num} delay={i * 0.11}>
                  <div className="cy-timeline__item">
                    <div className="cy-timeline__node">
                      <span className="cy-timeline__num">{item.num}</span>
                    </div>
                    <div className="cy-timeline__card cy-glass">
                      <div className="cy-timeline__card-head">
                        <span className="cy-t-cool">{item.icon}</span>
                        <h3 className="cy-timeline__card-title cy-timeline__card-title--desktop">
                          {item.title}
                        </h3>
                        <span className="cy-timeline__time">{item.time}</span>
                      </div>
                      <h3 className="cy-timeline__card-title cy-timeline__card-title--mobile">
                        {item.title}
                      </h3>
                      <p className="cy-timeline__card-desc">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================= COVERAGE ========================= */}
      <section id="workspace-features" className="cy-section">
        <div className="cy-container">
          <Reveal>
            <span className="cy-eyebrow">Workspace Coverage</span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className="cy-heading cy-heading--section"
              style={{ maxWidth: "56rem", marginTop: 8 }}
            >
              Every Email. Every File. Every Calendar Entry. Every Contact.{" "}
              <span className="cy-t-cool">Protected.</span>
            </h2>
          </Reveal>
          <CoverageSection />
        </div>
      </section>

      {/* ========================= PRICING ========================= */}
      <section id="pricing" className="cy-section cy-section--band">
        <div className="cy-container">
          <Reveal>
            <div className="cy-pricing__head">
              <span className="cy-eyebrow cy-eyebrow--center">Pricing</span>
              <h2
                className="cy-heading cy-heading--section"
                style={{ maxWidth: "48rem", margin: "0 auto" }}
              >
                Protection That Costs{" "}
                <span className="cy-t-cool">Less Than Your Morning Chai.</span>
              </h2>
              <p
                className="cy-pricing__sub"
                style={{ maxWidth: "42rem", margin: "20px auto 0" }}
              >
                No hidden fees. No per-GB charges. No USD conversion surprises.
                Pricing in Indian Rupees.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="cy-billing-toggle">
              <span
                className={`cy-billing-toggle__label ${!billingAnnual ? "cy-is-active" : ""}`}
              >
                Monthly
              </span>
              <button
                className={`cy-billing-switch ${billingAnnual ? "cy-annual" : ""}`}
                onClick={() => setBillingAnnual((a) => !a)}
                aria-label="Toggle billing period"
              >
                <span className="cy-billing-switch__knob" />
              </button>
              <span
                className={`cy-billing-toggle__label ${billingAnnual ? "cy-is-active" : ""}`}
              >
                Annual
              </span>
              <span className="cy-billing-save hidden md:block">SAVE 20%</span>
            </div>
          </Reveal>

          <div className="cy-pricing-grid">
            {PRICING_PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.06}>
                <div
                  className={`cy-pricing-card ${plan.recommended ? "cy-pricing-card--rec" : "cy-glass"}`}
                >
                  {plan.recommended && (
                    <div className="cy-pricing-badge">Recommended</div>
                  )}
                  <div className="cy-pricing-card__name">{plan.name}</div>
                  <div className="cy-pricing-card__price">
                    {plan.monthly !== null ? (
                      <>
                        <span className="cy-pricing-card__amount">
                          ₹
                          <span>
                            {billingAnnual ? plan.annual : plan.monthly}
                          </span>
                        </span>
                        <span className="cy-pricing-card__per">
                          /user/month
                        </span>
                      </>
                    ) : (
                      <span className="cy-pricing-card__amount cy-pricing-card__amount--custom">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="cy-pricing-card__billing">
                    {billingAnnual ? plan.billing_annual : plan.billing_monthly}
                  </p>
                  <p className="cy-pricing-card__blurb">{plan.blurb}</p>
                  <ul className="cy-pricing-card__features">
                    {plan.features.map((f) => (
                      <li key={f} className="cy-pricing-card__feature">
                        <CheckIcon cls="cy-t-cool" size={17} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="cy-pricing-card__cta">
                    <button
                      className={`cy-btn ${plan.ctaVariant === "primary" ? "cy-btn-primary" : "cy-btn-ghost"} cy-btn--block`}
                      onClick={() => router.push("/connect")}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.08}>
            <p className="cy-pricing__fine">
              All plans: 14-day free trial · No credit card · Indian GST invoice
              · INR billing · Cancel anytime
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="cy-pricing__cta-row">
              <button
                className="cy-btn cy-btn-primary cy-pulse"
                onClick={() => router.push("/connect")}
              >
                Start Free 14-Day Trial <ArrowIcon size={18} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================= COMPARE ========================= */}
      <section id="compare" className="cy-section">
        <div className="cy-container">
          <Reveal>
            <span className="cy-eyebrow">Compare</span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className="cy-heading cy-heading--section"
              style={{ maxWidth: "48rem", marginTop: 8 }}
            >
              Why Indian Businesses Are{" "}
              <span className="cy-t-cool">Switching to CyberLS</span>
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="cy-compare__scroll">
              <div className="cy-compare-table">
                <div className="cy-compare-head">
                  <div className="cy-compare-head__feature">Feature</div>
                  <div className="cy-compare-head__col">Foreign Providers</div>
                  <div className="cy-compare-head__col cy-compare-head__col--vault">
                    Google Vault
                  </div>
                  <div className="cy-compare-head__col cy-compare-head__col--cyberls">
                    <span className="cy-t-ink">CYBER</span>
                    <span className="cy-t-cool">LS</span>
                  </div>
                </div>
                <div>
                  {COMPARE_ROWS.map(([feature, foreign, vault, cyberls]) => (
                    <div key={feature} className="cy-compare-row">
                      <div className="cy-compare-cell--feature">{feature}</div>
                      <div className="cy-compare-cell cy-compare-cell--foreign">
                        <CompareCell value={foreign} />
                      </div>
                      <div className="cy-compare-cell cy-compare-cell--vault">
                        <CompareCell value={vault} />
                      </div>
                      <div className="cy-compare-cell cy-compare-cell--cyberls">
                        <CompareCell value={cyberls} accent />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================= SOCIAL PROOF ========================= */}
      <section className="cy-section cy-section--band">
        <div className="cy-container">
          <div className="cy-testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <div className="cy-testi-card cy-glass">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="cy-t-cool-soft"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 7H4v6h4V9c0-1 .5-2 2-2V5C8 5 7 6 7 7ZM17 7h-3v6h4V9c0-1 .5-2 2-2V5c-2 0-3 1-3 2Z"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                  <p className="cy-testi-card__text">{t.text}</p>
                  <div className="cy-testi-card__person">
                    <div className="cy-testi-card__avatar">{t.initials}</div>
                    <div>
                      <div className="cy-testi-card__name">{t.name}</div>
                      <div className="cy-testi-card__role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.12}>
            <div className="cy-logos">
              <p className="cy-logos__label">Trusted by Indian businesses</p>
              <div className="cy-logos__viewport">
                <div className="cy-marquee-track" style={{ gap: 16 }}>
                  {[...LOGOS, ...LOGOS].map((l, i) => (
                    <div key={i} className="cy-logo-chip">
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================= FAQ ========================= */}
      <section id="faq" className="cy-section">
        <div className="cy-container cy-container--narrow">
          <Reveal>
            <div className="cy-faq__head">
              <span className="cy-eyebrow cy-eyebrow--center">FAQ</span>
              <h2
                className="cy-heading cy-heading--section"
                style={{ marginTop: 8 }}
              >
                Frequently Asked Questions
              </h2>
            </div>
          </Reveal>
          <div className="cy-faq-list">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={(i % 4) * 0.06}>
                <FaqItem q={faq.q} a={faq.a} defaultOpen={i === 0} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= FINAL CTA ========================= */}
      <section id="finalcta" className="cy-final-cta">
        <div className="cy-final-cta__bg" />
        <div className="cy-final-cta__grid cy-grid-bg" />
        <div className="cy-final-cta__shield">
          <ShieldSvg width={360} height={425} />
        </div>
        <div className="cy-container cy-container--narrow cy-final-cta__content">
          <Reveal>
            <h2 className="cy-heading cy-heading--cta">
              Your Business Data Deserves{" "}
              <span className="cy-t-cool">Indian Protection.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="cy-final-cta__lead">
              Every day without backup, your business operates on borrowed time.
              A 25-day clock is ticking on every deleted file.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="cy-final-cta__sub">
              Indian company. Indian infrastructure. Indian pricing. Indian
              support.{" "}
              <span className="cy-t-cool">
                Complete Google Workspace protection.
              </span>
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="cy-final-cta__actions">
              <button
                className="cy-btn cy-btn-primary cy-pulse cy-btn--lg cy-btn--responsive"
                onClick={() => router.push("/connect")}
              >
                Start Your Free 14-Day Trial
              </button>
              <button
                className="cy-btn cy-btn-ghost cy-btn--lg cy-btn--responsive"
                onClick={() => scrollTo("pricing")}
              >
                Schedule a Demo with Our Team
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.28}>
            <p className="cy-final-cta__note">
              No credit card. Setup in 5 minutes. Starts at{" "}
              <span className="cy-t-cool">₹49/user/month</span>.
            </p>
          </Reveal>
          <div className="cy-final-cta__rule cy-tricolor" />
        </div>
      </section>

      {/* ========================= RISK ASSESSMENT MODAL ========================= */}
      <AssessmentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
