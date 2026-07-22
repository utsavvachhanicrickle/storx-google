"use client";

import { createContext, useLayoutEffect, useState } from "react";

interface DarkModeContextType {
  darkMode: boolean;

  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,

  setDarkMode: () => {},
});

export const DarkModeContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [darkMode, setDarkMode] = useState(false);

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");

    const isDark = savedTheme !== null ? JSON.parse(savedTheme) : false;

    setDarkMode(isDark);

    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, []);

  useLayoutEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
  }, [darkMode]);

  return (
    <DarkModeContext.Provider
      value={{
        darkMode,

        setDarkMode,
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
};
