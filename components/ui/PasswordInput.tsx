"use client";

import React, { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface PasswordInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  id?: string;
}

export default function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  required = true,
  className = "w-full pl-3 pr-10 py-2 border border-(--border) rounded-sm text-sm bg-(--bg-primary) text-(--text-primary) focus:outline-none focus:border-(--primary)",
  containerClassName = "space-y-1",
  labelClassName = "block text-xs font-bold text-(--text-primary)",
  id,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={8}
          maxLength={64}
          placeholder={placeholder}
          className={className}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-(--text-secondary) hover:text-(--text-primary) cursor-pointer"
        >
          {show ? (
            <VisibilityOffIcon className="w-5 h-5" />
          ) : (
            <VisibilityIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
