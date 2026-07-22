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
    whitespace-nowrap

    px-5
    py-3

    rounded-[var(--radius-md)]

    font-bold
    text-sm

    transition-all
    duration-300

    active:scale-[0.98]

    disabled:opacity-50
    disabled:pointer-events-none

    cursor-pointer
    select-none

    border
  `;

  const variants = {
    primary: `
      bg-(--primary)
      border-(--primary)
      text-(--text-inverse)

      hover:bg-(--primary-hover)
      hover:border-(--primary-hover)

      shadow-(--shadow-sm)
    `,

    outline: `
      bg-(--bg-primary)
      border-(--border-strong)
      text-(--text-primary)

      hover:bg-(--bg-secondary)
      hover:border-(--primary)

      backdrop-blur-sm
    `,

    danger: `
      bg-transparent
      border-(--danger)
      text-(--danger)

      hover:bg-(--danger)
      hover:text-white
    `,

    other: `
      bg-(--bg-secondary)
      text-(--text-primary)
      border-none
      hover:bg-(--bg-active)
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
