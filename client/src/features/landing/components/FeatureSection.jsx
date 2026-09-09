"use client";

import React from "react";

export default function FeatureSection({
  id,
  badgeText,
  badgeIcon,
  badgeColor = "text-[#00ff66]",
  title,
  subtitle,
  bullets = [],
  visual,
  reverse = false,
}) {
  return (
    <section id={id} className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background radial highlight */}
      <div
        className={`absolute top-1/2 ${reverse ? "-left-40" : "-right-40"
          } -translate-y-1/2 w-96 h-96 bg-[#00ff66]/5 rounded-full blur-3xl pointer-events-none`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${reverse ? "lg:flex-row-reverse" : ""
            }`}
        >
          {/* Text Column */}
          <div
            className={`space-y-6 ${reverse
                ? "lg:col-span-5 lg:order-2"
                : "lg:col-span-5 lg:order-1"
              }`}
          >
            {/* Badge */}
            {badgeText && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18181b] border border-[#27272a] text-xs font-mono">
                {badgeIcon && <i className={`${badgeIcon} ${badgeColor}`}></i>}
                <span className="text-zinc-300">{badgeText}</span>
              </div>
            )}

            {/* Heading */}
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {title}
            </h2>

            {/* Subtitle / Description */}
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              {subtitle}
            </p>

            {/* Bullet Points */}
            {bullets.length > 0 && (
              <ul className="space-y-3 pt-2">
                {bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300">
                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-md bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center text-[#00ff66]">
                      <i className="fa-solid fa-check text-[10px]"></i>
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Visual Mockup Column */}
          <div
            className={`${reverse
                ? "lg:col-span-7 lg:order-1"
                : "lg:col-span-7 lg:order-2"
              }`}
          >
            {visual}
          </div>
        </div>
      </div>
    </section>
  );
}
