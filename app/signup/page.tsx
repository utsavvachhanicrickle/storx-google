"use client";

import React from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import StarIcon from "@mui/icons-material/Star";

const FEATURES = [
  {
    id: "e2e",
    icon: <LockOutlinedIcon className="w-5 h-5" />,
    text: "End-to-end encrypted",
  },
  {
    id: "share",
    icon: <ShareOutlinedIcon className="w-5 h-5" />,
    text: "Secure file sharing",
  },
  {
    id: "leak",
    icon: <ShieldOutlinedIcon className="w-5 h-5" />,
    text: "Protection from data leaks",
  },
  {
    id: "backup",
    icon: <CloudUploadOutlinedIcon className="w-5 h-5" />,
    text: "Automatic backup & recovery",
  },
  {
    id: "devices",
    icon: <DevicesOutlinedIcon className="w-5 h-5" />,
    text: "Access from any device, anywhere",
  },
];

export default function SignupPage() {
  const handleSocialClick = (provider: string) => {
    console.log(`${provider} clicked`);
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-main text-main transition-all duration-300">
      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between items-center px-6 py-8 sm:px-10 md:px-14 lg:px-16">
        <div />

        <div className="w-full max-w-[420px] flex flex-col items-center justify-center">
          {/* LOGO */}
          <div className="flex items-center gap-3 mb-10 group cursor-pointer">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-[#ff7b5a] to-[#ff4b2b] flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300 group-hover:rotate-6 group-hover:scale-105">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight">
              Stor
              <span className="text-primary-color">X</span>
            </h1>
          </div>

          {/* HEADING */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center leading-tight mb-3">
            Get started for Free
          </h2>

          <p className="text-secondary-color text-sm sm:text-base text-center leading-relaxed mb-10">
            Get 2 GB of encrypted storage free.
            <br />
            No credit card required.
          </p>

          {/* BUTTONS */}
          <div className="w-full flex flex-col gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => handleSocialClick("Google")}
              className="w-full h-14"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.63-1.04-1.37-1.04-2.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span className="font-semibold text-sm">
                Continue with Google
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleSocialClick("LinkedIn")}
              className="w-full h-14"
            >
              <svg
                className="w-5 h-5 shrink-0"
                viewBox="0 0 24 24"
                fill="#0077B5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>

              <span className="font-semibold text-sm">
                Continue with LinkedIn
              </span>
            </Button>
          </div>

          {/* TERMS */}
          <p className="text-[11px] text-muted-color text-center leading-relaxed mb-8">
            By continuing, you agree to StorX&apos;s{" "}
            <Link
              href="/privacy"
              className="underline hover:text-primary-color"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="underline hover:text-primary-color">
              Terms of Service
            </Link>
          </p>

          {/* SIGN IN */}
          <p className="text-sm text-secondary-color">
            Already have account?{" "}
            <Link
              href="/signin"
              className="text-primary-color font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* FOOTER */}
        <div className="text-[10px] text-muted-color text-center mt-8">
          © {new Date().getFullYear()} StorX. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex w-1/2 min-h-screen auth-right-panel border-l border-theme relative overflow-hidden">
        <div className="flex flex-col justify-center px-16 xl:px-24 max-w-[600px] gap-8">
          {/* TITLE */}
          <div>
            <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4">
              Store your data{" "}
              <span className="text-primary-color">Privately</span>
            </h2>

            <p className="text-secondary-color text-lg leading-relaxed">
              Military-grade encrypted cloud storage built for privacy-focused
              businesses.
            </p>
          </div>

          {/* FEATURES */}
          <div className="flex flex-col gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.id} className="flex items-center gap-4 group">
                <div
                  className="
                  w-11
                  h-11
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-[#fff0ed]
                  text-primary-color
                  transition-all
                  duration-300
                  group-hover:scale-110
                "
                >
                  {feature.icon}
                </div>

                <span className="text-secondary-color font-semibold">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* RATING */}
          <div className="flex flex-col items-center gap-2 pt-6">
            <span className="text-sm font-bold text-secondary-color uppercase tracking-wide">
              Excellent 4.4/5
            </span>

            <div className="flex gap-1">
              {[...Array(5)].map((_, index) => (
                <StarIcon key={index} className="text-[#00b67a]" />
              ))}
            </div>

            <span className="text-xs text-muted-color">on Trustpilot</span>
          </div>
        </div>
      </div>
    </main>
  );
}
