import React from "react";
import { toast as reactToast, ToastOptions } from "react-toastify";

interface CustomToastOptions extends ToastOptions {
  darkMode?: boolean;
}

const getToastOptions = (options: CustomToastOptions = {}): ToastOptions => {
  if (typeof window === "undefined") {
    return options;
  }
  const isDark =
    options.darkMode !== undefined
      ? options.darkMode
      : localStorage.getItem("darkMode") === "true";

  return {
    theme: isDark ? "dark" : "light",
    position: "bottom-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  };
};

const toast = {
  success: (message: React.ReactNode, options: CustomToastOptions = {}) => {
    reactToast.success(message, getToastOptions(options));
  },

  error: (message: React.ReactNode, options: CustomToastOptions = {}) => {
    reactToast.error(message, getToastOptions(options));
  },

  info: (message: React.ReactNode, options: CustomToastOptions = {}) => {
    reactToast.info(message, getToastOptions(options));
  },

  warning: (message: React.ReactNode, options: CustomToastOptions = {}) => {
    reactToast.warn(message, getToastOptions(options));
  },
};

export default toast;
