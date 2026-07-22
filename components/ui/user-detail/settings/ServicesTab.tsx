"use client";

import React, { useState } from "react";
import {
  GmailIcon,
  DriveIcon,
  PhotosIcon,
  ContactsIcon,
  CalendarIcon,
} from "@/components/ui/ServiceIcon";
import { jobService } from "@/services/jobService";
import toast from "@/components/Toast";

interface ServicesTabProps {
  services: string[];
  onToggleService: (serviceId: string) => void;
  rawServices?: any[];
  onConnectAccount?: () => void;
}

interface ServiceRowProps {
  isChecked: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  label: string;
  isRequired?: boolean;
  isConnected?: boolean;
  showBackupNow?: boolean;
  onBackupNow?: () => void;
  backingUp?: boolean;
}

function ServiceRow({
  isChecked,
  onToggle,
  icon,
  label,
  isRequired,
  isConnected = true,
  showBackupNow,
  onBackupNow,
  backingUp,
}: ServiceRowProps) {
  return (
    <div
      onClick={isRequired || !isConnected ? undefined : onToggle}
      className={`flex flex-col p-4 border rounded-md select-none transition ${
        isRequired
          ? "bg-(--bg-secondary)/60 border-(--border) opacity-90"
          : !isConnected
            ? "bg-(--bg-secondary)/40 border-(--border) opacity-75 cursor-not-allowed"
            : "bg-(--bg-secondary) border-(--border) hover:bg-(--bg-secondary)/80 hover:border-(--text-muted) cursor-pointer"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3.5">
          <input
            type="checkbox"
            checked={isConnected ? isChecked : false}
            disabled={isRequired || !isConnected}
            onChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            className={`w-4 h-4 rounded-md accent-(--primary) border-(--border) ${
              isRequired || !isConnected
                ? "cursor-not-allowed bg-(--bg-secondary)/50 border-(--border)"
                : "cursor-pointer"
            }`}
          />
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-extrabold text-(--text-primary)">
              {label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRequired && (
            <span className="text-[10px] font-black uppercase text-(--text-muted) tracking-wider bg-(--bg-secondary) px-2 py-1 border border-(--border) rounded">
              Required
            </span>
          )}
          {!isConnected && (
            <span className="text-[10px] font-black uppercase text-(--error) tracking-wider bg-(--error)/10 border border-(--error)/20 px-2 py-1 rounded">
              Not Connected
            </span>
          )}
          {showBackupNow && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBackupNow?.();
              }}
              disabled={backingUp}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide px-3 py-1.5 bg-(--primary) text-white hover:bg-(--secondary) disabled:opacity-50 disabled:cursor-not-allowed rounded-sm transition shadow-xs cursor-pointer select-none"
            >
              {backingUp ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Backing up...
                </>
              ) : (
                <>⚡ Backup Now</>
              )}
            </button>
          )}
        </div>
      </div>
      {!isConnected && (
        <p className="text-[11px] text-(--error)/80 font-bold mt-2.5 pl-7">
          This service is not connected. Backup job is inactive.
        </p>
      )}
    </div>
  );
}

export default function ServicesTab({
  services,
  onToggleService,
  rawServices = [],
  onConnectAccount,
}: ServicesTabProps) {
  const [backingUpService, setBackingUpService] = useState<string | null>(null);

  const hasGmail = services.includes("gmail");
  const hasDrive =
    services.includes("drive") ||
    services.includes("google-drive") ||
    services.includes("google_drive");
  const hasPhotos =
    services.includes("photos") ||
    services.includes("photo") ||
    services.includes("google_photos");
  const hasContacts =
    services.includes("contacts") ||
    services.includes("contact") ||
    services.includes("google_contacts");
  const hasCalendar =
    services.includes("calendar") ||
    services.includes("calender") ||
    services.includes("google_calendar");

  // Helper: find the raw service entry for a given method
  const getRawService = (methodId: string) => {
    if (!rawServices || rawServices.length === 0) return null;
    return (
      rawServices.find(
        (s: any) =>
          s.method === methodId ||
          (methodId === "gmail" && s.method === "gmail") ||
          (methodId === "drive" && s.method === "google_drive") ||
          (methodId === "contacts" && s.method === "google_contacts") ||
          (methodId === "calendar" && s.method === "google_calendar"),
      ) || null
    );
  };

  const gmailRaw = getRawService("gmail");
  const driveRaw = getRawService("drive");
  const contactsRaw = getRawService("contacts");
  const calendarRaw = getRawService("calendar");

  const isGmailConnected = gmailRaw ? gmailRaw.connected === true : true;
  const isDriveConnected = driveRaw ? driveRaw.connected === true : true;
  const isContactsConnected = contactsRaw
    ? contactsRaw.connected === true
    : true;
  const isCalendarConnected = calendarRaw
    ? calendarRaw.connected === true
    : true;

  const isGmailActive = gmailRaw ? gmailRaw.active === true : false;
  const isDriveActive = driveRaw ? driveRaw.active === true : false;
  const isContactsActive = contactsRaw ? contactsRaw.active === true : false;
  const isCalendarActive = calendarRaw ? calendarRaw.active === true : false;

  const hasUnconnectedService =
    !isGmailConnected ||
    !isDriveConnected ||
    !isContactsConnected ||
    !isCalendarConnected;

  const handleBackupNow = async (
    serviceLabel: string,
    jobId: number | string,
  ) => {
    setBackingUpService(serviceLabel);
    try {
      await jobService.backupNow(jobId);
      toast.success(
        `${serviceLabel} backup started successfully! Running in the background.`,
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        `Failed to start ${serviceLabel} backup. Please try again.`;
      toast.error(message);
    } finally {
      setBackingUpService(null);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4 h-full overflow-y-auto bg-(--bg-primary) text-(--text-primary)">
      <p className="text-xs font-bold text-(--text-muted) mb-2">
        Enable services to backup for this mailbox.
      </p>

      <ServiceRow
        isChecked={isGmailConnected && isGmailActive}
        onToggle={() => {}}
        icon={<GmailIcon className="w-5 h-5" />}
        label="Gmail"
        isRequired={true}
        isConnected={isGmailConnected}
        showBackupNow={isGmailConnected && isGmailActive && !!gmailRaw?.job_id}
        onBackupNow={() =>
          gmailRaw?.job_id && handleBackupNow("Gmail", gmailRaw.job_id)
        }
        backingUp={backingUpService === "Gmail"}
      />

      <ServiceRow
        isChecked={isDriveConnected && isDriveActive}
        onToggle={() => onToggleService("drive")}
        icon={<DriveIcon className="w-5 h-5" />}
        label="Drive"
        isConnected={isDriveConnected}
        showBackupNow={isDriveConnected && isDriveActive && !!driveRaw?.job_id}
        onBackupNow={() =>
          driveRaw?.job_id && handleBackupNow("Drive", driveRaw.job_id)
        }
        backingUp={backingUpService === "Drive"}
      />

      {/* <ServiceRow
        isChecked={isPhotosConnected && isPhotosActive}
        onToggle={() => onToggleService("photos")}
        icon={<PhotosIcon className="w-5 h-5" />}
        label="Photos"
        isConnected={isPhotosConnected}
      /> */}

      <ServiceRow
        isChecked={isContactsConnected && isContactsActive}
        onToggle={() => onToggleService("contacts")}
        icon={<ContactsIcon className="w-5 h-5" />}
        label="Contacts"
        isConnected={isContactsConnected}
        showBackupNow={
          isContactsConnected && isContactsActive && !!contactsRaw?.job_id
        }
        onBackupNow={() =>
          contactsRaw?.job_id && handleBackupNow("Contacts", contactsRaw.job_id)
        }
        backingUp={backingUpService === "Contacts"}
      />

      <ServiceRow
        isChecked={isCalendarConnected && isCalendarActive}
        onToggle={() => onToggleService("calendar")}
        icon={<CalendarIcon className="w-5 h-5" />}
        label="Calendar"
        isConnected={isCalendarConnected}
        showBackupNow={
          isCalendarConnected && isCalendarActive && !!calendarRaw?.job_id
        }
        onBackupNow={() =>
          calendarRaw?.job_id && handleBackupNow("Calendar", calendarRaw.job_id)
        }
        backingUp={backingUpService === "Calendar"}
      />

      {hasUnconnectedService && onConnectAccount && (
        <div className="mt-2 pt-2 border-t border-(--border)">
          <button
            onClick={onConnectAccount}
            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 bg-(--secondary) text-(--text-inverse) hover:bg-(--primary) hover:text-white rounded-sm transition shadow-sm cursor-pointer select-none w-full justify-center border border-(--border)"
          >
            ➕ Connect Account
          </button>
        </div>
      )}
    </div>
  );
}
