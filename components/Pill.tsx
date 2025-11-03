"use client";

export function Pill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "border-[#12E1B9]/40 bg-[#12E1B9]/10 text-[#E6ECEA]"
          : "border-[#1D2B25] text-[#B6C2BE] hover:text-[#E6ECEA]"
      }`}
    >
      {label}
    </button>
  );
}


