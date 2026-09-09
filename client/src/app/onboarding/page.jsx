"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import OnboardingFlow from "@/features/onboarding/components/OnboardingFlow";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isCheckingAuth } = useSelector((state) => state.auth);
  const [initialCheckDone, setInitialCheckDone] = React.useState(false);

  useEffect(() => {
    if (!isCheckingAuth) {
      setInitialCheckDone(true);
      if (!user) {
        router.push("/auth?mode=login");
      }
    }
  }, [user, isCheckingAuth, router]);

  if (!initialCheckDone && isCheckingAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-circle-notch fa-spin text-2xl text-emerald-400"></i>
          <p className="text-xs text-zinc-500 font-mono">Setting up developer workspace...</p>
        </div>
      </div>
    );
  }

  return <OnboardingFlow />;
}
