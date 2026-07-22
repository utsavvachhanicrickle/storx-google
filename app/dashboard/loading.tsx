import React from "react";

export default function DashboardLoading() {
  return (
    <div className="h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center bg-transparent select-none animate-in fade-in duration-200">
      <div className="w-10 h-10 border-4 border-teal-500 rounded-full border-t-transparent animate-spin mb-4" />
      <p className="text-xs font-bold text-(--text-muted) animate-pulse tracking-wide uppercase">
        Loading page content...
      </p>
    </div>
  );
}
