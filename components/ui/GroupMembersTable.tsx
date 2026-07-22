"use client";

import React from "react";
import {
  ALL_SERVICES,
  WEEK_DAYS,
  MONTH_DAYS,
} from "@/utils/constants";
import {
  GmailIcon,
  DriveIcon,
  ContactsIcon,
  CalendarIcon,
  PhotosIcon,
} from "@/components/ui/ServiceIcon";

export interface LinkedJob {
  job_id: number;
  name?: string;
  email: string;
  method: string;
  sync_type: string;
  on?: string;
  retention_type?: string;
  services?: string[];
}

interface GroupMembersTableProps {
  modalJobs: LinkedJob[];
  setModalJobs: React.Dispatch<React.SetStateAction<LinkedJob[]>>;
  applyAll: boolean;
}

export default function GroupMembersTable({
  modalJobs,
  setModalJobs,
  applyAll,
}: GroupMembersTableProps) {
  // Helper to map service ID to custom premium SVG component
  const getServiceIcon = (id: string, className = "w-4 h-4") => {
    if (id === "gmail") return <GmailIcon className={className} />;
    if (id === "drive") return <DriveIcon className={className} />;
    if (id === "contacts") return <ContactsIcon className={className} />;
    if (id === "calendar") return <CalendarIcon className={className} />;
    if (id === "photos") return <PhotosIcon className={className} />;
    return null;
  };

  return (
    <div className="w-full">
      {!applyAll && (
        <div className="block sm:hidden text-[9px] font-bold text-slate-400 text-right select-none animate-pulse mb-1.5">
          Swipe horizontally to edit settings ➔
        </div>
      )}

      <div className="border border-slate-200 bg-white rounded-md overflow-hidden shadow-2xs max-h-[360px] overflow-y-auto overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {applyAll ? (
            /* BATCH ACTIVE: Simplify table to Email Directory list only */
            <>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 select-none">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    Member Account
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modalJobs.map((job) => (
                  <tr
                    key={job.job_id}
                    className="hover:bg-slate-50/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 select-none shrink-0 border border-slate-200">
                          {job.name
                            ? job.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : job.email[0]?.toUpperCase() || "M"}
                        </div>
                        <div>
                          {job.name && (
                            <div className="font-extrabold text-xs text-slate-800">
                              {job.name}
                            </div>
                          )}
                          <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                            {job.email}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          ) : (
            /* INDIVIDUAL ACTIVE: Show all editable column selectors */
            <>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 select-none">
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    USER / MEMBER
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    SYNC INTERVAL
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    SPECIFIC DAY/TIME
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    RETENTION
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    PROTECTED SERVICES
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modalJobs.map((job) => {
                  const rowServices = job.services || [
                    "gmail",
                    "drive",
                    "contacts",
                  ];
                  return (
                    <tr
                      key={job.job_id}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      {/* USER / MEMBER */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 select-none shrink-0 border border-slate-200">
                            {job.name
                              ? job.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                              : job.email[0]?.toUpperCase() || "M"}
                          </div>
                          <div>
                            {job.name && (
                              <div className="font-extrabold text-xs text-slate-800 whitespace-nowrap">
                                {job.name}
                              </div>
                            )}
                            <div className="text-[11px] font-bold text-slate-500 mt-0.5 whitespace-nowrap">
                              {job.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SYNC INTERVAL */}
                      <td className="px-5 py-3.5">
                        <select
                          value={job.sync_type}
                          onChange={(e) => {
                            setModalJobs((prev) =>
                              prev.map((j) =>
                                j.job_id === job.job_id
                                  ? { ...j, sync_type: e.target.value, on: "" }
                                  : j,
                              ),
                            );
                          }}
                          className="px-2.5 py-1.5 rounded-sm border border-slate-200 text-slate-800 bg-white text-xs font-bold cursor-pointer focus:outline-none focus:border-[#0b5cff]"
                        >
                          <option value="3h">Every 3 hours</option>
                          <option value="12h">12 Hours</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </td>

                      {/* SPECIFIC DAY/TIME */}
                      <td className="px-5 py-3.5">
                        {job.sync_type === "weekly" ? (
                          <select
                            value={job.on || "Sunday"}
                            onChange={(e) => {
                              setModalJobs((prev) =>
                                prev.map((j) =>
                                  j.job_id === job.job_id
                                    ? { ...j, on: e.target.value }
                                    : j,
                                ),
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-sm border border-slate-200 text-slate-800 bg-white text-xs font-bold cursor-pointer focus:outline-none focus:border-[#0b5cff]"
                          >
                            {WEEK_DAYS.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        ) : job.sync_type === "monthly" ? (
                          <select
                            value={job.on || "1"}
                            onChange={(e) => {
                              setModalJobs((prev) =>
                                prev.map((j) =>
                                  j.job_id === job.job_id
                                    ? { ...j, on: e.target.value }
                                    : j,
                                ),
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-sm border border-slate-200 text-slate-800 bg-white text-xs font-bold cursor-pointer focus:outline-none focus:border-[#0b5cff]"
                          >
                            {MONTH_DAYS.map((day) => (
                              <option key={day} value={day}>
                                Day {day}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-bold italic select-none">
                            N/A
                          </span>
                        )}
                      </td>

                      {/* RETENTION */}
                      <td className="px-5 py-3.5">
                        <select
                          value={job.retention_type || "never"}
                          onChange={(e) => {
                            setModalJobs((prev) =>
                              prev.map((j) =>
                                j.job_id === job.job_id
                                  ? { ...j, retention_type: e.target.value }
                                  : j,
                              ),
                            );
                          }}
                          className="px-2.5 py-1.5 rounded-sm border border-slate-200 text-slate-800 bg-white text-xs font-bold cursor-pointer focus:outline-none focus:border-[#0b5cff]"
                        >
                          <option value="never">Infinite (Never Delete)</option>
                          <option value="1_year">1 Year</option>
                          <option value="3_years">3 Years</option>
                          <option value="7_years">7 Years</option>
                        </select>
                      </td>

                      {/* PROTECTED SERVICES */}
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5 items-center">
                          {ALL_SERVICES.map((srv) => {
                            const isSelected = rowServices.includes(srv.id);
                            const isGmail = srv.id === "gmail";
                            return (
                              <button
                                key={srv.id}
                                type="button"
                                title={srv.label}
                                onClick={() => {
                                  if (isGmail) return;
                                  setModalJobs((prev) =>
                                    prev.map((j) => {
                                      if (j.job_id === job.job_id) {
                                        const currentServices = j.services || [
                                          "gmail",
                                        ];
                                        const updatedServices =
                                          currentServices.includes(srv.id)
                                            ? currentServices.filter(
                                                (id) => id !== srv.id,
                                              )
                                            : [...currentServices, srv.id];
                                        return {
                                          ...j,
                                          services: updatedServices,
                                        };
                                      }
                                      return j;
                                    }),
                                  );
                                }}
                                disabled={isGmail}
                                className={`p-1.5 rounded transition-all flex items-center justify-center cursor-pointer select-none border shrink-0 ${
                                  isSelected
                                    ? "bg-[#0b5cff]/10 text-[#0b5cff] border-[#0b5cff]/30"
                                    : "bg-slate-50 text-slate-400 border border-slate-200 opacity-60 hover:opacity-100"
                                } ${isGmail ? "opacity-90 cursor-not-allowed" : ""}`}
                              >
                                {getServiceIcon(srv.id, "w-4 h-4")}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </>
          )}
        </table>
      </div>
    </div>
  );
}
