"use client";

export function GlowPanel() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-x-6 bottom-6 h-24 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(18,225,185,0.28), transparent 70%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-md rounded-[2rem] bg-[rgba(255,255,255,0.04)] border border-[#1D2B25] p-5 shadow-[0_0_0_1px_rgba(18,225,185,0.35),0_10px_40px_rgba(18,225,185,0.20)]">
        <div className="h-28 rounded-3xl bg-gradient-to-br from-[rgba(18,225,185,0.25)] to-[rgba(158,247,233,0.15)] border border-[#1D2B25]/50" />
        <div className="mt-4 flex items-center justify-between text-[#B6C2BE]">
          <span>Total Balance</span>
          <span className="font-mono text-[#E6ECEA]">$45,600</span>
        </div>
      </div>
    </div>
  );
}


