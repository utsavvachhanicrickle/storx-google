"use client";

import React, { useEffect, useRef, useState } from "react";

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
}

export default function ReCaptcha({ onVerify }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const isRenderedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const callbackName = "onRecaptchaSuccess_" + Math.random().toString(36).substring(2, 11);
    const expiredCallbackName = "onRecaptchaExpired_" + Math.random().toString(36).substring(2, 11);

    (window as any)[callbackName] = (token: string) => {
      onVerify(token);
    };

    (window as any)[expiredCallbackName] = () => {
      onVerify(null);
    };

    const initializeRecaptcha = () => {
      if (isRenderedRef.current) {
        setLoading(false);
        return;
      }
      if ((window as any).grecaptcha && (window as any).grecaptcha.render && containerRef.current) {
        try {
          containerRef.current.innerHTML = "";
          const recaptchaDiv = document.createElement("div");
          containerRef.current.appendChild(recaptchaDiv);
          (window as any).grecaptcha.render(recaptchaDiv, {
            sitekey: siteKey,
            callback: (window as any)[callbackName],
            "expired-callback": (window as any)[expiredCallbackName],
          });
          isRenderedRef.current = true;
          setLoading(false);
          setLoadError(false);
        } catch (e) {
          console.warn("grecaptcha render warning:", e);
        }
      }
    };

    // Watchdog timeout to handle script load failures (e.g. adblocker)
    const timeout = setTimeout(() => {
      if (!isRenderedRef.current) {
        setLoading(false);
        setLoadError(true);
      }
    }, 6000);

    if (document.getElementById("recaptcha-jssdk")) {
      // Script already added, just initialize
      if ((window as any).grecaptcha) {
        initializeRecaptcha();
      } else {
        // Wait for it to load
        const checkInterval = setInterval(() => {
          if ((window as any).grecaptcha) {
            clearInterval(checkInterval);
            initializeRecaptcha();
          }
        }, 100);
        setTimeout(() => clearInterval(checkInterval), 5000);
      }
    } else {
      // Add script
      const script = document.createElement("script");
      script.id = "recaptcha-jssdk";
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        const checkInterval = setInterval(() => {
          if ((window as any).grecaptcha) {
            clearInterval(checkInterval);
            initializeRecaptcha();
          }
        }, 100);
        setTimeout(() => clearInterval(checkInterval), 5000);
      };
      
      script.onerror = () => {
        setLoading(false);
        setLoadError(true);
      };
    }

    return () => {
      clearTimeout(timeout);
      delete (window as any)[callbackName];
      delete (window as any)[expiredCallbackName];
      isRenderedRef.current = false;
    };
  }, [onVerify, siteKey]);

  return (
    <div className="flex flex-col items-center justify-center my-4 min-h-[78px] text-center">
      {loading && (
        <div className="flex flex-col items-center justify-center space-y-2 select-none">
          <div className="animate-spin border-2 border-(--primary) border-t-transparent w-5 h-5 rounded-full" />
          <p className="text-[10px] text-(--text-secondary) font-bold">Loading security check...</p>
        </div>
      )}
      {loadError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-md text-[11px] font-bold max-w-[280px] leading-relaxed select-none">
          ⚠️ Security verification failed to load. Please check your connection or disable adblockers.
        </div>
      )}
      <div ref={containerRef} className={loading || loadError ? "hidden" : ""} />
    </div>
  );
}
