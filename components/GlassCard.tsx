"use client";

import type { ReactNode } from "react";

export default function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-3xl bg-[rgba(255,255,255,0.04)] backdrop-blur-[2px] border border-[#1D2B25] shadow-[0_8px_30px_rgba(0,0,0,0.45)] overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)" }}
      />
      {children}
    </div>
  );
}


