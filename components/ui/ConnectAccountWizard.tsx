"use client";

import React, { useState, useEffect, useMemo } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Checkbox from "@mui/material/Checkbox";
import Button from "./Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createJob } from "@/store/slices/jobSlice";
import { fetchPolicyOptions } from "@/store/slices/policySlice";
import {
  registerSlice,
  updateOnboardingStatus,
} from "@/store/slices/authSlice";
import { jobService } from "@/services/jobService";
import GoogleButton from "@/components/ui/GoogleButton";
import { useRouter } from "next/navigation";
import toast from "@/components/Toast";
import { WEEK_DAYS, MONTH_DAYS } from "@/utils/constants";
import ServiceIcon, {
  GmailIcon,
  DriveIcon,
  CalendarIcon,
  ContactsIcon,
} from "@/components/ui/ServiceIcon";

interface ConnectAccountWizardProps {
  isSignup?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
  initialStep?: number;
}
const serviceDetails: {
  [key: string]: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  };
} = {
  gmail: { label: "Gmail", icon: GmailIcon },
  drive: { label: "Drive", icon: DriveIcon },
  calendar: { label: "Calendar", icon: CalendarIcon },
  contacts: { label: "Contacts", icon: ContactsIcon },
};

const extractScopes = (source: any) => {
  if (!source) return { granted: null, ungranted: null };

  let granted = source.granted_scopes || source.grantedScopes;
  let ungranted = source.ungranted_scopes || source.ungrantedScopes;

  if (!granted && source.google_backup) {
    granted =
      source.google_backup.granted_scopes || source.google_backup.grantedScopes;
  }
  if (!granted && source.googleBackup) {
    granted =
      source.googleBackup.granted_scopes || source.googleBackup.grantedScopes;
  }

  if (!ungranted && source.google_backup) {
    ungranted =
      source.google_backup.ungranted_scopes ||
      source.google_backup.ungrantedScopes;
  }
  if (!ungranted && source.googleBackup) {
    ungranted =
      source.googleBackup.ungranted_scopes ||
      source.googleBackup.ungrantedScopes;
  }

  return { granted, ungranted };
};

const WIZARD_SCOPES =
  "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/admin.directory.user.readonly https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/contacts.readonly";

export default function ConnectAccountWizard({
  isSignup = false,
  onClose,
  onComplete,
  initialStep = 1,
}: ConnectAccountWizardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  // Wizard Steps (Dynamic)
  const [step, setStep] = useState<number>(initialStep);
  const [accountType, setAccountType] = useState<
    "personal" | "admin_workspace" | null
  >(null);
  const [googleBackupData, setGoogleBackupData] = useState<any>(null);

  // Scope permissions tracking states
  const [grantedScopes, setGrantedScopes] = useState<string[]>([]);
  const [ungrantedScopes, setUngrantedScopes] = useState<string[]>([]);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAlreadyActive, setIsAlreadyActive] = useState(false);

  // Load saved onboarding wizard state if isSignup is true
  useEffect(() => {
    if (isSignup && typeof window !== "undefined") {
      const savedStep = localStorage.getItem("onboarding_wizard_step");
      const savedAccountType = localStorage.getItem("onboarding_wizard_account_type");
      const savedGoogleBackupData = localStorage.getItem("onboarding_wizard_google_backup_data");
      const savedGrantedScopes = localStorage.getItem("onboarding_wizard_granted_scopes");
      const savedUngrantedScopes = localStorage.getItem("onboarding_wizard_ungranted_scopes");
      const savedServicesToProtect = localStorage.getItem("onboarding_wizard_services_to_protect");

      if (savedStep) setStep(Number(savedStep));
      if (savedAccountType) setAccountType(savedAccountType as any);
      if (savedGoogleBackupData) setGoogleBackupData(JSON.parse(savedGoogleBackupData));
      if (savedGrantedScopes) setGrantedScopes(JSON.parse(savedGrantedScopes));
      if (savedUngrantedScopes) setUngrantedScopes(JSON.parse(savedUngrantedScopes));
      if (savedServicesToProtect) setServicesToProtect(JSON.parse(savedServicesToProtect));
    }
  }, [isSignup]);

  // Sync state changes to localStorage
  useEffect(() => {
    if (isSignup && typeof window !== "undefined") {
      localStorage.setItem("onboarding_wizard_step", String(step));
    }
  }, [step, isSignup]);

  useEffect(() => {
    if (isSignup && typeof window !== "undefined") {
      if (accountType) {
        localStorage.setItem("onboarding_wizard_account_type", accountType);
      } else {
        localStorage.removeItem("onboarding_wizard_account_type");
      }
    }
  }, [accountType, isSignup]);

  useEffect(() => {
    if (isSignup && typeof window !== "undefined") {
      if (googleBackupData) {
        localStorage.setItem("onboarding_wizard_google_backup_data", JSON.stringify(googleBackupData));
      } else {
        localStorage.removeItem("onboarding_wizard_google_backup_data");
      }
    }
  }, [googleBackupData, isSignup]);

  useEffect(() => {
    if (isSignup && typeof window !== "undefined") {
      localStorage.setItem("onboarding_wizard_granted_scopes", JSON.stringify(grantedScopes));
    }
  }, [grantedScopes, isSignup]);

  useEffect(() => {
    if (isSignup && typeof window !== "undefined") {
      localStorage.setItem("onboarding_wizard_ungranted_scopes", JSON.stringify(ungrantedScopes));
    }
  }, [ungrantedScopes, isSignup]);

  // Step States: Services list
  const [servicesToProtect, setServicesToProtect] = useState<{
    [key: string]: boolean;
  }>({
    gmail: true,
    drive: false,
    calendar: false,
    contacts: false,
  });

  useEffect(() => {
    if (isSignup && typeof window !== "undefined") {
      localStorage.setItem("onboarding_wizard_services_to_protect", JSON.stringify(servicesToProtect));
    }
  }, [servicesToProtect, isSignup]);

  // Step States: Select Email (Workspace only)
  const [connectedEmails, setConnectedEmails] = useState<string[]>([]);
  const [selectedMailboxes, setSelectedMailboxes] = useState<string[]>([]);

  // Auto-Sync States
  const [scheduleType, setScheduleType] = useState<
    "3h" | "12h" | "daily" | "weekly" | "monthly"
  >("3h");
  const [weeklyDay, setWeeklyDay] = useState("Monday");
  const [monthlyDay, setMonthlyDay] = useState("1");

  // Policy Selection States
  const { policyOptions } = useAppSelector((state) => state.policy);
  const [policySelectionType, setPolicySelectionType] = useState<
    "existing" | "new"
  >("existing");
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("");
  const [newPolicyName, setNewPolicyName] = useState("");
  const [jobCreationError, setJobCreationError] = useState<string | null>(null);
  const [failedJobs, setFailedJobs] = useState<any[]>([]);

  // Fetch policy options on mount
  useEffect(() => {
    if (!isSignup) {
      dispatch(fetchPolicyOptions());
    }
  }, [dispatch, isSignup]);

  // Set default selection type based on whether existing policies are available
  useEffect(() => {
    if (policyOptions && policyOptions.length === 0) {
      setPolicySelectionType("new");
    } else {
      setPolicySelectionType("existing");
    }
  }, [policyOptions]);

  // Terminal Simulator Logs
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncFinished, setSyncFinished] = useState(false);

  // Service to scopes mapping
  const serviceScopes: { [key: string]: string[] } = useMemo(
    () => ({
      gmail: ["https://www.googleapis.com/auth/gmail.readonly"],
      drive: ["https://www.googleapis.com/auth/drive.readonly"],
      calendar: ["https://www.googleapis.com/auth/calendar.readonly"],
      contacts: ["https://www.googleapis.com/auth/contacts.readonly"],
      // photos: ["https://www.googleapis.com/auth/photoslibrary.readonly"],
    }),
    [],
  );

  const isServiceGranted = (svcKey: string) => {
    if (grantedScopes.length === 0 && ungrantedScopes.length === 0) {
      return true; // Fallback if no scope data is available
    }
    const required = serviceScopes[svcKey];
    if (!required) return true;
    return required.every((scope) => grantedScopes.includes(scope));
  };

  const hasUngrantedServices = useMemo(() => {
    if (grantedScopes.length === 0 && ungrantedScopes.length === 0) {
      return false;
    }
    return Object.keys(serviceScopes).some((key) => !isServiceGranted(key));
  }, [grantedScopes, ungrantedScopes, serviceScopes]);

  // Keep servicesToProtect in sync with granted permissions
  useEffect(() => {
    if (grantedScopes.length > 0 || ungrantedScopes.length > 0) {
      setServicesToProtect((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (key !== "gmail" && !isServiceGranted(key)) {
            next[key] = false;
          }
        });
        return next;
      });
    }
  }, [grantedScopes, ungrantedScopes]);

  useEffect(() => {
    const backup = googleBackupData || user?.googleBackup;
    if (backup) {
      setAccountType(backup.account_type || "personal");

      const { granted: bg, ungranted: bug } = extractScopes(googleBackupData);
      const { granted: ug, ungranted: uug } = extractScopes(user);

      const gScopes = bg || ug || [];
      const ugScopes = bug || uug || [];
      if (gScopes.length > 0 && grantedScopes.length === 0) {
        setGrantedScopes(gScopes);
      }
      if (ugScopes.length > 0 && ungrantedScopes.length === 0) {
        setUngrantedScopes(ugScopes);
      }

      if (backup.grouped_emails && connectedEmails.length === 0) {
        const adm = backup.grouped_emails.admin_email || "";
        const conn = backup.grouped_emails.connected_emails || [];
        const list = [
          ...(adm ? [adm] : []),
          ...conn.map((item: any) =>
            typeof item === "string" ? item : item.email,
          ),
        ];
        setConnectedEmails(list);
        setSelectedMailboxes(list);
      }
    }
  }, [
    user,
    googleBackupData,
    connectedEmails.length,
    grantedScopes.length,
    ungrantedScopes.length,
  ]);

  // Dynamic Steps Tracker config
  const steps = useMemo(() => {
    const list: { id: number; label: string }[] = [];
    if (!isSignup) {
      list.push({ id: 1, label: "Account" });
    }
    if (accountType === "admin_workspace") {
      list.push({ id: list.length + 1, label: "Select Email" });
    }
    list.push({ id: list.length + 1, label: "Services" });
    if (!isSignup) {
      list.push({ id: list.length + 1, label: "Policy" });
      if (policySelectionType === "new") {
        list.push({ id: list.length + 1, label: "Auto-Sync" });
      }
    } else {
      list.push({ id: list.length + 1, label: "Auto-Sync" });
    }
    list.push({ id: list.length + 1, label: "Initialize" });
    return list;
  }, [accountType, isSignup, policySelectionType]);

  const goToNextStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === step);
    if (currentIndex !== -1 && currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1].id);
    }
  };

  const goToPrevStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1].id);
    }
  };

  const totalSteps = steps.length;
  const currentStepIndex = steps.findIndex((s) => s.id === step);
  const progressPercent =
    totalSteps > 1
      ? (Math.max(0, currentStepIndex) / (totalSteps - 1)) * 100
      : 0;
  const initializeStepId = steps[steps.length - 1]?.id || totalSteps;
  const accountStepId = steps.find((s) => s.label === "Account")?.id;
  const emailStepId = steps.find((s) => s.label === "Select Email")?.id;
  const servicesStepId = steps.find((s) => s.label === "Services")?.id;
  const policyStepId = steps.find((s) => s.label === "Policy")?.id;
  const autosyncStepId = steps.find((s) => s.label === "Auto-Sync")?.id;

  const adminEmail =
    googleBackupData?.grouped_emails?.admin_email ||
    user?.googleBackup?.grouped_emails?.admin_email ||
    "";

  // Core authorization code exchange and user loading helper
  const handleExchangeCode = async (code: string) => {
    try {
      setAuthLoading(true);
      setErrorMessage(null);

      let detectedAccountType = "personal";
      let backupData: any = null;
      let emailsList: string[] = [];

      if (isSignup) {
        // Register Flow
        const registeredUser = await dispatch(registerSlice(code)).unwrap();
        backupData = registeredUser?.googleBackup;
        detectedAccountType = backupData?.account_type || "personal";

        const { granted: regG, ungranted: regUg } =
          extractScopes(registeredUser);
        setGrantedScopes(regG || []);
        setUngrantedScopes(regUg || []);
        if (typeof window !== "undefined") {
          localStorage.setItem("onboarding_wizard_granted_scopes", JSON.stringify(regG || []));
          localStorage.setItem("onboarding_wizard_ungranted_scopes", JSON.stringify(regUg || []));
        }

        if (
          detectedAccountType === "admin_workspace" &&
          backupData?.grouped_emails
        ) {
          const adm = backupData.grouped_emails.admin_email || "";
          const connected = backupData.grouped_emails.connected_emails || [];
          emailsList = [
            ...(adm ? [adm] : []),
            ...connected.map((item: any) =>
              typeof item === "string" ? item : item.email,
            ),
          ];
        }
      } else {
        // Connect Flow (Already Logged In)
        const resConnect = await jobService.connectGoogleBackup(code);
        const email =
          resConnect.data?.email || resConnect.data?.google_backup?.email;

        const { granted: connG, ungranted: connUg } = extractScopes(
          resConnect.data,
        );
        setGrantedScopes(connG || []);
        setUngrantedScopes(connUg || []);
        if (typeof window !== "undefined") {
          localStorage.setItem("onboarding_wizard_granted_scopes", JSON.stringify(connG || []));
          localStorage.setItem("onboarding_wizard_ungranted_scopes", JSON.stringify(connUg || []));
        }

        const domainUsersRes =
          await jobService.getGoogleBackupDomainUsers(email);
        console.log("domainUsersRes", domainUsersRes);

        backupData = domainUsersRes.google_backup || domainUsersRes;
        detectedAccountType = backupData?.account_type || "personal";

        if (detectedAccountType === "admin_workspace") {
          let rawEmails: any[] = [];
          const grouped = backupData?.grouped_emails;
          if (grouped) {
            const adm = grouped.admin_email || "";
            const connected = grouped.connected_emails || [];
            rawEmails = [
              ...(adm ? [adm] : []),
              ...connected.map((item: any) =>
                typeof item === "string" ? item : item.email,
              ),
            ];
          } else if (Array.isArray(domainUsersRes)) {
            rawEmails = domainUsersRes;
          } else if (Array.isArray(domainUsersRes?.success)) {
            rawEmails = domainUsersRes.success;
          } else if (Array.isArray(domainUsersRes?.connected_emails)) {
            rawEmails = domainUsersRes.connected_emails;
          }

          emailsList = rawEmails.map((item: any) =>
            typeof item === "string" ? item : item.email,
          );
        }
      }

      setAccountType(detectedAccountType as any);
      setGoogleBackupData(backupData);
      setConnectedEmails(emailsList);
      setSelectedMailboxes(emailsList);

      // Go to Services step (step 1 in signup flow, step 2 in connect flow)
      setStep(isSignup ? 1 : 2);
    } catch (error: any) {
      console.error("Failed to authenticate Workspace admin:", error);
      const errMsg = error.response?.data?.error || error.message || error;
      setErrorMessage(`Google authentication failed: ${errMsg}`);
      toast.error(`Authentication failed: ${errMsg}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const renderGoogleButton = (text: string, className?: string) => (
    <GoogleButton
      scope={WIZARD_SCOPES}
      onSuccess={handleExchangeCode}
      onError={() => setErrorMessage("Google connection failed.")}
      text={text}
      loading={authLoading}
      className={className}
    />
  );

  // Terminal Simulator for final Initialization step
  useEffect(() => {
    if (step === initializeStepId) {
      setSyncFinished(false);
      setSyncLogs([]);

      const messages = [
        "Initializing secure storage vault...",
        "Connecting Google Workspace Directory...",
        accountType === "admin_workspace"
          ? `Found ${connectedEmails.length} users in corporate tenant...`
          : "Connecting personal Google account...",
        "Generating zero-knowledge 256-bit encryption keys...",
        // "Authorizing OAuth scopes for Gmail & Calendar API...",
        // "Authorizing OAuth scopes for Google Drive API...",
        // "Requesting auto-sync policy creation from backend...",
      ];

      let idx = 0;
      const interval = setInterval(async () => {
        if (idx < messages.length) {
          setSyncLogs((prev) => [...prev, messages[idx]]);
          idx++;
        } else {
          clearInterval(interval);

          try {
            const selectedServices = Object.entries(servicesToProtect)
              .filter(([_, isEnabled]) => isEnabled)
              .map(([key]) => key);

            let apiInterval = "";
            let apiOn = "";

            if (scheduleType === "3h") {
              apiInterval = "3h";
              apiOn = "";
            } else if (scheduleType === "12h") {
              apiInterval = "12h";
              apiOn = "";
            } else if (scheduleType === "daily") {
              apiInterval = "daily";
              apiOn = "12am";
            } else if (scheduleType === "weekly") {
              apiInterval = "weekly";
              apiOn = weeklyDay;
            } else if (scheduleType === "monthly") {
              apiInterval = "monthly";
              apiOn = monthlyDay;
            }

            const targetEmails =
              accountType === "admin_workspace"
                ? selectedMailboxes
                : [googleBackupData?.email || user?.email || "admin@acme.com"];

            const jobData: any = {
              emails: targetEmails,
              services: selectedServices,
            };

            if (!isSignup && policySelectionType === "existing") {
              jobData.policy_id = Number(selectedPolicyId);
            } else {
              // During onboarding (isSignup is true), do not pass policy_name
              if (!isSignup) {
                jobData.policy_name = newPolicyName || "New team policy";
              }
              jobData.interval = apiInterval;
              jobData.on = apiOn;
            }

            const payloadLog = `Payload: ${JSON.stringify(jobData)}`;

            setSyncLogs((prev) => [
              ...prev,
              `Sending request to POST /google-backup/auto-sync/jobs...`,
              payloadLog,
            ]);

            const createJobRes = await dispatch(
              createJob({
                data: jobData,
              }),
            ).unwrap();

            const hasFailedItems =
              createJobRes &&
              Array.isArray(createJobRes.failed) &&
              createJobRes.failed.length > 0;

            if (hasFailedItems) {
              setFailedJobs(createJobRes.failed);
            }
            let isAllAlreadyExists = false;

            if (
              createJobRes &&
              createJobRes.success === false &&
              hasFailedItems
            ) {
              const allAlreadyExists = createJobRes.failed.every((f: any) =>
                f.error?.toLowerCase().includes("already exists"),
              );

              if (allAlreadyExists) {
                isAllAlreadyExists = true;
                setIsAlreadyActive(true);
              } else {
                const nonExistErr = createJobRes.failed.find(
                  (f: any) =>
                    !f.error?.toLowerCase().includes("already exists"),
                );
                const firstErr =
                  nonExistErr?.error ||
                  createJobRes.failed[0]?.error ||
                  "Some services failed to initialize";
                throw new Error(firstErr);
              }
            }

            // The response could be an array, inside a "success" field, or a single object.
            const createdJobs = Array.isArray(createJobRes?.success)
              ? createJobRes.success
              : Array.isArray(createJobRes)
                ? createJobRes
                : [createJobRes];

            for (const job of createdJobs) {
              if (job?.job_id) {
                await jobService.activateUserJob(job.job_id);
              } else if (typeof job === "number" || typeof job === "string") {
                await jobService.activateUserJob(job);
              }
            }

            setSyncLogs((prev) => [
              ...prev,
              isAllAlreadyExists
                ? "ℹ Auto-sync jobs already configured and active for these services."
                : "✔ Backend auto-sync job created successfully!",
              "Establishing secure background syncing worker...",
              "Database handshake success. Secure vault activated!",
              "Initial sync worker launched successfully.",
            ]);

            setTimeout(() => {
              setSyncFinished(true);
            }, 1800);
          } catch (error: any) {
            console.error("Failed to create auto-sync job:", error);
            const errMsg =
              error.response?.data?.error ||
              error.response?.data?.message ||
              error.message ||
              String(error);
            setSyncLogs((prev) => [...prev, `❌ ERROR: ${errMsg}`]);
            setJobCreationError(errMsg);
          }
        }
      }, 700);

      return () => clearInterval(interval);
    }
  }, [
    step,
    initializeStepId,
    accountType,
    connectedEmails,
    selectedMailboxes,
    googleBackupData,
    user,
    servicesToProtect,
    scheduleType,
    weeklyDay,
    monthlyDay,
    policySelectionType,
    selectedPolicyId,
    newPolicyName,
    dispatch,
  ]);

  const handleToggleMailbox = (email: string) => {
    setSelectedMailboxes((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email],
    );
  };

  const handleServicesContinue = () => {
    if (!isServiceGranted("gmail")) {
      toast.error("You must grant access to Gmail to continue.");
      return;
    }
    goToNextStep();
  };

  const handleServicesBack = () => {
    goToPrevStep();
  };

  const handleBackFromAutoSync = () => {
    goToPrevStep();
  };

  const handleDone = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="w-full h-full sm:h-auto sm:max-h-[90vh] max-w-2xl bg-(--bg-primary) border-0 sm:border border-(--border) rounded-none sm:rounded-[24px] shadow-none sm:shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Stepper Progress Header */}
      <div className="relative overflow-hidden rounded-t-none sm:rounded-t-[24px] border-b border-(--border) bg-(--bg-secondary) px-4 sm:px-8 py-6 shadow-sm shrink-0">
        <div className="absolute inset-0 bg-linear-to-r from-(--primary)/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative flex items-start justify-between">
          {/* Background Line */}
          <div className="absolute top-[16px] sm:top-[20px] left-[32px] right-[32px] sm:left-[52px] sm:right-[52px] h-[3px] bg-(--border) rounded-md" />

          {/* Active Progress Line */}
          <div className="absolute top-[16px] sm:top-[20px] left-[32px] right-[32px] sm:left-[52px] sm:right-[52px] h-[3px] rounded-md overflow-hidden">
            <div
              className="h-full rounded-md bg-linear-to-r from-(--primary) to-indigo-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {steps.map((s) => {
            const isActive = step >= s.id;
            const isCurrent = step === s.id;

            return (
              <div
                key={s.id}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Circle */}
                <div
                  className={`
                    relative flex items-center justify-center
                    w-8 h-8 sm:w-10 sm:h-10 rounded-md text-xs sm:text-sm font-bold
                    transition-all duration-300 border-2
                    ${
                      isActive
                        ? "bg-(--primary) border-(--primary) text-white shadow-lg shadow-(--primary)/30"
                        : "bg-(--bg-primary) border-(--border) text-(--text-muted)"
                    }
                    ${isCurrent ? "scale-105 sm:scale-110 ring-4 ring-(--primary)/15" : ""}
                  `}
                >
                  {isActive && s.id < step ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    s.id
                  )}
                </div>

                {/* Label */}
                <div className="mt-2.5 flex flex-col items-center">
                  <span
                    className={`text-[10px] sm:text-xs hidden md:block font-bold tracking-wide transition-colors duration-300 ${
                      isActive ? "text-(--text-primary)" : "text-(--text-muted)"
                    }`}
                  >
                    {s.label}
                  </span>
                  {isCurrent && (
                    <span className="mt-0.5 text-[8px] sm:text-[9px] hidden md:block uppercase tracking-widest text-(--primary) font-bold">
                      Current
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Close button top-right (Conditional) */}
      {onClose && (
        <div className="flex justify-end p-4 pb-0 shrink-0">
          <button
            onClick={onClose}
            disabled={submitting || authLoading}
            className="rounded-md p-1.5 hover:bg-(--bg-secondary) text-(--text-muted) hover:text-(--text-primary) transition cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      )}

      {/* DYNAMIC SCROLL CONTAINER */}
      <div className="flex-1 px-4 sm:px-8 pb-8 pt-2 overflow-y-auto space-y-6">
        {/* ──────── STEP 1: ACCOUNT / GOOGLE CONNECT SCREEN ──────── */}
        {step === accountStepId && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-(--primary)/10 border border-(--primary)/20 rounded-md flex items-center justify-center text-3xl mx-auto mb-6 text-(--primary)">
              👤
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-(--text-primary) tracking-tight mb-2">
              Connect Workspace Admin
            </h2>
            <p className="text-xs text-(--text-secondary) max-w-sm mx-auto mb-8 leading-relaxed">
              Authenticate with a Google Workspace Super Admin account to deploy
              the CyberLS enterprise app and configure background backup.
            </p>

            {authLoading ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-10 h-10 border-4 border-(--primary) rounded-md border-t-transparent animate-spin mb-3" />
                <p className="text-xs font-bold text-(--primary) animate-pulse uppercase tracking-wider">
                  Authorizing Workspace Credentials...
                </p>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                {renderGoogleButton(
                  isSignup
                    ? "Authenticate With Google"
                    : "Connects your Google Account",
                )}
              </div>
            )}
          </div>
        )}

        {/* ──────── STEP 3/2: SELECT SERVICES ──────── */}
        {step === servicesStepId && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-(--text-primary) mb-2 text-center">
              Select Services to Protect
            </h2>
            <div className="text-center mb-6">
              <span className="bg-(--accent-soft) text-(--primary) text-xs font-bold px-3 py-1 rounded-md border border-(--primary)/20">
                Account Connected Successfully
              </span>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              {[
                { key: "gmail", label: "Gmail", required: true },
                { key: "drive", label: "Google Drive" },
                { key: "calendar", label: "Google Calendar" },
                { key: "contacts", label: "Google Contacts" },
                // { key: "photos", label: "Google Photos" },
              ].map((svc) => {
                const isGranted = isServiceGranted(svc.key);
                return (
                  <label
                    key={svc.key}
                    className={`flex items-center p-3 border rounded-md transition-all duration-200 ${
                      !isGranted
                        ? "border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 cursor-not-allowed"
                        : svc.required
                          ? "border-(--border) bg-(--bg-secondary) opacity-70 cursor-not-allowed"
                          : "border-(--border) cursor-pointer hover:bg-(--bg-secondary) hover:border-(--primary)/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={
                        !isGranted
                          ? false
                          : svc.required
                            ? true
                            : (servicesToProtect[svc.key] ?? false)
                      }
                      disabled={!isGranted || svc.required}
                      onChange={(e) => {
                        if (svc.required || !isGranted) return;
                        setServicesToProtect({
                          ...servicesToProtect,
                          [svc.key]: e.target.checked,
                        });
                      }}
                      className={`w-5 h-5 cursor-pointer disabled:cursor-not-allowed ${
                        !isGranted ? "accent-rose-500" : "accent-(--primary)"
                      }`}
                    />
                    <div className="ml-4 flex-1 font-bold flex justify-between items-center">
                      <span
                        className={`text-sm flex items-center gap-2.5 ${!isGranted ? "text-rose-700 dark:text-rose-300" : "text-(--text-primary)"}`}
                      >
                        <ServiceIcon
                          name={svc.key}
                          className="w-5 h-5 shrink-0"
                        />
                        <span>{svc.label}</span>
                      </span>
                      {!isGranted ? (
                        <span className="text-xs text-rose-600 dark:text-rose-400 font-extrabold uppercase tracking-wide">
                          You not grand
                        </span>
                      ) : svc.required ? (
                        <span className="text-xs text-(--text-muted) font-normal">
                          Required
                        </span>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>

            {hasUngrantedServices && (
              <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-md text-center max-w-md mx-auto space-y-3">
                <p className="text-xs text-rose-700 dark:text-rose-400 font-bold">
                  ⚠️ Some required permissions were not granted. Please
                  authenticate again to grant them.
                </p>
                <div className="max-w-xs mx-auto">
                  {renderGoogleButton("Grant Access")}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between items-center max-w-md mx-auto">
              {!isSignup ||
              (accountType === "admin_workspace" && step === servicesStepId) ? (
                <Button onClick={handleServicesBack} variant="outline">
                  Back
                </Button>
              ) : (
                <div />
              )}
              <Button onClick={handleServicesContinue} variant="primary">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ──────── STEP 2: SELECT MAILBOXES (Only for Admin Workspace) ──────── */}
        {step === emailStepId && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-(--text-primary) tracking-tight">
                Google Authentication Successful
              </h2>
              <p className="text-xs text-(--text-secondary) mt-1.5 leading-relaxed">
                Your corporate Google Workspace account has been successfully
                connected for sync.
              </p>
              <p className="text-xs text-(--text-secondary) mt-1 leading-relaxed">
                CyberLS is now securely synchronized with your mail data under
                your organization's domain. Your credentials remain encrypted
                and protected.
              </p>
              <p className="text-xs font-bold text-(--text-primary) mt-3">
                Connecting account:{" "}
                <span className="font-bold text-(--primary)">{adminEmail}</span>
              </p>
            </div>

            {/* Mailboxes Box Selector */}
            <div className="border border-(--border) rounded-sm p-5 bg-(--bg-secondary)/10 space-y-3">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-(--text-primary) uppercase tracking-wide">
                  Workspace admin detected
                </h3>
                <p className="text-[11px] text-(--text-secondary)">
                  Choose which mailboxes to include in this backup.
                </p>
              </div>

              <div className="text-[11px] font-bold text-(--text-secondary)">
                {connectedEmails.length} mailboxes
              </div>

              <div className="border border-(--border) bg-(--bg-primary) rounded-sm overflow-hidden divide-y divide-(--border) max-h-[200px] w-full overflow-y-auto shadow-xs">
                {connectedEmails.map((email) => {
                  const isChecked = selectedMailboxes.includes(email);
                  const isAdmin = email === adminEmail;
                  return (
                    <div
                      key={email}
                      onClick={() => handleToggleMailbox(email)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition select-none"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isChecked}
                          sx={{
                            padding: 0,
                            "&.Mui-checked": {
                              color: "var(--primary)",
                            },
                          }}
                        />
                        <span className="text-xs font-bold text-(--text-primary) break-all">
                          {email}
                        </span>
                      </div>
                      {isAdmin && (
                        <span className="text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-extrabold px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800/30 uppercase tracking-wide shrink-0">
                          Admin
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Domain-Wide Delegation card */}
            <div className="bg-(--alert-amber-bg) border border-(--alert-amber-border) rounded-sm p-5 space-y-3">
              <h4 className="text-xs font-black text-(--alert-amber-text-title) uppercase tracking-wider">
                Domain-Wide Delegation
              </h4>
              <p className="text-[11px] text-(--alert-amber-text-desc) leading-relaxed font-bold">
                Your Google Workspace admin may need to approve API access for
                backup jobs.
              </p>
              <div className="text-[10px] space-y-1.5 font-bold font-mono bg-(--bg-secondary)/50 p-3.5 rounded-md border border-(--border)">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-(--text-muted) shrink-0">
                    Client ID
                  </span>
                  <span className="text-(--text-primary) font-bold select-all break-all sm:text-right">
                    112742432393142971486
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-(--text-muted) shrink-0">Scopes</span>
                  <span className="text-(--text-primary) font-bold select-all break-all sm:text-right">
                    https://www.googleapis.com/auth/calendar.readonly,https://www.googleapis.com/auth/contacts.readonly,https://www.googleapis.com/auth/drive.readonly,https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/photoslibrary.readonly,https://www.googleapis.com/auth/gmail.insert,https://www.googleapis.com/auth/drive.file,https://www.googleapis.com/auth/calendar.events,https://www.googleapis.com/auth/contacts,https://www.googleapis.com/auth/photoslibrary.appendonly
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-(--text-muted) shrink-0">Steps</span>
                  <span className="text-(--text-primary) font-bold text-left sm:text-right">
                    Security &rarr; Access and Data Controls &rarr; API controls
                    &rarr; Domain-wide delegation
                  </span>
                </div>
              </div>
            </div>

            {/* Google Admin console link */}
            <a
              href="https://admin.google.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 border border-(--border) hover:border-(--text-primary) bg-(--bg-secondary)/20 hover:bg-(--bg-secondary)/50 rounded-md transition text-xs font-bold text-(--text-primary) group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-lg">🛡️</span>
                <div className="text-left">
                  <p className="font-bold">Google Admin console</p>
                  <p className="text-[10px] text-(--text-muted) font-medium mt-0.5">
                    Open in a new tab to grant permissions and domain-wide
                    delegation.
                  </p>
                </div>
              </div>
              <span className="text-(--text-muted) group-hover:text-(--text-primary) transition text-sm">
                &rarr;
              </span>
            </a>

            {/* Actions Footer */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-(--border) shrink-0">
              {!isSignup ? (
                <Button onClick={goToPrevStep} variant="outline">
                  Back
                </Button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-3">
                {renderGoogleButton(
                  " ",
                  "px-4 py-2.5 border border-(--border) hover:bg-slate-50 dark:hover:bg-slate-800 text-(--text-primary) font-bold text-xs rounded-md transition cursor-pointer",
                )}
                <Button onClick={goToNextStep} variant="primary">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ──────── STEP: POLICY SELECTION ──────── */}
        {step === policyStepId && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl sm:text-2xl font-bold text-(--text-primary) mb-2 text-center">
              Choose Auto-Sync Policy
            </h2>
            <p className="text-xs text-(--text-secondary) max-w-sm mx-auto mb-6 text-center leading-relaxed">
              Select an existing backup policy or create a new one to manage the
              sync schedule for this account.
            </p>

            <div className="space-y-6 max-w-md mx-auto">
              {policyOptions && policyOptions.length > 0 && !isSignup ? (
                <>
                  {/* Toggle Tabs (similar to MovePolicyModal) */}
                  <div className="grid grid-cols-2 p-1 bg-(--bg-secondary) rounded-md select-none border border-(--border)">
                    <button
                      type="button"
                      onClick={() => setPolicySelectionType("existing")}
                      className={`py-2.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        policySelectionType === "existing"
                          ? "bg-(--bg-primary) text-(--text-primary) shadow-xs border border-(--border)"
                          : "text-(--text-muted) hover:text-(--text-secondary)"
                      }`}
                    >
                      Existing policy
                    </button>
                    <button
                      type="button"
                      onClick={() => setPolicySelectionType("new")}
                      className={`py-2.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        policySelectionType === "new"
                          ? "bg-(--bg-primary) text-(--text-primary) shadow-xs border border-(--border)"
                          : "text-(--text-muted) hover:text-(--text-secondary)"
                      }`}
                    >
                      Create new
                    </button>
                  </div>

                  {policySelectionType === "existing" ? (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <label className="block text-xs font-black text-(--text-secondary) uppercase tracking-wider">
                        Select policy
                      </label>
                      <select
                        value={selectedPolicyId}
                        onChange={(e) => setSelectedPolicyId(e.target.value)}
                        className="w-full px-4 py-2.5 border border-(--border) rounded-md text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) cursor-pointer transition"
                      >
                        <option value="" disabled>
                          Select a policy...
                        </option>
                        {policyOptions.map((p) => (
                          <option key={p.policy_id} value={p.policy_id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <label className="block text-xs font-black text-(--text-secondary) uppercase tracking-wider">
                        New policy name
                      </label>
                      <input
                        type="text"
                        value={newPolicyName}
                        onChange={(e) => setNewPolicyName(e.target.value)}
                        placeholder="e.g., Marketing Team Sync, Main Policy..."
                        className="w-full px-4 py-2.5 border border-(--border) rounded-md text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) transition"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-md p-3 text-xs font-bold mb-4">
                    No existing sync policies found. Please create a new policy
                    name to configure your schedule.
                  </div>
                  <label className="block text-xs font-black text-(--text-secondary) uppercase tracking-wider">
                    New policy name
                  </label>
                  <input
                    type="text"
                    value={newPolicyName}
                    onChange={(e) => setNewPolicyName(e.target.value)}
                    placeholder="e.g., General Sync Policy..."
                    className="w-full px-4 py-2.5 border border-(--border) rounded-md text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) transition"
                  />
                </div>
              )}

              {/* Actions Footer */}
              <div className="mt-8 flex justify-between items-center pt-4 border-t border-(--border)">
                <Button onClick={goToPrevStep} variant="outline">
                  Back
                </Button>
                <Button
                  onClick={goToNextStep}
                  variant="primary"
                  disabled={
                    policySelectionType === "existing"
                      ? !selectedPolicyId
                      : !newPolicyName.trim()
                  }
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ──────── STEP: CONFIGURE AUTO-SYNC ──────── */}
        {step === autosyncStepId && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-(--text-primary) mb-6 text-center">
              Configure Auto-Sync
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              {[
                {
                  val: "3h",
                  title: "Every 3 hours",
                  desc: "Continuous protection (3h)",
                },
                {
                  val: "12h",
                  title: "Every 12 Hours",
                  desc: "Standard frequency (12h)",
                },
                {
                  val: "daily",
                  title: "Daily",
                  desc: "Recommended policy (24h)",
                },
                {
                  val: "weekly",
                  title: "Weekly",
                  desc: "Once per week",
                },
                {
                  val: "monthly",
                  title: "Monthly",
                  desc: "Once per month",
                },
              ].map((item) => (
                <div
                  key={item.val}
                  onClick={() => setScheduleType(item.val as any)}
                  className={`p-4 border-2 rounded-md cursor-pointer transition-all ${
                    scheduleType === item.val
                      ? "border-(--primary) bg-(--primary)/5"
                      : "border-(--border) hover:border-(--text-secondary)"
                  }`}
                >
                  <div className="font-bold text-(--text-primary) text-sm">
                    {item.title}
                  </div>
                  <div className="text-xs text-(--text-muted) mt-1">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Dropdown Selector if Weekly is chosen */}
            {scheduleType === "weekly" && (
              <div className="space-y-2 max-w-md mx-auto mt-4 animate-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-(--text-secondary) block">
                  On Day of Week
                </label>
                <select
                  value={weeklyDay}
                  onChange={(e) => setWeeklyDay(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-bold text-(--text-primary) bg-(--bg-primary) border border-(--border) rounded-md focus:outline-none focus:border-(--border) cursor-pointer"
                >
                  {WEEK_DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dropdown Selector if Monthly is chosen */}
            {scheduleType === "monthly" && (
              <div className="space-y-2 max-w-md mx-auto mt-4 animate-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-(--text-secondary) block">
                  On Day of Month
                </label>
                <select
                  value={monthlyDay}
                  onChange={(e) => setMonthlyDay(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-bold text-(--text-primary) bg-(--bg-primary) border border-(--border) rounded-md focus:outline-none focus:border-(--border) cursor-pointer"
                >
                  {MONTH_DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-8 flex justify-between items-center max-w-md mx-auto">
              <Button onClick={handleBackFromAutoSync} variant="outline">
                Back
              </Button>
              <Button onClick={goToNextStep} variant="primary">
                Start First Sync
              </Button>
            </div>
          </div>
        )}

        {/* ──────── STEP 5/4: INITIALIZE VAULT ──────── */}
        {step === initializeStepId && (
          <div className="w-full">
            {jobCreationError ? (
              (() => {
                const isDuplicate =
                  jobCreationError
                    .toLowerCase()
                    .includes("idx_google_backup_cred_project_email") ||
                  jobCreationError.includes("23505") ||
                  jobCreationError.toLowerCase().includes("duplicate key");

                return isDuplicate ? (
                  <div className="text-left py-4 animate-in fade-in duration-300 max-w-md mx-auto space-y-5">
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-md p-5 flex gap-4">
                      <div className="text-3xl shrink-0">⚠️</div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                          Email Already Connected
                        </h3>
                        <p className="text-xs text-rose-600 dark:text-rose-300/80 leading-relaxed font-bold">
                          A backup sync job already exists for this email
                          address in the current project. Accounts can only be
                          connected to a single backup job at a time.
                        </p>
                      </div>
                    </div>

                    <div className="bg-(--bg-secondary) border border-(--border) rounded-md p-5 space-y-3.5">
                      <h4 className="text-xs font-black text-(--text-primary) uppercase tracking-wider">
                        How to Resolve
                      </h4>
                      <ul className="text-xs space-y-2.5 text-(--text-secondary) font-bold list-disc pl-5">
                        <li>
                          Go back to the previous steps and select a different
                          email address.
                        </li>
                        <li>
                          Go to the{" "}
                          <span
                            className="text-(--primary) cursor-pointer hover:underline"
                            onClick={() => {
                              if (onClose) onClose();
                              router.push("/dashboard/users_groups");
                            }}
                          >
                            Users & Groups
                          </span>{" "}
                          panel to manage or remove the existing job for this
                          email.
                        </li>
                      </ul>
                    </div>

                    <div className="flex gap-3 justify-center pt-2">
                      <Button
                        onClick={() => {
                          setJobCreationError(null);
                          // Go back to Select Email step (or Services step if not admin workspace)
                          if (emailStepId) {
                            setStep(emailStepId);
                          } else if (servicesStepId) {
                            setStep(servicesStepId);
                          }
                        }}
                        variant="outline"
                      >
                        &larr; Go Back
                      </Button>
                      <Button
                        onClick={() => {
                          if (onClose) onClose();
                          router.push("/dashboard/users_groups");
                        }}
                        variant="primary"
                      >
                        Manage Existing Jobs
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-left py-4 animate-in fade-in duration-300 max-w-md mx-auto space-y-5">
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-md p-5 flex gap-4">
                      <div className="text-3xl shrink-0">❌</div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                          Initialization Failed
                        </h3>
                        <p className="text-xs text-rose-600 dark:text-rose-300/80 leading-relaxed font-bold wrap-break-word">
                          {jobCreationError}
                        </p>
                      </div>
                    </div>

                    <div className="bg-(--bg-secondary) border border-(--border) rounded-md p-5 space-y-3.5">
                      <h4 className="text-xs font-black text-(--text-primary) uppercase tracking-wider">
                        Suggested Actions
                      </h4>
                      <ul className="text-xs space-y-2.5 text-(--text-secondary) font-bold list-disc pl-5">
                        <li>
                          Please verify your network connection and
                          configuration options.
                        </li>
                        <li>
                          If the issue persists, please try again later or
                          contact support.
                        </li>
                      </ul>
                    </div>

                    <div className="flex gap-3 justify-center pt-2">
                      <Button
                        onClick={() => {
                          setJobCreationError(null);
                          // Go back to Select Email step (or Services step if not admin workspace)
                          if (emailStepId) {
                            setStep(emailStepId);
                          } else if (servicesStepId) {
                            setStep(servicesStepId);
                          }
                        }}
                        variant="outline"
                      >
                        &larr; Go Back
                      </Button>
                      <Button
                        onClick={() => {
                          setJobCreationError(null);
                          // Trigger initialization simulator again by resetting steps
                          setStep(0);
                          setTimeout(() => setStep(initializeStepId), 50);
                        }}
                        variant="primary"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                );
              })()
            ) : !syncFinished ? (
              <div className="text-center py-6">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-(--primary) rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-xl">
                    🔒
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-(--text-primary) mb-3">
                  Establishing Secure Vault...
                </h2>
                <p className="text-xs sm:text-sm text-(--text-secondary) mb-6">
                  Initializing enterprise backup infrastructure
                </p>

                {/* Terminal Logs Simulator */}
                <div className="bg-slate-950 rounded-md p-4 text-left font-mono text-[11px] text-teal-400 h-52 overflow-y-auto shadow-inner border border-slate-800">
                  {syncLogs.map((log, index) => (
                    <div
                      key={index}
                      className="mb-2 text-teal-300 animate-pulse"
                    >
                      <span className="text-slate-500 mr-2">&gt;</span>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 animate-in fade-in duration-500">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-md flex items-center justify-center text-4xl sm:text-5xl mx-auto mb-6 text-emerald-500 shadow-lg shadow-emerald-500/20">
                  ✓
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-(--text-primary) mb-3">
                  {isAlreadyActive
                    ? "Backup Already Active"
                    : "Vault Activated Successfully"}
                </h2>
                <p className="text-xs sm:text-sm text-(--text-secondary) mb-8 max-w-md mx-auto">
                  {isAlreadyActive
                    ? "Your Google Workspace services are already configured and protected under active sync policies."
                    : "Your Google Workspace tenant is now securely protected with automated encrypted syncing."}
                </p>

                {failedJobs.length > 0 && (
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-md p-4 text-left max-w-md mx-auto mb-8 space-y-2 select-none">
                    <h3 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      ⚠️ Note: Some backups were not created
                    </h3>
                    <div className="space-y-1.5 divide-y divide-rose-500/10">
                      {failedJobs.map((f, idx) => {
                        let errorStr = f.error || "";
                        if (typeof errorStr === "string") {
                          const match = errorStr.match(/error:(.+?)\]/);
                          if (match && match[1]) {
                            errorStr = match[1].trim();
                          } else {
                            errorStr = errorStr
                              .replace(/^map\[details:\s*/i, "")
                              .replace(/\]$/, "");
                          }
                        }
                        return (
                          <div
                            key={idx}
                            className="pt-1.5 first:pt-0 text-[11px] font-bold text-rose-500 leading-tight"
                          >
                            <span className="capitalize font-black text-rose-700 dark:text-rose-400">
                              {f.service}
                            </span>{" "}
                            ({f.email}): {errorStr}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  {Object.entries(serviceDetails).map(([key, detail]) => {
                    const isSelected =
                      key === "gmail" ? true : servicesToProtect[key];
                    if (!isSelected) return null;

                    const isFailed = failedJobs.some(
                      (f) => f.service?.toLowerCase() === key.toLowerCase(),
                    );
                    const IconComponent = detail.icon;
                    return (
                      <div
                        key={key}
                        className={`border rounded-md p-4 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 ${
                          isFailed
                            ? "bg-rose-500/5 border-rose-500/20 text-rose-500 dark:text-rose-400"
                            : "bg-(--bg-secondary) border-(--border) text-(--text-primary)"
                        }`}
                      >
                        <div
                          className={`mb-2 shrink-0 ${isFailed ? "opacity-70" : ""}`}
                        >
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <div className="font-bold text-xs sm:text-sm flex items-center gap-1">
                          {detail.label}
                          {isFailed && (
                            <span className="text-[9px] font-extrabold uppercase bg-rose-500/10 px-1 py-0.5 rounded text-rose-500">
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isSignup ? (
                  <Button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("onboarding_wizard_step");
                        localStorage.removeItem("onboarding_wizard_account_type");
                        localStorage.removeItem("onboarding_wizard_google_backup_data");
                        localStorage.removeItem("onboarding_wizard_granted_scopes");
                        localStorage.removeItem("onboarding_wizard_ungranted_scopes");
                        localStorage.removeItem("onboarding_wizard_services_to_protect");
                      }
                      dispatch(updateOnboardingStatus("completed"));
                      router.replace("/dashboard");
                      toast.success("Login successful");
                    }}
                    variant="primary"
                    className="mx-auto"
                  >
                    Go to Dashboard &rarr;
                  </Button>
                ) : (
                  <Button
                    onClick={handleDone}
                    variant="primary"
                    className="mx-auto"
                  >
                    Done
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error/Success Feedbacks */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-md animate-shake max-w-md mx-auto">
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-md max-w-md mx-auto">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}
