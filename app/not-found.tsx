"use client";
import Button from "@/components/ui/Button";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const REDIRECT_TIME = 60;

const NotFound: React.FC = () => {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState<number>(REDIRECT_TIME);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      router.push("/");
    }, REDIRECT_TIME * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="relative min-h-screen overflow-hidden bg-(--bg-app) flex items-center justify-center px-6">
      <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] rounded-md bg-(--primary)/10 blur-3xl" />

      <div className="absolute bottom-[-140px] right-[-140px] w-[340px] h-[340px] rounded-md bg-(--accent)/10 blur-3xl" />

      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(var(--grid-dot) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl border border-(--border) bg-(--glass) backdrop-blur-xl shadow-(--shadow-lg) rounded-sm p-10 text-center">
        <div className="inline-flex items-center justify-center px-5 py-2 rounded-md border border-(--primary)/20 bg-(--accent-soft) text-(--primary) text-sm font-bold mb-8">
          ERROR 404
        </div>

        {/* Illustration */}
        <div className="flex justify-center mb-10">
          <svg
            width="280"
            height="210"
            viewBox="0 0 280 210"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-xl"
          >
            <rect
              x="30"
              y="25"
              width="220"
              height="150"
              rx="18"
              fill="var(--bg-primary)"
              stroke="var(--border)"
              strokeWidth="2"
            />

            <rect
              x="55"
              y="55"
              width="170"
              height="12"
              rx="6"
              fill="var(--border-light)"
            />

            <rect
              x="55"
              y="82"
              width="130"
              height="10"
              rx="5"
              fill="var(--border-light)"
            />

            <text
              x="140"
              y="138"
              textAnchor="middle"
              fontSize="52"
              fontWeight="800"
              fill="var(--primary)"
            >
              404
            </text>

            <circle
              cx="95"
              cy="165"
              r="7"
              fill="var(--text-muted)"
              opacity="0.5"
            />

            <circle
              cx="185"
              cy="165"
              r="7"
              fill="var(--text-muted)"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-(--text-primary)">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mt-5 text-(--text-secondary) text-base md:text-lg leading-relaxed max-w-xl mx-auto">
          The page you are looking for may have been moved, deleted, renamed, or
          never existed in the first place.
        </p>

        {/* Timer */}
        <div className="mt-8 inline-flex items-center gap-2 border border-(--border) bg-(--bg-secondary) px-5 py-3 rounded-md">
          <span className="w-2.5 h-2.5 rounded-md bg-(--warning) animate-pulse" />

          <span className="text-sm text-(--text-secondary)">
            Redirecting to home in{" "}
            <span className="font-bold text-(--text-primary)">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </span>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={() => router.push("/")} variant="primary">
            Go Home
          </Button>

          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Open Dashboard
          </Button>
        </div>

        {/* Footer Text */}
        <p className="mt-10 text-xs text-(--text-muted)">
          If you believe this is a system issue, contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
