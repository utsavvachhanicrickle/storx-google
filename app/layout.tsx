import React from "react";
import "./global.css";
import "./cyber.css";
import { DarkModeContextProvider } from "@/context/darkModeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Providers from "@/store/provider";
import "react-toastify/dist/ReactToastify.css";
import PublicLayoutWrapper from "@/components/layout/PublicLayoutWrapper";

export const metadata = {
  title: "CyberLS — India's Own Google Workspace Backup",
  icons: {
    icon: "/assets/favicon/favicon.svg",
  },
  description:
    "Backup every email, file, shared drive, and user with CyberLS—India's first decentralized Google Workspace backup solution. Keep your critical data safe, private, and under your control.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Inter:wght@100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Montserrat:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-(--bg) text-(--text-primary) transition-colors duration-300">
        <DarkModeContextProvider>
          <Providers>
            <GoogleOAuthProvider
              clientId={process.env.GOOGLE_CLIENT_ID as string}
            >
              <PublicLayoutWrapper>
                {children}
              </PublicLayoutWrapper>
            </GoogleOAuthProvider>
          </Providers>
        </DarkModeContextProvider>
      </body>
    </html>
  );
}
