"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { setUserRole } from "@/lib/actions/user";
import { toast } from "sonner";

export default function OnboardingClient() {
  const router = useRouter();
  const { session } = useClerk();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<"CUSTOMER" | "HOST" | null>(null);

  function handleContinue() {
    if (!selected) return;
    startTransition(async () => {
      const result = await setUserRole(selected);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      // Reload the Clerk session so the JWT picks up the new publicMetadata.role.
      // Without this, middleware still sees role=null and redirects back to onboarding.
      await session?.reload();
      router.push(selected === "HOST" ? "/host/dashboard" : "/dashboard");
    });
  }

  return (
    <div
      className="relative h-screen overflow-hidden text-white font-sans flex flex-col items-center justify-center px-6 selection:bg-[#FF4D00] selection:text-white"
      style={{ background: "#051424" }}
    >
      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(255,77,0,0.1), transparent), radial-gradient(circle at bottom left, rgba(1,15,31,1), #051424)",
        }}
      />

      {/* Light leaks */}
      <div className="onboarding-light-leak -top-[100px] -left-[100px]" />
      <div className="onboarding-light-leak -bottom-[100px] -right-[100px]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <main className="relative z-10 flex flex-col items-center w-full">

        {/* Header */}
        <header className="text-center mb-16 onboarding-fade-in">
          <div className="mb-4 inline-flex items-center justify-center">
            <img src="/logo.png" alt="Erlebnisly" className="h-24 w-auto" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Welcome to Erlebnisly</h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto font-light">
            How will you use Erlebnisly today?
          </p>
        </header>

        {/* Selection cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl onboarding-fade-in onboarding-delay-1">

          {/* Explore */}
          <button
            className={`onboarding-glass-card p-10 rounded-ds text-left group flex flex-col h-full focus:outline-none${selected === "CUSTOMER" ? " selected" : ""}`}
            onClick={() => setSelected("CUSTOMER")}
          >
            <div className="mb-8 w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <svg className="w-7 h-7 text-white/70 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3">I want to explore</h3>
            <p className="text-slate-400 leading-relaxed font-light">
              Browse and book unique experiences, from urban adventures to creative workshops.
            </p>
            <div className="mt-auto pt-8 flex items-center text-xs font-bold tracking-widest text-slate-500 group-hover:text-[#FF4D00] transition-colors">
              DISCOVER EXPERIENCES
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </button>

          {/* Host */}
          <button
            className={`onboarding-glass-card p-10 rounded-ds text-left group flex flex-col h-full focus:outline-none${selected === "HOST" ? " selected" : ""}`}
            onClick={() => setSelected("HOST")}
          >
            <div className="mb-8 w-14 h-14 rounded-full bg-[#FF4D00]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <svg className="w-7 h-7 text-[#FF4D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3">I want to host</h3>
            <p className="text-slate-400 leading-relaxed font-light">
              Create and sell your own experiences. Access host analytics, booking management, and payouts.
            </p>
            <div className="mt-auto pt-8 flex items-center text-xs font-bold tracking-widest text-slate-500 group-hover:text-[#FF4D00] transition-colors">
              HOST DASHBOARD
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </button>
        </div>

        {/* Continue button */}
        <div className="mt-12 w-full max-w-4xl flex justify-center onboarding-fade-in onboarding-delay-2">
          <button
            className={`w-full md:w-auto px-12 py-4 font-bold rounded-ds transition-all duration-300 uppercase tracking-widest text-sm shadow-lg ${
              !selected || isPending
                ? "bg-[#FF4D00]/50 text-white opacity-50 cursor-not-allowed"
                : "bg-[#FF4D00] text-white hover:shadow-[0_0_20px_rgba(255,77,0,0.4)] active:scale-[0.98]"
            }`}
            disabled={!selected || isPending}
            onClick={handleContinue}
          >
            {isPending ? "Setting up your account…" : "Continue"}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 text-slate-500 text-xs tracking-wide onboarding-fade-in onboarding-delay-2">
        © 2025 Erlebnisly. All rights reserved.
      </footer>
    </div>
  );
}
