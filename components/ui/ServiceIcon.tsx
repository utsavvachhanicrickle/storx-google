type IconProps = {
  className?: string;
};

export function GmailIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M6 14.5v21c0 2.5 2 4.5 4.5 4.5H16V22.5z" />
      <path fill="#34A853" d="M32 40h5.5c2.5 0 4.5-2 4.5-4.5v-21L32 22.5z" />
      <path
        fill="#EA4335"
        d="M6 14.5v-2c0-3.5 4-5.5 6.8-3.4L24 17.5 35.2 9.1C38 7 42 9 42 12.5v2L24 28z"
      />
    </svg>
  );
}

export function DriveIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#1A73E8" d="M29.5 6 43.5 30H30L16 6z" />
      <path fill="#34A853" d="M18 30h25.5L35.5 43H10z" />
      <path fill="#FBBC04" d="M16 6 2.5 30 10 43 24 19z" />
      <path fill="#FFFFFF" fillOpacity="0.25" d="M18 30h12L24 19z" />
    </svg>
  );
}

export function PhotosIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 4c5.5 0 10 4.5 10 10v10H24z" />
      <path fill="#4285F4" d="M44 24c0 5.5-4.5 10-10 10H24V24z" />
      <path fill="#34A853" d="M24 44c-5.5 0-10-4.5-10-10V24h10z" />
      <path fill="#FBBC04" d="M4 24c0-5.5 4.5-10 10-10h10v10z" />
      <circle cx="24" cy="24" r="5" fill="#FFFFFF" />
    </svg>
  );
}

export function ContactsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="11" y="4" width="28" height="40" rx="5" fill="#1A73E8" />
      <path fill="#8AB4F8" d="M39 12h4v6h-4zM39 22h4v6h-4zM39 32h4v6h-4z" />
      <circle cx="25" cy="19" r="6" fill="#FFFFFF" />
      <path
        fill="#FFFFFF"
        d="M15 35c1.8-5.2 5.6-8 10-8s8.2 2.8 10 8c-2.3 2.2-5.7 3.5-10 3.5S17.3 37.2 15 35z"
      />
    </svg>
  );
}

export function CalendarIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="6" y="8" width="36" height="34" rx="5" fill="#1A73E8" />
      <path fill="#FFFFFF" d="M10 18h28v20H10z" />
      <path fill="#EA4335" d="M6 13c0-2.8 2.2-5 5-5h7v10H6z" />
      <path fill="#34A853" d="M18 8h12v10H18z" />
      <path fill="#FBBC04" d="M30 8h7c2.8 0 5 2.2 5 5v5H30z" />
      <text
        x="24"
        y="33"
        fontSize="13"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fill="#1A73E8"
        textAnchor="middle"
      >
        31
      </text>
    </svg>
  );
}

export default function ServiceIcon({
  name,
  className = "w-5 h-5",
}: {
  name: string;
  className?: string;
}) {
  const serviceKey = (name || "").toLowerCase();

  if (serviceKey.includes("gmail")) return <GmailIcon className={className} />;
  if (serviceKey.includes("drive")) return <DriveIcon className={className} />;
  if (serviceKey.includes("photo")) return <PhotosIcon className={className} />;
  if (serviceKey.includes("contact"))
    return <ContactsIcon className={className} />;
  if (serviceKey.includes("calendar"))
    return <CalendarIcon className={className} />;

  return null;
}

export function MenuIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}

export function SidebarDashboardIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="9"
        fill="#38bdf8"
        stroke="#38bdf8"
        rx="1"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="5"
        fill="#4ade80"
        stroke="#4ade80"
        rx="1"
      />
      <rect
        x="14"
        y="12"
        width="7"
        height="9"
        fill="#fbbf24"
        stroke="#fbbf24"
        rx="1"
      />
      <rect
        x="3"
        y="16"
        width="7"
        height="5"
        fill="#fb7185"
        stroke="#fb7185"
        rx="1"
      />
    </svg>
  );
}

export function SidebarUsersIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="#4ade80"
        fill="#4ade80"
        fillOpacity="0.3"
      />
      <circle
        cx="9"
        cy="7"
        r="4"
        stroke="#38bdf8"
        fill="#38bdf8"
        fillOpacity="0.3"
      />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#fb7185" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#fbbf24" />
    </svg>
  );
}

export function SidebarSyncIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"
        stroke="#fbbf24"
      />
      <path d="M21.5 8L16.5 8" stroke="#38bdf8" />
      <circle cx="12" cy="12" r="3" fill="#4ade80" stroke="#4ade80" />
    </svg>
  );
}

export function SidebarRestoreIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
        stroke="#fb7185"
      />
      <path d="M3 3v5h5" stroke="#38bdf8" />
      <path d="M12 7v5l4 2" stroke="#4ade80" />
    </svg>
  );
}

export function SidebarServicesIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g transform="rotate(-45 12 12)">
        {/* Prongs */}
        <path
          d="M9 2v5"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M15 2v5"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Plug Body */}
        <path
          d="M6 7h12v5a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V7z"
          stroke="#38bdf8"
          fill="#38bdf8"
          fillOpacity="0.2"
        />
        {/* Ridges/details on body */}
        <path d="M9 10h6" stroke="#fbbf24" />
        <path d="M9 13h6" stroke="#fbbf24" />
        {/* Cord (curved trailing down-right) */}
        <path d="M12 16c0 2.5 1.5 4.5 4 6" stroke="#fb7185" />
      </g>
    </svg>
  );
}

export function SidebarAuditIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        fill="#fbbf24"
        fillOpacity="0.3"
        stroke="#fbbf24"
      />
      <path d="m9 11 2 2 4-4" stroke="#4ade80" />
    </svg>
  );
}

export function SidebarSettingsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer gear body */}
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        stroke="#38bdf8"
        fill="#38bdf8"
        fillOpacity="0.2"
      />
      {/* Inner gear core */}
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="#4ade80"
        fill="#4ade80"
        fillOpacity="0.3"
      />
    </svg>
  );
}

export function GearIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

export function DocumentIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}

export function PlayIcon({ className = "w-3.5 h-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function PauseIcon({ className = "w-3.5 h-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}
