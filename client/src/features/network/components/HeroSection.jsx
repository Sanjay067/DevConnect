import React from "react";

export default function HeroSection() {
  return (
    <section
      className="relative rounded-3xl border border-zinc-800/80 p-6 md:p-10 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 min-h-[200px] md:min-h-[240px] shadow-2xl"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          src="/network-banner.png"
          alt="Network Banner"
          className="w-full h-full object-cover object-right"
        />
        {/* Dark overlay gradient on the left to ensure crisp text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 sm:via-zinc-950/60 to-transparent" />
      </div>

      {/* Hero Text */}
      <div className="flex-1 space-y-3.5 z-10 text-center md:text-left relative">
        <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-50 tracking-tight leading-tight drop-shadow-md">
          Network
        </h1>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-md drop-shadow-sm font-medium">
          Discover developers building amazing products. <br className="hidden sm:inline" />
          Connect, collaborate, and learn together.
        </p>
      </div>
    </section>
  );
}
