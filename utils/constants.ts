export const auditLogs = [
  {
    tag: "AUTO-SYNC",
    title: "Marketing Shared Drive",
    detail: "+12 modified files synced",
    time: "2m ago",
    icon: "🗂️",
  },
  {
    tag: "SECURITY ALERT",
    title: "Anomaly Detection",
    detail: "Unusual deletion rate on Marketing Drive",
    time: "3h ago",
    icon: "⚠️",
  },
  {
    tag: "ADMIN RESTORE",
    title: "Q3_Financials_v2.xlsx",
    detail: "Restored to original location",
    time: "15m ago",
    icon: "⏪",
  },
  {
    tag: "AUTO-SYNC",
    title: "j.smith@acme.com",
    detail: "+4 emails archived",
    time: "1h ago",
    icon: "📨",
  },
  {
    tag: "SECURITY ALERT",
    title: "Anomaly Detection",
    detail: "Unusual deletion rate on Marketing Drive",
    time: "3h ago",
    icon: "⚠️",
  },
];

export const chartData = [
  { day: "Mon", storage: 780, bandwidth: 120 },
  { day: "Tue", storage: 790, bandwidth: 145 },
  { day: "Wed", storage: 810, bandwidth: 180 },
  { day: "Thu", storage: 810, bandwidth: 95 },
  { day: "Fri", storage: 820, bandwidth: 115 },
  { day: "Sat", storage: 830, bandwidth: 80 },
  { day: "Sun", storage: 840, bandwidth: 100 },
];

export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter Backup",
    price: "₹299",
    period: "/ mo",
    description:
      "Perfect for individual creators to secure their vital Google Workspace data.",
    features: [
      "100 GB Secure Backup Storage",
      "Gmail & Google Drive backup",
      "Weekly automated background syncs",
      "Standard 24-hour file recovery",
      "Basic Email Support",
    ],
    recommended: false,
    ctaText: "Start Free Trial",
  },
  {
    id: "pro",
    name: "Professional Cloud",
    price: "₹799",
    period: "/ mo",
    description:
      "Ideal for power users, freelancers, and small teams requiring robust security.",
    features: [
      "1 TB High-Speed Cloud Storage",
      "Complete Suite: Gmail, Drive, Contacts & Calendar",
      "Daily automatic incremental syncs",
      "AES 256-bit zero-knowledge encryption",
      "1-Click granular restoration tools",
      "Priority 24/7 chat support",
    ],
    recommended: true,
    ctaText: "Connect Google Workspace",
  },
  {
    id: "enterprise",
    name: "Enterprise Sync",
    price: "₹1,999",
    period: "/ mo",
    description:
      "Advanced data protection with elite controls and limitless scalability.",
    features: [
      "Unlimited Backup Storage",
      "All Workspace users and drives included",
      "Real-time & Hourly automated syncs",
      "Dedicated compliance audit logs",
      "99.9% Uptime SLA guaranteed",
      "Personal Accounts & Solutions Manager",
    ],
    recommended: false,
    ctaText: "Contact Enterprise",
  },
];

export const resourcesConstatnt = [
  {
    title: "Knowledge Base",
    description:
      "Browse articles, tutorials, and configuration guides for CyberLs admins.",
    icon: "📚",
    action: "Browse Articles →",
    iconBg: "bg-teal-100",
    iconText: "text-teal-600",
    actionText: "text-teal-600",
    hover: "hover:border-teal-400",
  },
  {
    title: "API Documentation",
    description:
      "Integrate CyberLs into your own workflows using our RESTful APIs.",
    icon: "💻",
    action: "View API Docs →",
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-600",
    actionText: "text-indigo-600",
    hover: "hover:border-indigo-400",
  },
  {
    title: "Contact Support",
    description:
      "Open a ticket with our 24/7 technical support engineering team.",
    icon: "🎙️",
    action: "Open a Ticket →",
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
    actionText: "text-rose-600",
    hover: "hover:border-rose-400",
  },
  {
    title: "Community Forum",
    description:
      "Connect with other IT admins, share tips, and request new features.",
    icon: "💬",
    action: "Join the Discussion →",
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    actionText: "text-amber-600",
    hover: "hover:border-amber-400",
  },
];

export const invoices = [
  {
    date: "May 01, 2026",
    invoice: "INV-2026-05",
    amount: "$0.00 (Trial)",
    status: "Paid",
  },
  {
    date: "Apr 01, 2026",
    invoice: "INV-2026-04",
    amount: "$124.00",
    status: "Paid",
  },
  {
    date: "Mar 01, 2026",
    invoice: "INV-2026-03",
    amount: "$124.00",
    status: "Paid",
  },
];

export {
  formatPolicy,
  WEEK_DAYS,
  MONTH_DAYS,
  ALL_SERVICES,
} from "./constants/policy_constants";
