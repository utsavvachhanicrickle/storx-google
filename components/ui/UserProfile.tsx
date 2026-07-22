"use client";

import React from "react";

interface UserProfileProps {
  name?: string;
  email?: string;
  className?: string;
}

function getInitialsColor(name: string) {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colors = [
    "bg-blue-50 text-blue-700 border-blue-100",
    "bg-indigo-50 text-indigo-700 border-indigo-100",
    "bg-emerald-50 text-emerald-700 border-emerald-100",
    "bg-purple-50 text-purple-700 border-purple-100",
    "bg-amber-50 text-amber-700 border-amber-100",
    "bg-rose-50 text-rose-700 border-rose-100",
  ];
  return colors[hash % colors.length];
}

export default function UserProfile({
  name = "",
  email = "",
  className = "",
}: UserProfileProps) {
  const userEmail = email || "";
  const userName = name || userEmail.split("@")[0] || "Workspace Member";

  const isFolder =
    userName.toLowerCase().includes("shared") ||
    userName.toLowerCase().includes("drive") ||
    userEmail.includes("marketing");

  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {isFolder ? (
        <div className="w-8 h-8 rounded-sm bg-amber-50 border border-amber-200 flex items-center justify-center text-sm shrink-0">
          📁
        </div>
      ) : (
        <div
          className={`w-8 h-8 rounded-md border flex items-center justify-center text-xs font-bold shrink-0 select-none ${getInitialsColor(userName)}`}
        >
          {initials}
        </div>
      )}
      <div>
        <div className="font-extrabold text-sm text-(--text-primary)">
          {userName}
        </div>
        <div className="text-[11px] font-bold text-(--text-muted) mt-0.5">
          {userEmail}
        </div>
      </div>
    </div>
  );
}
