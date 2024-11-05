"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check for authentication errors
    const error = new URLSearchParams(window.location.search).get("error");
    if (error) {
      console.error("Authentication error:", error);
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
