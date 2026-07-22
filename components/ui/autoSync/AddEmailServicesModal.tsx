"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAvailableAssignments,
  clearAvailableAssignments,
} from "@/store/slices/policySlice";
import { policyService } from "@/services/policyService";
import {
  GmailIcon,
  DriveIcon,
  ContactsIcon,
  CalendarIcon,
  PhotosIcon,
} from "@/components/ui/ServiceIcon";

interface AddEmailServicesModalProps {
  policyId: number;
  onClose: () => void;
  onAdd: (result: {
    email: string;
    name: string;
    services: string[];
    job_ids: number[];
  }) => void;
}

export default function AddEmailServicesModal({
  policyId,
  onClose,
  onAdd,
}: AddEmailServicesModalProps) {
  const dispatch = useAppDispatch();
  const { availableAssignments } = useAppSelector((state) => state.policy);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Fetch directory emails based on search query
  useEffect(() => {
    dispatch(
      fetchAvailableAssignments({
        policy_id: policyId,
        search: searchQuery,
      }),
    );
    return () => {
      dispatch(clearAvailableAssignments());
    };
  }, [dispatch, policyId, searchQuery]);

  // Fetch available services when an email is selected
  useEffect(() => {
    if (!selectedEmail) {
      setAvailableServices([]);
      setSelectedServices([]);
      return;
    }

    setServicesLoading(true);
    policyService
      .getAvailableAssignments({
        policy_id: policyId,
        email: selectedEmail,
      })
      .then((res) => {
        const svcs = res.services || [];
        setAvailableServices(svcs);
        // Pre-select services that are currently assigned to this policy or unassigned
        const defaultSelected = svcs
          .filter((s: any) => {
            if (!s) return false;
            const assignment = s.assignment || "";
            if (assignment === "here" || s.assignment_info === "In this policy")
              return true;
            if (
              assignment === "other" ||
              s.assignment_info === "In other policy"
            )
              return false;
            return !s.is_assigned;
          })
          .map((s: any) => (s.method || s.service || "").toLowerCase())
          .filter(Boolean);
        setSelectedServices(defaultSelected);
      })
      .catch((err) => {
        console.error("Failed to fetch services for email:", err);
      })
      .finally(() => {
        setServicesLoading(false);
      });
  }, [policyId, selectedEmail]);

  const activeMember = useMemo(() => {
    if (!availableAssignments?.emails) return null;
    return (
      availableAssignments.emails.find((m) => m.email === selectedEmail) || null
    );
  }, [availableAssignments, selectedEmail]);

  const handleToggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service.toLowerCase())
        ? prev.filter((s) => s !== service.toLowerCase())
        : [...prev, service.toLowerCase()],
    );
  };

  const handleAdd = () => {
    if (!activeMember) return;

    // Find job_ids of selected services
    const selectedJobIds = availableServices
      .filter((s: any) =>
        selectedServices.includes((s.method || s.service || "").toLowerCase()),
      )
      .map((s: any) => s.job_id)
      .filter((id: any) => id !== undefined && id !== null);

    onAdd({
      email: activeMember.email,
      name: activeMember.name || activeMember.email.split("@")[0],
      services: selectedServices,
      job_ids: selectedJobIds,
    });
    onClose();
  };

  const getServiceIcon = (serviceName: string) => {
    const s = serviceName.toLowerCase();
    if (s.includes("gmail")) return <GmailIcon className="w-5 h-5" />;
    if (s.includes("drive")) return <DriveIcon className="w-5 h-5" />;
    if (s.includes("contact")) return <ContactsIcon className="w-5 h-5" />;
    if (s.includes("calendar")) return <CalendarIcon className="w-5 h-5" />;
    if (s.includes("photo")) return <PhotosIcon className="w-5 h-5" />;
    return <DriveIcon className="w-5 h-5" />;
  };

  const getServiceLabel = (serviceName: string) => {
    const s = serviceName.toLowerCase();
    if (s.includes("gmail")) return "Gmail";
    if (s.includes("drive")) return "Google Drive";
    if (s.includes("contact")) return "Contacts";
    if (s.includes("calendar")) return "Calendar";
    if (s.includes("photo")) return "Google Photos";
    return serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  };

  const emailsList = availableAssignments?.emails || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-(--bg-primary) border border-(--border) rounded-md shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-auto max-h-[90vh] md:max-h-[850px] animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--border-light) select-none shrink-0">
          <h2 className="text-base font-extrabold text-(--text-primary) tracking-tight">
            Add Email &amp; Services
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 transition cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-left min-h-0">
          <p className="text-xs font-bold text-(--text-muted) leading-relaxed shrink-0">
            Select an email, then choose which services to add to this policy. A
            service can only belong to one policy — assigning here removes it
            from any other policy.
          </p>

          {/* Search bar */}
          <div className="relative shrink-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-(--text-muted)">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-(--border) rounded-sm text-xs font-bold text-(--text-primary) bg-(--bg-primary) focus:outline-none focus:border-(--primary) transition"
            />
          </div>

          {/* Directory users list */}
          <div
            className={`border border-(--border) bg-(--bg-secondary)/10 rounded-sm overflow-y-auto shrink-0 select-none transition-all duration-300 ${
              selectedEmail ? "max-h-28 sm:max-h-36" : "max-h-48 sm:max-h-72"
            }`}
          >
            {emailsList.length > 0 ? (
              emailsList.map((m) => {
                const isSelected = m.email === selectedEmail;
                return (
                  <div
                    key={m.email}
                    onClick={() => setSelectedEmail(m.email)}
                    className={`flex items-center justify-between px-4 py-2.5 border-b border-(--border-light) last:border-0 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-(--primary)/10 text-(--primary)"
                        : "hover:bg-(--bg-secondary) text-(--text-primary)"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold">
                        {m.name || m.email.split("@")[0]}
                      </div>
                      <div className="text-[10px] text-(--text-muted) font-bold">
                        {m.email}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-(--text-muted) bg-(--bg-secondary) px-2 py-0.5 rounded border border-(--border-light)">
                      directory user
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-xs font-bold py-4 text-(--text-muted)">
                No directory users found.
              </div>
            )}
          </div>

          {/* Services selector for selected email */}
          {selectedEmail && activeMember && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="text-xs font-black text-(--text-primary)">
                Select services for{" "}
                <span className="text-(--primary) font-bold">
                  {selectedEmail}
                </span>
                :
              </div>

              {servicesLoading ? (
                <div className="flex items-center justify-center py-6 text-xs text-(--text-muted) font-bold">
                  <div className="w-5 h-5 border-2 border-(--primary) border-t-transparent rounded-md animate-spin mr-2"></div>
                  Loading service statuses...
                </div>
              ) : (
                <div className="border border-(--border-light) bg-(--bg-secondary)/5 rounded-md p-3.5 space-y-2.5">
                  {availableServices.length > 0 ? (
                    availableServices.map((s: any) => {
                      const serviceKey = (
                        s.method ||
                        s.service ||
                        ""
                      ).toLowerCase();
                      if (!serviceKey) return null;
                      const isChecked = selectedServices.includes(serviceKey);
                      const statusLabel =
                        s.assignment_info ||
                        (s.assignment === "here"
                          ? "In this policy"
                          : s.assignment === "other"
                            ? "In other policy"
                            : s.assignment === "none"
                              ? "Unassigned"
                              : s.is_assigned
                                ? "Assigned"
                                : "Unassigned");
                      return (
                        <label
                          key={serviceKey}
                          className="flex items-center justify-between p-2.5 rounded-sm border border-(--border) bg-(--bg-primary) hover:border-(--primary)/50 cursor-pointer transition select-none"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-all ${
                                isChecked
                                  ? "bg-(--primary) border-(--primary) text-(--text-inverse)"
                                  : "border-(--border) bg-transparent"
                              }`}
                            >
                              {isChecked && (
                                <svg
                                  className="w-2.5 h-2.5 stroke-current stroke-[3.5px] fill-none"
                                  viewBox="0 0 24 24"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleService(serviceKey)}
                              className="sr-only"
                            />
                            {getServiceIcon(serviceKey)}
                            <span className="text-xs font-extrabold text-(--text-primary)">
                              {s.service_label || getServiceLabel(serviceKey)}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-(--text-muted)">
                            {statusLabel}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <div className="text-center text-xs font-bold py-4 text-(--text-muted)">
                      No available services found.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-(--border-light) bg-(--bg-secondary)/10 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-sm border border-(--border) text-xs font-bold text-(--text-secondary) bg-(--bg-primary) hover:bg-(--bg-secondary) transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={
              !selectedEmail || selectedServices.length === 0 || servicesLoading
            }
            className="px-5 py-2 rounded-sm bg-(--primary) hover:bg-(--primary-hover) disabled:opacity-45 disabled:cursor-not-allowed text-(--text-inverse) text-xs font-bold transition cursor-pointer shadow-sm"
          >
            Add to Policy
          </button>
        </div>
      </div>
    </div>
  );
}
