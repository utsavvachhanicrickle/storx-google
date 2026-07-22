"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import KeyIcon from "@mui/icons-material/Key";
import StarIcon from "@mui/icons-material/Star";
import SettingsIcon from "@mui/icons-material/Settings";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BusinessIcon from "@mui/icons-material/Business";
import LanguageIcon from "@mui/icons-material/Language";
import AddIcon from "@mui/icons-material/Add";
import PasswordInput from "@/components/ui/PasswordInput";
import { validatePassword } from "@/utils/passwordValidation";
import toast from "@/components/Toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getUserSlice } from "@/store/slices/authSlice";
import { authService } from "@/services/authService";
import { fcmService } from "@/services/fcmService";
import {
  useFCMManualRegister,
  getNotificationPermission,
  type NotificationPermissionState,
} from "@/hooks/useFCM";

let lastFreezeFetch = 0;
let lastNotificationFetch = 0;
let lastDeveloperAccessFetch = 0;
let lastFcmDevicesFetch = 0;
let lastUserSliceFetch = 0;

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // STATE MANAGEMENT
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [freezeStatus, setFreezeStatus] = useState<any>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [mfaRecoveryCodeCount, setMfaRecoveryCodeCount] = useState(0);

  const [notifications, setNotifications] = useState<Record<string, string>>({
    push: "info",
    email: "info",
    sms: "warning",
  });

  const [storageRegion, setStorageRegion] = useState("us-east-1");
  const [encryptionKeyType, setEncryptionKeyType] = useState("managed");

  const [tenants, setTenants] = useState([
    {
      id: "acme",
      name: "Acme Corp Ltd.",
      superAdmin: "admin@acme.com",
      users: 124,
      isCurrent: true,
      iconType: "business",
    },
    {
      id: "globex",
      name: "Globex Holdings (Subsidiary)",
      superAdmin: "it@globex.com",
      users: 45,
      isCurrent: false,
      iconType: "globe",
    },
  ]);

  // MFA Modal States
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [mfaModalType, setMfaModalType] = useState<"enable" | "disable">(
    "enable",
  );
  const [mfaSecretData, setMfaSecretData] = useState<any>(null);
  const [mfaPasscode, setMfaPasscode] = useState("");
  const [mfaRecoveryCode, setMfaRecoveryCode] = useState("");
  const [mfaRecoveryCodesList, setMfaRecoveryCodesList] = useState<string[]>(
    [],
  );
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

  // Password Management States
  const [loadingPassChange, setLoadingPassChange] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");
  const [changeConfirmPassword, setChangeConfirmPassword] = useState("");

  // MFA Recovery Modal States
  const [isRecoveryCodesModalOpen, setIsRecoveryCodesModalOpen] =
    useState(false);
  const [recoveryCodesType, setRecoveryCodesType] = useState<
    "generate" | "regenerate"
  >("generate");
  const [loadingRecoveryCodes, setLoadingRecoveryCodes] = useState(false);
  const [regenPasscode, setRegenPasscode] = useState("");
  const [regenRecoveryCode, setRegenRecoveryCode] = useState("");

  // Developer Access States
  const [developerApps, setDeveloperApps] = useState<any[]>([]);
  const [appHistory, setAppHistory] = useState<any[]>([]);
  const [activeHistoryApp, setActiveHistoryApp] = useState<any | null>(null);

  // FCM Push Devices States
  const [fcmDevices, setFcmDevices] = useState<any[]>([]);
  const [loadingFcmDevices, setLoadingFcmDevices] = useState(false);
  const [fcmDevicesError, setFcmDevicesError] = useState("");
  const [clientDeviceId, setClientDeviceId] = useState("");
  const [notifPermission, setNotifPermission] =
    useState<NotificationPermissionState>("default");
  const [enablingNotifs, setEnablingNotifs] = useState(false);
  const { register: registerFcmDevice } = useFCMManualRegister();
  const attemptedAutoRegister = useRef(false);

  const isThisDeviceRegistered = useMemo(() => {
    return fcmDevices.some((d) => d.DeviceID === clientDeviceId);
  }, [fcmDevices, clientDeviceId]);

  const effectivePermission = useMemo(() => {
    if (notifPermission === "granted" && !isThisDeviceRegistered) {
      return "default";
    }
    return notifPermission;
  }, [notifPermission, isThisDeviceRegistered]);

  // Safely initialize local device ID and read current notification permission on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const STORAGE_KEY = "fcm_device_id";
      const dId = localStorage.getItem(STORAGE_KEY) || "";
      setClientDeviceId(dId);
      setNotifPermission(getNotificationPermission());
    }
  }, []);

  const fetchFcmDevices = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFcmDevicesFetch < 1000) return;
    lastFcmDevicesFetch = now;

    setLoadingFcmDevices(true);
    setFcmDevicesError("");
    try {
      const devices = await fcmService.getDevices();
      setFcmDevices(devices);
    } catch (err: any) {
      console.error("Failed to load fcm devices list:", err);
      setFcmDevicesError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load push devices",
      );
    } finally {
      setLoadingFcmDevices(false);
    }
  };

  useEffect(() => {
    fetchFcmDevices();
  }, []);

  // Synchronize localStorage with backend device list:
  // If the browser has a local fcm_device_id set, but that ID does not exist in the user's registered devices list
  // returned from the API, remove it from localStorage to allow re-enabling.
  useEffect(() => {
    if (!loadingFcmDevices && !fcmDevicesError && clientDeviceId && fcmDevices.length > 0) {
      const isRegistered = fcmDevices.some((d) => d.DeviceID === clientDeviceId);
      if (!isRegistered) {
        localStorage.removeItem("fcm_device_id");
        setClientDeviceId("");
      }
    }
  }, [fcmDevices, loadingFcmDevices, fcmDevicesError, clientDeviceId]);

  // Auto-register device if browser permission is already granted but device is not registered yet
  useEffect(() => {
    if (
      notifPermission === "granted" &&
      clientDeviceId &&
      !loadingFcmDevices &&
      !isThisDeviceRegistered &&
      !enablingNotifs &&
      !attemptedAutoRegister.current
    ) {
      attemptedAutoRegister.current = true;
      handleEnableNotifications(false);
    }
  }, [
    notifPermission,
    clientDeviceId,
    isThisDeviceRegistered,
    loadingFcmDevices,
    enablingNotifs,
  ]);

  const handleToggleDeviceActive = async (device: any) => {
    const updatedStatus = !device.IsActive;

    // Optimistic UI update
    setFcmDevices((prev) =>
      prev.map((d) =>
        d.ID === device.ID ? { ...d, IsActive: updatedStatus } : d,
      ),
    );

    try {
      await fcmService.updateDevice(device.ID, {
        token: device.Token,
        deviceId: device.DeviceID,
        deviceType: device.DeviceType,
        appVersion: device.AppVersion,
        osVersion: device.OSVersion,
        deviceModel: device.DeviceModel,
        browserName: device.BrowserName,
        userAgent: device.UserAgent,
        isActive: updatedStatus,
      });
      toast.success("Push device status updated successfully.");
    } catch (err: any) {
      // Revert status on failure
      setFcmDevices((prev) =>
        prev.map((d) =>
          d.ID === device.ID ? { ...d, IsActive: device.IsActive } : d,
        ),
      );
      toast.error(
        err.response?.data?.message || err.message || "Failed to update status",
      );
    }
  };

  const handleDeleteDevice = async (tokenId: string) => {
    if (
      !confirm("Are you sure you want to permanently remove this push device?")
    ) {
      return;
    }

    try {
      const deletedDevice = fcmDevices.find((d) => d.ID === tokenId);
      await fcmService.deleteDevice(tokenId);

      if (deletedDevice && deletedDevice.DeviceID === clientDeviceId) {
        localStorage.removeItem("fcm_device_id");
        setClientDeviceId("");
      }

      setFcmDevices((prev) => prev.filter((d) => d.ID !== tokenId));
      toast.success("Push device removed successfully.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to remove push device",
      );
    }
  };

  const handleEnableNotifications = async (showToast = true) => {
    setEnablingNotifs(true);
    try {
      const result = await registerFcmDevice();
      setNotifPermission(result.permission);
      if (result.success === false) {
        const isConfigOrSdkIssue =
          result.message.toLowerCase().includes("config") ||
          result.message.toLowerCase().includes("firebase") ||
          result.message.toLowerCase().includes("vapid");
        if (isConfigOrSdkIssue) {
          if (showToast) toast.error(result.message);
        } else {
          if (showToast) {
            toast.error(
              `${result.message} Please first disable your browser notification permission or reset your browser site settings and try again.`,
            );
          }
        }
      } else {
        if (showToast) toast.success(result.message);
        // Re-read newly generated device ID from localStorage
        if (typeof window !== "undefined") {
          const dId = localStorage.getItem("fcm_device_id") || "";
          setClientDeviceId(dId);
        }
        // Refresh device list so the new registration appears
        await fetchFcmDevices(true);
      }
    } finally {
      setEnablingNotifs(false);
    }
  };

  const formatDeviceDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // const formatDeviceDate = (dateStr: string) => {
  //   if (!dateStr) return "N/A";
  //   try {
  //     const d = new Date(dateStr);
  //     return d.toLocaleDateString("en-US", {
  //       month: "short",
  //       day: "numeric",
  //       year: "numeric",
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     });
  //   } catch (err) {
  //     return dateStr;
  //   }
  // };

  const mfaSecretKey =
    typeof mfaSecretData === "string"
      ? mfaSecretData
      : mfaSecretData?.secret || "";
  const mfaQrCodeUrl = useMemo(() => {
    if (!mfaSecretKey) return "";
    const otpauthUrl = `otpauth://totp/CyberLS:${email}?secret=${mfaSecretKey}&issuer=CyberLS`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(otpauthUrl)}`;
  }, [mfaSecretKey, email]);

  // Fetch latest account details on mount
  useEffect(() => {
    const now = Date.now();
    if (now - lastUserSliceFetch < 1000) return;
    lastUserSliceFetch = now;
    dispatch(getUserSlice());
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.fullname || user.name || "");
      setEmail(user.email || "");
      setTwoFactorEnabled(
        !!(
          user.isMFAEnabled ||
          user.mfa_enabled ||
          user.mfaEnabled ||
          user.twoFactorEnabled
        ),
      );
      setHasPassword(!!user.hasPassword);
      setMfaRecoveryCodeCount(user.mfaRecoveryCodeCount || 0);
    }
  }, [user]);

  // Fetch freeze status
  useEffect(() => {
    const checkFreezeStatus = async () => {
      const now = Date.now();
      if (now - lastFreezeFetch < 1000) return;
      lastFreezeFetch = now;

      try {
        const status = await authService.getFreezeStatus();
        setFreezeStatus(status);
      } catch (err) {
        console.error("Failed to fetch account freeze status", err);
      }
    };
    checkFreezeStatus();
  }, []);

  // Fetch notification preferences
  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      const now = Date.now();
      if (now - lastNotificationFetch < 1000) return;
      lastNotificationFetch = now;

      try {
        const data = await authService.getNotificationPreferences();
        const prefItem = Array.isArray(data) ? data[0] : data;
        if (prefItem) {
          const prefs =
            prefItem.Preferences || prefItem.preferences || prefItem;
          const mapValue = (val: any) => {
            if (val === 1 || val === "1" || val === "marketing")
              return "marketing";
            if (val === 2 || val === "2" || val === "info") return "info";
            if (val === 3 || val === "3" || val === "warning") return "warning";
            if (val === 4 || val === "4" || val === "critical")
              return "critical";
            return "marketing";
          };
          setNotifications({
            push: mapValue(prefs.push),
            email: mapValue(prefs.email),
            sms: mapValue(prefs.sms),
          });
        } else {
          setNotifications({
            push: "marketing",
            email: "marketing",
            sms: "marketing",
          });
        }
      } catch (err) {
        console.error("Failed to load notification preferences", err);
        setNotifications({
          push: "marketing",
          email: "marketing",
          sms: "marketing",
        });
      }
    };
    fetchNotificationPreferences();
  }, []);

  // Fetch developer access applications
  const fetchDeveloperAccess = async () => {
    const now = Date.now();
    if (now - lastDeveloperAccessFetch < 1000) return;
    lastDeveloperAccessFetch = now;

    try {
      const data = await authService.getDeveloperAccess();
      setDeveloperApps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load developer access list", err);
    }
  };

  useEffect(() => {
    fetchDeveloperAccess();
  }, []);

  // ACTIONS
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authService.updateAccountName(fullName);
      if (res) {
        toast.success("Profile name updated successfully!");
      }
      dispatch(getUserSlice());
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Failed to update profile name",
      );
    }
  };

  const handleUpdatePreference = async (channel: string, value: string) => {
    const updatedPreferences = {
      ...notifications,
      [channel]: value,
    };
    setNotifications(updatedPreferences);

    const mapToNumber = (val: string) => {
      if (val === "marketing") return 1;
      if (val === "info") return 2;
      if (val === "warning") return 3;
      if (val === "critical") return 4;
      return 2; // fallback default
    };

    const payload = {
      preferences: {
        push: mapToNumber(updatedPreferences.push),
        email: mapToNumber(updatedPreferences.email),
        sms: mapToNumber(updatedPreferences.sms),
      },
    };

    try {
      await authService.updateNotificationPreferences(payload);
      toast.success(
        `${channel.toUpperCase()} preference updated successfully.`,
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Failed to save notification preference",
      );
    }
  };

  const handleToggle2FA = async () => {
    if (twoFactorEnabled) {
      setMfaModalType("disable");
      setMfaPasscode("");
      setMfaRecoveryCode("");
      setIsMfaModalOpen(true);
    } else {
      try {
        const secret = await authService.generateMfaSecret();
        setMfaSecretData(secret);
        setMfaModalType("enable");
        setMfaPasscode("");
        setShowRecoveryCodes(false);
        setIsMfaModalOpen(true);
      } catch (err: any) {
        toast.error(
          err.response?.data?.error ||
            err.message ||
            "Failed to initiate MFA setup",
        );
      }
    }
  };

  const handleConfirmEnableMfa = async () => {
    try {
      await authService.enableMfa(mfaPasscode);
      try {
        const codesRes = await authService.generateMfaRecoveryCodes();
        const codes = Array.isArray(codesRes)
          ? codesRes
          : codesRes.recovery_codes || codesRes.codes || [];
        setMfaRecoveryCodesList(codes);
        setShowRecoveryCodes(true);
      } catch (err) {
        toast.success("MFA Enabled! Please check recovery codes settings.");
        setIsMfaModalOpen(false);
      }
      setTwoFactorEnabled(true);
      dispatch(getUserSlice());
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Invalid passcode. Please try again.",
      );
    }
  };

  const handleConfirmDisableMfa = async () => {
    try {
      await authService.disableMfa(mfaPasscode, mfaRecoveryCode);
      toast.success("Two-Factor Authentication has been disabled.");
      setTwoFactorEnabled(false);
      setIsMfaModalOpen(false);
      dispatch(getUserSlice());
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Failed to disable MFA. Verify passcode/recovery code.",
      );
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(changeNewPassword, changeConfirmPassword)) {
      return;
    }

    try {
      setLoadingPassChange(true);
      await authService.changePassword({
        password: oldPassword,
        newPassword: changeNewPassword,
      });
      toast.success("Password changed successfully!");
      setOldPassword("");
      setChangeNewPassword("");
      setChangeConfirmPassword("");
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to change password.",
      );
    } finally {
      setLoadingPassChange(false);
    }
  };

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(changeNewPassword, changeConfirmPassword)) {
      return;
    }

    try {
      setLoadingPassChange(true);
      await authService.setPassword(changeNewPassword);
      toast.success("Password set successfully!");
      setChangeNewPassword("");
      setChangeConfirmPassword("");
      dispatch(getUserSlice());
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to set password.",
      );
    } finally {
      setLoadingPassChange(false);
    }
  };

  const handleGenerateRecoveryCodes = async () => {
    try {
      setLoadingRecoveryCodes(true);
      const res = await authService.generateMfaRecoveryCodes();
      const codes = Array.isArray(res)
        ? res
        : res.recovery_codes || res.codes || [];
      setMfaRecoveryCodesList(codes);
      setRecoveryCodesType("generate");
      setIsRecoveryCodesModalOpen(true);
      toast.success("MFA recovery codes generated successfully!");
      dispatch(getUserSlice());
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to generate recovery codes.",
      );
    } finally {
      setLoadingRecoveryCodes(false);
    }
  };

  const handleRegenerateRecoveryCodesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingRecoveryCodes(true);
      const res = await authService.regenerateMfaRecoveryCodes({
        passcode: regenPasscode,
        recoveryCode: regenRecoveryCode || undefined,
      });
      const codes = Array.isArray(res)
        ? res
        : res.recovery_codes || res.codes || [];
      setMfaRecoveryCodesList(codes);
      setRecoveryCodesType("regenerate");
      setIsRecoveryCodesModalOpen(true);
      toast.success("MFA recovery codes regenerated successfully!");
      setRegenPasscode("");
      setRegenRecoveryCode("");
      dispatch(getUserSlice());
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to regenerate recovery codes.",
      );
    } finally {
      setLoadingRecoveryCodes(false);
    }
  };

  const handleViewAppHistory = async (app: any) => {
    try {
      const history = await authService.getDeveloperAccessHistory(
        app.client_id,
      );
      setAppHistory(Array.isArray(history) ? history : []);
      setActiveHistoryApp(app);
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Failed to fetch access history",
      );
    }
  };

  const handleRevokeApp = async (clientId: string) => {
    if (
      !confirm("Are you sure you want to revoke access for this application?")
    )
      return;
    try {
      await authService.revokeDeveloperAccess(clientId);
      toast.success("Access revoked successfully.");
      fetchDeveloperAccess();
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Failed to revoke developer access",
      );
    }
  };

  const handleConnectNewTenant = () => {
    const tenantName = prompt("Enter the name of the new Tenant Workspace:");
    if (!tenantName) return;

    const newTenant = {
      id: `tenant-${Date.now()}`,
      name: tenantName,
      superAdmin: email,
      users: 1,
      isCurrent: false,
      iconType: "globe",
    };

    setTenants([...tenants, newTenant]);
    toast.success(`Tenant "${tenantName}" connected successfully!`);
  };

  const handleSwitchTenant = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => ({
        ...t,
        isCurrent: t.id === id,
      })),
    );
    const target = tenants.find((t) => t.id === id);
    toast.success(
      `Successfully switched active tenant workspace to: ${target?.name}`,
    );
  };

  const handleManageAPIKeys = () => {
    toast.info(
      "Redirecting to API Gateway & Programmatic Access keys vault...",
    );
  };

  const handleUpgradeToPaid = () => {
    toast.info(
      "Checkout Portal Initialized: Upgrading subscription from Enterprise Trial to Paid plan.",
    );
  };

  return (
    <div className="min-h-screen space-y-6 bg-(--bg)">
      {/* TITLE & HEADER */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
          Account & Tenant Settings
        </h1>
        <p className="text-sm text-(--text-secondary) font-medium">
          Manage your personal profile, security preferences, and workspace
          integrations.
        </p>
      </div>

      {/* FREEZE STATUS ALERT BANNER */}
      {freezeStatus &&
        (freezeStatus.frozen ||
          freezeStatus.warned ||
          freezeStatus.trialExpiredFrozen ||
          freezeStatus.violationFrozen) && (
          <div
            className={`p-4 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none ${
              freezeStatus.frozen ||
              freezeStatus.trialExpiredFrozen ||
              freezeStatus.violationFrozen
                ? "bg-rose-500/10 border-rose-500/20 text-rose-700 font-sans"
                : "bg-amber-500/10 border-amber-500/20 text-amber-700 font-sans"
            }`}
          >
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                <span>⚠️</span>
                {freezeStatus.frozen ||
                freezeStatus.trialExpiredFrozen ||
                freezeStatus.violationFrozen
                  ? "Account Frozen"
                  : "Account Status Warning"}
              </div>
              <p className="text-xs mt-1.5 font-medium leading-relaxed">
                {freezeStatus.trialExpiredFrozen
                  ? "Your trial has expired and your account has been locked. Upgrade your subscription to resume backups."
                  : freezeStatus.violationFrozen
                    ? "Your account is frozen due to policy violations. Access has been restricted."
                    : freezeStatus.frozen
                      ? "Your backups are suspended as the account is currently frozen."
                      : "A warning has been flagged on your account. Review your compliance settings immediately."}
              </p>
            </div>
            {(freezeStatus.trialExpiredFrozen || !freezeStatus.frozen) && (
              <button
                onClick={handleUpgradeToPaid}
                className={`px-4 py-2 rounded-md text-xs font-black transition cursor-pointer shrink-0 ${
                  freezeStatus.frozen
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                }`}
              >
                Resolve Now
              </button>
            )}
          </div>
        )}

      {/* 1. PERSONAL PROFILE CARD */}
      <div className="bg-(--bg-primary) border border-(--border) rounded-md overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-(--bg-secondary)/40 border-b border-(--border-light)">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-(--text-primary)">
            Personal Profile
          </h3>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-6">
          <div className="flex flex-col md:flex-row md:items-end gap-5">
            {/* Full Name */}
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-bold text-(--text-primary)">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-sm border border-(--border) text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/15 text-sm font-bold transition-all"
              />
            </div>

            {/* Email Address */}
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-bold text-(--text-primary)">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 rounded-sm border border-(--border-light) text-(--text-muted) bg-(--bg-secondary) cursor-not-allowed text-sm font-bold focus:outline-none"
              />
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="bg-(--primary) hover:bg-(--primary-hover) text-white font-bold text-sm px-6 py-3 rounded-md shadow-xs transition-colors duration-200 cursor-pointer select-none md:w-auto w-full shrink-0"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. SECURITY & NOTIFICATIONS SECTION */}
      <div className="space-y-6">
        {/* Account Security Card */}
        <div className="bg-(--bg-primary) border border-(--border) rounded-md overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-(--bg-secondary)/40 border-b border-(--border-light)">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-(--text-primary)">
              Account Security
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-md text-(--text-primary)">
                      Two-Factor Authentication
                    </h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border ${
                        twoFactorEnabled
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-(--bg-secondary) text-(--text-muted) border-(--border)"
                      }`}
                    >
                      {twoFactorEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-(--text-muted) mt-1.5 leading-relaxed">
                    Add an extra layer of security to your account using an
                    authenticator app.
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggle2FA}
                type="button"
                className="bg-(--secondary) hover:bg-(--secondary-hover) text-(--text-inverse) font-bold text-sm px-6 py-3 rounded-md transition-all duration-200 cursor-pointer select-none sm:w-auto w-full shrink-0"
              >
                {twoFactorEnabled ? "Disable 2FA App" : "Enable 2FA App"}
              </button>
            </div>

            {twoFactorEnabled && (
              <div className="mt-4 pt-4 border-t border-(--border-light) space-y-4 text-left">
                <h5 className="text-xs font-black text-(--text-primary) uppercase tracking-wider">
                  MFA Recovery Codes{" "}
                  {mfaRecoveryCodeCount > 0 &&
                    `(Remaining: ${mfaRecoveryCodeCount})`}
                </h5>
                <div className="flex flex-wrap gap-3">
                  {mfaRecoveryCodeCount === 0 ? (
                    <button
                      onClick={handleGenerateRecoveryCodes}
                      type="button"
                      disabled={loadingRecoveryCodes}
                      className="px-4 py-2 border border-(--border) text-(--text-primary) hover:bg-(--bg-secondary) rounded-md text-xs font-bold transition-colors cursor-pointer"
                    >
                      {loadingRecoveryCodes
                        ? "Generating..."
                        : "Generate Recovery Codes"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setRegenPasscode("");
                        setRegenRecoveryCode("");
                        setRecoveryCodesType("regenerate");
                        setIsRecoveryCodesModalOpen(true);
                      }}
                      type="button"
                      className="px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 rounded-md text-xs font-bold transition-colors cursor-pointer"
                    >
                      Regenerate Recovery Codes
                    </button>
                  )}
                  {mfaRecoveryCodesList && mfaRecoveryCodesList.length > 0 && (
                    <button
                      onClick={() => {
                        const blob = new Blob(
                          [mfaRecoveryCodesList.join("\n")],
                          { type: "text/plain" },
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "cyberls_mfa_recovery_codes.txt";
                        a.click();
                      }}
                      className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/25 rounded-md text-xs font-bold transition-colors cursor-pointer"
                    >
                      Download Generated Codes
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>{" "}
        {/* Password Settings Card */}
        <div className="bg-(--bg-primary) border border-(--border) rounded-md overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-(--bg-secondary)/40 border-b border-(--border-light)">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-(--text-primary)">
              {hasPassword ? "Password Settings" : "Set Password"}
            </h3>
          </div>
          {hasPassword ? (
            <form
              onSubmit={handleChangePasswordSubmit}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <PasswordInput
                  label="Current Password"
                  value={oldPassword}
                  onChange={setOldPassword}
                  placeholder="Enter current password"
                  id="settings-old-password"
                  className="w-full pl-4 pr-10 py-2.5 rounded-sm border border-(--border) text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) text-sm font-bold"
                  labelClassName="block text-sm font-bold text-(--text-primary)"
                  containerClassName="space-y-2"
                />

                <PasswordInput
                  label="New Password"
                  value={changeNewPassword}
                  onChange={setChangeNewPassword}
                  placeholder="Min 8 characters"
                  id="settings-new-password"
                  className="w-full pl-4 pr-10 py-2.5 rounded-sm border border-(--border) text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) text-sm font-bold"
                  labelClassName="block text-sm font-bold text-(--text-primary)"
                  containerClassName="space-y-2"
                />

                <PasswordInput
                  label="Confirm New Password"
                  value={changeConfirmPassword}
                  onChange={setChangeConfirmPassword}
                  placeholder="Repeat new password"
                  id="settings-confirm-password"
                  className="w-full pl-4 pr-10 py-2.5 rounded-sm border border-(--border) text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) text-sm font-bold"
                  labelClassName="block text-sm font-bold text-(--text-primary)"
                  containerClassName="space-y-2"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loadingPassChange}
                  className="bg-(--primary) hover:bg-(--primary-hover) text-white font-bold text-sm px-6 py-3 rounded-sm shadow-xs transition-colors duration-200 cursor-pointer select-none md:w-auto w-full"
                >
                  {loadingPassChange
                    ? "Updating Password..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSetPasswordSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <PasswordInput
                  label="New Password"
                  value={changeNewPassword}
                  onChange={setChangeNewPassword}
                  placeholder="Min 8 characters"
                  id="settings-set-new-password"
                  className="w-full pl-4 pr-10 py-2.5 rounded-sm border border-(--border) text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) text-sm font-bold"
                  labelClassName="block text-sm font-bold text-(--text-primary)"
                  containerClassName="space-y-2"
                />

                <PasswordInput
                  label="Confirm Password"
                  value={changeConfirmPassword}
                  onChange={setChangeConfirmPassword}
                  placeholder="Repeat new password"
                  id="settings-set-confirm-password"
                  className="w-full pl-4 pr-10 py-2.5 rounded-sm border border-(--border) text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) text-sm font-bold"
                  labelClassName="block text-sm font-bold text-(--text-primary)"
                  containerClassName="space-y-2"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loadingPassChange}
                  className="bg-(--primary) hover:bg-(--primary-hover) text-white font-bold text-sm px-6 py-3 rounded-sm shadow-xs transition-colors duration-200 cursor-pointer select-none md:w-auto w-full"
                >
                  {loadingPassChange ? "Setting Password..." : "Set Password"}
                </button>
              </div>
            </form>
          )}
        </div>
        {/* Notifications Card */}
        <div className="bg-(--bg-primary) border border-(--border) rounded-md overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-(--bg-secondary)/40 border-b border-(--border-light)">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-(--text-primary)">
              Notifications
            </h3>
          </div>

          <div className="p-6 divide-y divide-(--border-light) space-y-4">
            {[
              {
                id: "push",
                label: "Push Notifications",
                desc: "Alerts sent directly to your registered devices.",
              },
              {
                id: "email",
                label: "Email Notifications",
                desc: "Periodic updates and activity summaries.",
              },
              {
                id: "sms",
                label: "SMS Alerts",
                desc: "Critical alerts sent to your phone number.",
              },
            ].map((item, idx) => {
              const currentVal = notifications[item.id] || "info";
              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3 ${
                    idx > 0 ? "pt-5" : "pt-0"
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-(--text-primary)">
                      {item.label}
                    </h4>
                    <p className="text-xs font-medium text-(--text-muted) mt-1">
                      {item.desc}
                    </p>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    <select
                      value={currentVal}
                      onChange={(e) =>
                        handleUpdatePreference(item.id, e.target.value)
                      }
                      className="px-4 py-2.5 text-xs font-bold text-(--text-primary) bg-(--bg-primary) border border-(--input) rounded-sm focus:outline-none focus:border-(--primary) cursor-pointer w-full sm:w-[200px]"
                    >
                      {currentVal === "not_set" && (
                        <option value="not_set">Not Set Yet</option>
                      )}
                      <option value="marketing">Marketing</option>
                      <option value="info">Information</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. CONNECTED WORKSPACE TENANTS CARD */}
      {/* <div className="bg-(--bg-primary) border border-(--border) rounded-md overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-(--bg-secondary)/40 border-b border-(--border-light) flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-(--text-primary)">
              Connected Workspace Tenants
            </h3>
            <p className="text-[11px] font-bold text-(--text-muted) mt-1">
              Manage connected organizations. Ideal for MSPs or multi-domain corporations.
            </p>
          </div>

          <button
            onClick={handleConnectNewTenant}
            className="bg-(--primary) hover:bg-(--primary-hover) text-white font-bold text-sm px-4.5 py-2.5 rounded-md shadow-xs transition-colors flex items-center gap-2 cursor-pointer select-none shrink-0"
          >
            <AddIcon sx={{ fontSize: 16 }} />
            Connect New Tenant
          </button>
        </div>

        <div className="p-6 divide-y divide-(--border-light) space-y-4">
          {tenants.map((t, idx) => (
            <div
              key={t.id}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3 ${
                idx > 0 ? "pt-5" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-md border border-(--border) bg-(--bg-secondary) flex items-center justify-center text-xl shadow-2xs shrink-0">
                  {t.iconType === "business" ? (
                    <BusinessIcon sx={{ color: "var(--primary)" }} />
                  ) : (
                    <LanguageIcon sx={{ color: "var(--text-muted)" }} />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-[15px] text-(--text-primary)">
                      {t.name}
                    </h4>
                    {t.isCurrent && (
                      <span className="bg-(--accent-soft) text-(--primary) px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide border border-(--accent)/15">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="text-[12px] font-bold text-(--text-muted) mt-1">
                    Super Admin: <span className="text-(--text-secondary)">{t.superAdmin}</span> • {t.users} Users
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:self-center self-end">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10">
                  <span className="w-1.5 h-1.5 rounded-md bg-emerald-500" />
                  Connected
                </span>

                {t.isCurrent ? (
                  <button className="w-8 h-8 rounded-md border border-(--border) flex items-center justify-center hover:bg-(--bg-secondary) text-(--text-secondary) hover:text-(--text-primary) transition-all duration-200 cursor-pointer">
                    <SettingsIcon sx={{ fontSize: 16 }} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSwitchTenant(t.id)}
                    className="text-xs font-extrabold text-(--primary) hover:underline cursor-pointer bg-transparent border-none"
                  >
                    Switch to Tenant
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* 4. DEVELOPER ACCESS CARD */}
      {/* <div className="bg-(--bg-primary) border border-(--border) rounded-md overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-(--bg-secondary)/40 border-b border-(--border-light)">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-(--text-primary)">
            Developer Access & Authorized Apps
          </h3>
        </div>

        <div className="p-6 space-y-6">
          {developerApps.length > 0 ? (
            <div className="divide-y divide-(--border-light) space-y-4">
              {developerApps.map((app) => (
                <div key={app.client_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-[15px] text-(--text-primary)">
                        {app.application_name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide border ${
                        app.is_active
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        {app.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-(--text-muted) mt-1">
                      Developer: <span className="text-(--text-secondary)">{app.developer_email}</span> • Client ID: <span className="text-(--text-secondary) font-mono">{app.client_id}</span> • Requests: {app.total_requests}
                    </p>
                    {app.approved_scopes && app.approved_scopes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {app.approved_scopes.map((scope: string) => (
                          <span key={scope} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-(--primary)/15 text-(--primary) border border-(--primary)/10">
                            {scope}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 sm:self-center self-end">
                    <button
                      onClick={() => handleViewAppHistory(app)}
                      className="text-xs font-extrabold text-(--primary) hover:underline cursor-pointer bg-transparent border-none"
                    >
                      History Logs
                    </button>
                    <button
                      onClick={() => handleRevokeApp(app.client_id)}
                      className="px-3.5 py-1.5 rounded-sm text-xs font-extrabold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition cursor-pointer select-none"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-bold text-(--text-muted) leading-relaxed">
              No developer applications are currently authorized programmatic access.
            </p>
          )}

          <div className="border-t border-(--border-light) pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-bold text-[16px] text-(--text-primary)">
                API Keys & Webhooks
              </h4>
              <p className="text-xs font-bold text-(--text-muted) mt-1.5 max-w-2xl leading-relaxed">
                Generate API tokens for programmatic access to your CyberLs vaults and connect custom webhooks.
              </p>
            </div>

            <button
              onClick={handleManageAPIKeys}
              className="flex items-center gap-2 border border-(--border) bg-(--bg-primary) text-(--text-primary) hover:bg-(--bg-secondary) text-sm font-bold px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer select-none shrink-0"
            >
              <KeyIcon sx={{ fontSize: 16, color: "goldenrod" }} />
              Manage API Keys
            </button>
          </div>
        </div>
      </div> */}

      {/* 5. SUBSCRIPTION & BILLING CARD */}
      {/* <div className="bg-(--bg-primary) border border-(--border) rounded-md overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-(--bg-secondary)/40 border-b border-(--border-light) flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-(--text-primary)">
            Subscription & Billing
          </h3>
          <span className="bg-(--accent-soft) text-(--primary) px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border border-(--accent)/15">
            Free Trial
          </span>
        </div>

        <div className="p-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 space-y-5">
            <div>
              <h4 className="font-bold text-[17px] text-(--text-primary)">
                Enterprise Evaluation
              </h4>
              <p className="text-xs font-bold text-(--text-muted) mt-1.5 leading-relaxed">
                Your free trial is active. You have full access to all premium
                features.
              </p>
            </div>

            <div className="space-y-4 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-(--border) bg-(--bg-secondary) text-xs font-bold text-(--text-secondary)">
                <HourglassEmptyIcon sx={{ fontSize: 14, color: "orange" }} />
                14 days remaining
              </div>

              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-md bg-(--bg-secondary) border border-(--border-light)">
                  <div className="h-full w-[84%] rounded-md bg-(--primary)" />
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-(--text-muted)">
                  <span>Storage Usage</span>
                  <span className="text-(--text-secondary)">
                    840 GB / 1 TB used
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-44 w-full">
            <button
              onClick={handleUpgradeToPaid}
              className="bg-(--primary) hover:bg-(--primary-hover) text-white font-bold text-xs py-3 rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer select-none w-full"
            >
              <StarIcon sx={{ fontSize: 14, color: "gold" }} />
              Upgrade to Paid
            </button>
            <button
              onClick={() =>
                toast.info("Loading corporate invoice histories...")
              }
              className="border border-(--border) bg-(--bg-primary) hover:bg-(--bg-secondary) text-(--text-primary) text-xs font-bold py-3 rounded-md transition-all cursor-pointer select-none w-full"
            >
              View Invoices
            </button>
          </div>
        </div>
      </div> */}

      {/* 5.5. PUSH DEVICES CARD */}
      <div className="bg-(--bg-primary) border border-(--border) rounded-md overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-(--bg-secondary)/40 border-b border-(--border-light) flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-(--text-primary) shrink-0">
              Push Devices
            </h3>
            {/* Notification permission status badge */}
            {effectivePermission === "granted" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Notifications Enabled
              </span>
            )}
            {effectivePermission === "denied" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
                🚫 Blocked in Browser
              </span>
            )}
            {effectivePermission === "default" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                ⚠ Not Yet Enabled
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {effectivePermission === "denied" && (
              <a
                href="https://support.google.com/chrome/answer/3220216"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1.5 rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer select-none"
              >
                How to Unblock →
              </a>
            )}
            <button
              onClick={() => fetchFcmDevices(true)}
              disabled={loadingFcmDevices}
              className="text-xs font-extrabold text-(--primary) hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1 select-none"
            >
              {loadingFcmDevices ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="p-6">
          {notifPermission === "granted" &&
            !isThisDeviceRegistered &&
            !loadingFcmDevices && (
              <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/25 rounded-md text-xs text-amber-700 dark:text-amber-400 font-medium space-y-1.5 leading-relaxed">
                <p className="font-extrabold flex items-center gap-1.5">
                  <span>⚠️</span> Browser permission conflict detected
                </p>
                <p>
                  Your browser notification permission is set to{" "}
                  <strong>"Allowed"</strong>, but this client device is not
                  registered in the database.
                </p>
                <p>
                  To fix this, click the{" "}
                  <strong>lock / site settings icon</strong> in your browser
                  address bar next to the URL, change{" "}
                  <strong>Notifications</strong> back to{" "}
                  <em>"Ask (default)"</em> or <em>"Block"</em>, reload the page,
                  and then click the <strong>🔔 Enable Notifications</strong>{" "}
                  button again.
                </p>
              </div>
            )}

          {loadingFcmDevices ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-(--text-secondary)">
                Loading registered devices...
              </p>
            </div>
          ) : fcmDevicesError ? (
            <div className="py-4 text-center">
              <p className="text-xs font-bold text-red-500">
                ⚠️ {fcmDevicesError}
              </p>
              <button
                onClick={() => fetchFcmDevices(true)}
                className="mt-2 text-xs font-bold text-(--primary) hover:underline cursor-pointer bg-transparent border-none"
              >
                Retry
              </button>
            </div>
          ) : fcmDevices.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-(--border) rounded-md select-none">
              <p className="text-xs font-bold text-(--text-secondary)">
                No registered push devices found.
              </p>
              <p className="text-[10px] text-(--text-muted) mt-1">
                Enable notifications on your mobile or browser client to
                register devices.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-(--border-light) space-y-4">
              {fcmDevices.map((device, idx) => (
                <div
                  key={device.ID}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3 ${
                    idx > 0 ? "pt-5" : "pt-0"
                  }`}
                >
                  {/* Left Side: Device Information */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-md border border-(--border-light) bg-(--bg-secondary)/50 flex items-center justify-center text-lg shadow-2xs shrink-0 select-none">
                      {device.DeviceType === "mobile" ||
                      (device.DeviceModel &&
                        !device.DeviceModel.toLowerCase().includes("pc") &&
                        !device.DeviceModel.toLowerCase().includes("mac"))
                        ? "📱"
                        : "💻"}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-(--text-primary)">
                          {device.DeviceModel ||
                            device.BrowserName ||
                            "Unknown Device"}
                        </h4>
                        {device.DeviceID === clientDeviceId && (
                          <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide border border-emerald-500/15">
                            This Device
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-medium text-(--text-muted) space-y-0.5 leading-relaxed">
                        <p>
                          OS:{" "}
                          <span className="text-(--text-secondary)">
                            {device.OSVersion || "Unknown"}
                          </span>{" "}
                          &bull; Browser:{" "}
                          <span className="text-(--text-secondary)">
                            {device.BrowserName || "Unknown"}
                          </span>
                        </p>
                        <p>
                          Registered:{" "}
                          <span className="text-(--text-secondary)">
                            {formatDeviceDate(device.CreatedAt)}
                          </span>
                          {device.LastUsedAt && (
                            <>
                              {" "}
                              &bull; Last Active:{" "}
                              <span className="text-(--text-secondary)">
                                {formatDeviceDate(device.LastUsedAt)}
                              </span>
                            </>
                          )}
                        </p>
                        {device.IPAddress && (
                          <p>
                            IP Address:{" "}
                            <span className="text-(--text-secondary) font-mono">
                              {device.IPAddress}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Toggle Switch & Delete Action */}
                  <div className="flex items-center gap-4 shrink-0 sm:self-center self-end">
                    {/* Active/Inactive Toggle */}
                    <div
                      onClick={() => handleToggleDeviceActive(device)}
                      className="flex items-center gap-2 cursor-pointer select-none group"
                    >
                      <div
                        className={`w-[36px] h-[20px] rounded-full p-0.5 transition-colors duration-200 ${
                          device.IsActive
                            ? "bg-emerald-500"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      >
                        <div
                          className={`w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            device.IsActive
                              ? "translate-x-[16px]"
                              : "translate-x-0"
                          }`}
                        />
                      </div>
                      <span className="text-xs font-bold text-(--text-secondary) min-w-[44px]">
                        {device.IsActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteDevice(device.ID)}
                      title="Remove device registration"
                      className="w-8 h-8 rounded-md border border-(--border) flex items-center justify-center hover:bg-red-500/5 text-red-500 hover:border-red-500/30 transition-all duration-200 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. DATA RESIDENCY & ENCRYPTION CARD */}
      {/* <div className="bg-(--bg-primary) border border-(--border) rounded-md overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-(--bg-secondary)/40 border-b border-(--border-light)">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-(--text-primary)">
            Data Residency & Encryption
          </h3>
        </div>

        <div className="p-6 space-y-6 text-left">
          <div className="space-y-2 max-w-md">
            <label className="block text-sm font-bold text-(--text-primary)">
              Storage Region
            </label>
            <div className="relative">
              <select
                value={storageRegion}
                onChange={(e) => setStorageRegion(e.target.value)}
                disabled
                className="w-full px-4 py-3 rounded-md border border-(--border-light) text-(--text-muted) bg-(--bg-secondary) text-sm font-bold transition-all appearance-none cursor-not-allowed pr-10 focus:outline-none"
              >
                <option value="us-east-1">US-East (N. Virginia)</option>
                <option value="eu-central-1">EU-Central (Frankfurt)</option>
                <option value="ap-southeast-1">AP-Southeast (Singapore)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-(--text-muted)">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <p className="text-[11px] font-bold text-(--text-muted) leading-relaxed">
              Region is locked after initial vault creation for compliance.
            </p>
          </div>

          <div className="space-y-3.5">
            <label className="block text-sm font-bold text-(--text-primary)">
              Encryption Key Management
            </label>

            <div className="space-y-3">
              <div
                onClick={() => setEncryptionKeyType("managed")}
                className="flex items-center gap-3 cursor-pointer select-none group"
              >
                <div
                  className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all ${
                    encryptionKeyType === "managed"
                      ? "border-(--primary)"
                      : "border-(--border-strong) group-hover:border-(--primary)"
                  }`}
                >
                  {encryptionKeyType === "managed" && (
                    <div className="w-2.5 h-2.5 rounded-md bg-(--primary)" />
                  )}
                </div>
                <span className="text-sm font-bold text-(--text-secondary) group-hover:text-(--text-primary) transition-colors">
                  CyberLs Managed Keys (AES-256)
                </span>
              </div>

              <div
                onClick={() => setEncryptionKeyType("byok")}
                className="flex items-center gap-3 cursor-pointer select-none group"
              >
                <div
                  className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all ${
                    encryptionKeyType === "byok"
                      ? "border-(--primary)"
                      : "border-(--border-strong) group-hover:border-(--primary)"
                  }`}
                >
                  {encryptionKeyType === "byok" && (
                    <div className="w-2.5 h-2.5 rounded-md bg-(--primary)" />
                  )}
                </div>
                <span className="text-sm font-bold text-(--text-secondary) group-hover:text-(--text-primary) transition-colors">
                  Bring Your Own Key (BYOK) - <span className="text-(--text-muted) font-bold">Enterprise Plan Required</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* MFA DIALOG MODAL */}
      {isMfaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 transition-opacity duration-300">
          <div className="bg-(--bg-primary) border border-(--border) shadow-[0_10px_50px_rgba(0,0,0,0.15)] w-full max-w-[420px] rounded-[24px] overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-5 select-none">
              <h3 className="text-base font-extrabold text-(--text-primary)">
                {mfaModalType === "enable"
                  ? "Enable Two-Factor Authentication"
                  : "Disable Two-Factor Authentication"}
              </h3>
              <button
                onClick={() => setIsMfaModalOpen(false)}
                className="text-red-500 hover:scale-110 active:scale-95 transition cursor-pointer text-sm"
              >
                ❌
              </button>
            </div>

            {mfaModalType === "enable" ? (
              showRecoveryCodes ? (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-md border border-emerald-500/20">
                    ✓ Two-Factor Authentication enabled successfully! Please
                    save your recovery codes in a secure vault:
                  </p>
                  <div className="bg-(--bg-secondary)/30 border border-(--border-light) p-4 rounded-md max-h-[160px] overflow-y-auto font-mono text-[11px] space-y-1.5 text-(--text-secondary) select-all">
                    {mfaRecoveryCodesList.map((code, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between border-b border-(--border-light)/50 pb-1 last:border-none"
                      >
                        <span>Code #{idx + 1}</span>
                        <span className="font-bold">{code}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 select-none pt-2">
                    <button
                      onClick={() => {
                        const blob = new Blob(
                          [mfaRecoveryCodesList.join("\n")],
                          { type: "text/plain" },
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "cyberls_mfa_recovery_codes.txt";
                        a.click();
                      }}
                      className="px-4 py-2 rounded-md border border-(--border) bg-(--bg-primary) text-xs font-bold text-(--text-secondary) hover:bg-(--bg-active) transition cursor-pointer"
                    >
                      Download Codes
                    </button>
                    <button
                      onClick={() => setIsMfaModalOpen(false)}
                      className="px-4 py-2 rounded-md bg-(--primary) text-(--text-inverse) text-xs font-bold hover:bg-(--primary-hover) transition cursor-pointer shadow-sm"
                    >
                      Close & Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <p className="text-xs font-bold text-(--text-muted)">
                    Scan this QR code with your authenticator app (Google
                    Authenticator, Authy, etc.), or manually enter the key:
                  </p>

                  {mfaQrCodeUrl && (
                    <div className="flex justify-center py-2 bg-white rounded-md border border-gray-100 max-w-[150px] mx-auto">
                      <img
                        src={mfaQrCodeUrl}
                        alt="MFA QR Code"
                        className="w-[120px] h-[120px] object-contain"
                      />
                    </div>
                  )}

                  <div className="bg-(--bg-secondary)/30 border border-(--border-light) p-3.5 rounded-md text-center select-all">
                    <span className="text-[10px] font-black uppercase text-(--text-muted) block mb-1">
                      MFA SECRET KEY
                    </span>
                    <span className="font-mono text-xs font-bold text-(--text-primary)">
                      {mfaSecretKey || "Generating Secret..."}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-(--text-primary)">
                      Verification Code
                    </label>
                    <input
                      placeholder="Enter 6-digit passcode"
                      value={mfaPasscode}
                      onChange={(e) => setMfaPasscode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-(--border) text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) text-sm font-bold text-center tracking-[0.2em]"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex justify-end gap-3 select-none">
                    <button
                      onClick={() => setIsMfaModalOpen(false)}
                      className="px-4 py-2 rounded-md border border-(--border) bg-(--bg-primary) text-xs font-bold text-(--text-secondary) hover:bg-(--bg-active) transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmEnableMfa}
                      disabled={mfaPasscode.length !== 6}
                      className="px-4 py-2 rounded-md bg-(--primary) text-(--text-inverse) text-xs font-bold hover:bg-(--primary-hover) transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify & Activate
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-5">
                <p className="text-xs font-bold text-(--text-muted)">
                  Enter your 6-digit passcode or one of your recovery backup
                  codes to disable Two-Factor Authentication.
                </p>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-(--text-primary)">
                      Passcode
                    </label>
                    <input
                      placeholder="Enter 6-digit passcode"
                      value={mfaPasscode}
                      onChange={(e) => setMfaPasscode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-(--border) text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) text-sm font-bold text-center tracking-[0.2em]"
                      maxLength={6}
                    />
                  </div>

                  <div className="text-center font-bold text-[10px] text-(--text-muted)">
                    OR
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-(--text-primary)">
                      Recovery Code
                    </label>
                    <input
                      placeholder="Enter backup recovery code"
                      value={mfaRecoveryCode}
                      onChange={(e) => setMfaRecoveryCode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-(--border) text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 select-none">
                  <button
                    onClick={() => setIsMfaModalOpen(false)}
                    className="px-4 py-2 rounded-md border border-(--border) bg-(--bg-primary) text-xs font-bold text-(--text-secondary) hover:bg-(--bg-active) transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDisableMfa}
                    disabled={mfaPasscode.length !== 6 && !mfaRecoveryCode}
                    className="px-4 py-2 rounded-md bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Disable 2FA
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEVELOPER ACCESS HISTORY POPUP MODAL */}
      {activeHistoryApp !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 transition-opacity duration-300">
          <div className="bg-(--bg-primary) border border-(--border) shadow-[0_10px_50px_rgba(0,0,0,0.15)] w-full max-w-[480px] rounded-[24px] overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-5 select-none">
              <h3 className="text-base font-extrabold text-(--text-primary)">
                Access History: {activeHistoryApp.application_name}
              </h3>
              <button
                onClick={() => setActiveHistoryApp(null)}
                className="text-red-500 hover:scale-110 active:scale-95 transition cursor-pointer text-sm"
              >
                ❌
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-(--text-muted)">
                Immutable history logs of requests routed through this developer
                token.
              </p>

              {appHistory.length > 0 ? (
                <div className="border border-(--border-light) bg-(--bg-secondary)/10 rounded-md max-h-[220px] overflow-y-auto divide-y divide-(--border-light)">
                  {appHistory.map((log) => (
                    <div
                      key={log.request_id}
                      className="p-3 text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-(--text-primary)">
                          Request Log
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            log.status === 1
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {log.status === 1 ? "Success" : "Failed"}
                        </span>
                      </div>
                      <p className="text-(--text-muted) text-[11px]">
                        ID: <span className="font-mono">{log.request_id}</span>
                      </p>
                      <p className="text-(--text-muted) text-[11px] mt-0.5 flex flex-wrap gap-1">
                        Scopes requested:
                        {log.scopes?.map((s: string) => (
                          <span
                            key={s}
                            className="bg-(--bg-secondary) border border-(--border-light) px-1 rounded font-mono text-[9px]"
                          >
                            {s}
                          </span>
                        )) || <span className="italic">none</span>}
                      </p>
                      <span className="text-[10px] text-(--text-muted) mt-0.5 block text-right font-medium">
                        {log.created_at}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-(--text-muted) text-center py-6">
                  No access history logs available for this token.
                </p>
              )}

              <div className="flex justify-end select-none pt-2">
                <button
                  onClick={() => setActiveHistoryApp(null)}
                  className="px-4 py-2 rounded-md bg-(--primary) text-(--text-inverse) text-xs font-bold hover:bg-(--primary-hover) transition cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MFA RECOVERY CODES MANAGEMENT MODAL */}
      {isRecoveryCodesModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-in fade-in duration-200">
          <div className="bg-(--bg-primary) border border-(--border) shadow-[0_10px_50px_rgba(0,0,0,0.15)] w-full max-w-[420px] rounded-[24px] overflow-hidden flex flex-col p-6 text-left">
            <div className="flex justify-between items-center mb-5 select-none">
              <h3 className="text-base font-extrabold text-(--text-primary)">
                {recoveryCodesType === "generate"
                  ? "MFA Recovery Codes"
                  : "Regenerate MFA Recovery Codes"}
              </h3>
              <button
                onClick={() => {
                  setIsRecoveryCodesModalOpen(false);
                  setMfaRecoveryCodesList([]);
                }}
                className="text-red-500 hover:scale-110 active:scale-95 transition cursor-pointer text-sm"
              >
                ❌
              </button>
            </div>

            {recoveryCodesType === "regenerate" &&
            mfaRecoveryCodesList.length === 0 ? (
              <form
                onSubmit={handleRegenerateRecoveryCodesSubmit}
                className="space-y-4"
              >
                <p className="text-xs font-bold text-(--text-muted)">
                  To regenerate your MFA backup recovery codes, verify with a
                  6-digit passcode and optional current recovery code:
                </p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-(--text-primary)">
                      Verification Passcode
                    </label>
                    <input
                      placeholder="6-digit passcode"
                      value={regenPasscode}
                      onChange={(e) => setRegenPasscode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-(--border) text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) text-sm font-bold text-center tracking-[0.2em]"
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-(--text-primary)">
                      Current Recovery Code (Optional)
                    </label>
                    <input
                      placeholder="Enter recovery code if passcode is lost"
                      value={regenRecoveryCode}
                      onChange={(e) => setRegenRecoveryCode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-(--border) text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecoveryCodesModalOpen(false);
                      setMfaRecoveryCodesList([]);
                    }}
                    className="px-4 py-2 rounded-md border border-(--border) bg-(--bg-primary) text-xs font-bold text-(--text-secondary) hover:bg-(--bg-active) transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loadingRecoveryCodes || regenPasscode.length !== 6
                    }
                    className="px-4 py-2 rounded-md bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {loadingRecoveryCodes ? "Regenerating..." : "Regenerate"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-md border border-emerald-500/20">
                  Save these recovery codes in a secure place. They can be used
                  to log in or disable MFA if you lose your device.
                </p>
                <div className="bg-(--bg-secondary)/30 border border-(--border-light) p-4 rounded-md max-h-[180px] overflow-y-auto font-mono text-[11px] space-y-1.5 text-(--text-secondary) select-all">
                  {mfaRecoveryCodesList.map((code, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border-b border-(--border-light)/50 pb-1 last:border-none"
                    >
                      <span>Code #{idx + 1}</span>
                      <span className="font-bold">{code}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      const blob = new Blob([mfaRecoveryCodesList.join("\n")], {
                        type: "text/plain",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "cyberls_mfa_recovery_codes.txt";
                      a.click();
                    }}
                    className="px-4 py-2 rounded-md border border-(--border) bg-(--bg-primary) text-xs font-bold text-(--text-secondary) hover:bg-(--bg-active) transition cursor-pointer"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => {
                      setIsRecoveryCodesModalOpen(false);
                      setMfaRecoveryCodesList([]);
                    }}
                    className="px-4 py-2 rounded-md bg-(--primary) text-(--text-inverse) text-xs font-bold hover:bg-(--primary-hover) transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
