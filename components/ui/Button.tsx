"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger" | "other";
}

export default function Button({
  type = "button",
  children,
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex
    items-center
    justify-center
    gap-2

    px-4
    py-3

    rounded-xl
    font-medium

    transition-all
    duration-300

    active:scale-[0.98]

    disabled:opacity-50
    disabled:pointer-events-none

    cursor-pointer
    select-none
  `;

  const variants = {
    primary: `
      bg-primary-color
      text-white
      hover:opacity-90
    `,

    outline: `
      border
      border-theme
      bg-main
      text-main
      hover:bg-secondary-main
    `,

    danger: `
      border
      border-red-500
      text-red-500
      hover:bg-red-500
      hover:text-white
    `,

    other: `
      bg-secondary-main
      text-main
      hover:opacity-80
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
