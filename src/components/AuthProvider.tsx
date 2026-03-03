"use client";

import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { TwoFactorPrompt } from "./TwoFactorPrompt";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <SessionProvider>
      {children}
      {!dismissed && (
        <TwoFactorPrompt 
          threshold={3}
          onDismiss={() => setDismissed(true)}
          onEnabled={() => setDismissed(true)}
        />
      )}
    </SessionProvider>
  );
}
