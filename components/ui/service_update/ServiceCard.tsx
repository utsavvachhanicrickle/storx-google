"use client";

import React from "react";
import ServiceIcon from "@/components/ui/ServiceIcon";

export interface Service {
  id: string;
  name: string;
  description: string;
  active: number;
  inactive: number;
  iconName: string;
}

interface ServiceCardProps {
  service: Service;
  onConfigure: () => void;
}

export default function ServiceCard({
  service,
  onConfigure,
}: ServiceCardProps) {
  const isActive = Number(service.active) > 0;

  return (
    <div
      onClick={onConfigure}
      className="bg-(--bg-primary) border border-(--border) rounded-md p-6 shadow-sm flex flex-col justify-between min-h-[180px] h-full hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer active:scale-[0.99] select-none"
    >
      {/* Top Row */}
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-md bg-(--bg-secondary) flex items-center justify-center shadow-2xs border border-(--border-light)">
          <ServiceIcon name={service.iconName} className="w-10 h-10" />
        </div>
      </div>

      {/* Middle text */}
      <div className="mt-3 flex-1">
        <h3 className="font-extrabold text-sm text-(--text-primary)">
          {service.name}
        </h3>
        <p className="text-xs text-(--text-muted) font-medium mt-1 leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Bottom Row */}
      <div className="flex justify-between items-center border-t border-(--border-light) pt-3 mt-4">
        <div className="flex items-center gap-1.5 text-xs font-bold select-none">
          <span className={`w-2 h-2 rounded-md bg-emerald-500`} />
          <span className="text-emerald-500">{service.active} Active</span>
          <span className="text-(--text-muted)">•</span>
          <span className="text-(--text-muted)">
            {service.inactive} Inactive
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfigure();
          }}
          className={`text-xs font-black select-none text-emerald-500 hover:cursor-pointer hover:underline hover:underline-offset-4`}
        >
          Configure
        </button>
      </div>
    </div>
  );
}
