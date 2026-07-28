"use client";

import React, { useState } from "react";

const getTierDetails = (score) => {
  if (!score) return { label: "Rate this project", color: "text-zinc-400 font-medium" };
  switch (score) {
    case 1:
      return { label: "1/10 • Needs Major Work", color: "text-amber-400 font-bold" };
    case 2:
      return { label: "2/10 • Early Prototype", color: "text-amber-400 font-bold" };
    case 3:
      return { label: "3/10 • Fair Attempt", color: "text-amber-400 font-bold" };
    case 4:
      return { label: "4/10 • Beginner Work", color: "text-sky-400 font-bold" };
    case 5:
      return { label: "5/10 • Solid Effort", color: "text-sky-400 font-bold" };
    case 6:
      return { label: "6/10 • Good Work!", color: "text-sky-400 font-bold" };
    case 7:
      return { label: "7/10 • Great Quality!", color: "text-emerald-400 font-bold" };
    case 8:
      return { label: "8/10 • Impressive Work!", color: "text-emerald-400 font-bold" };
    case 9:
      return { label: "9/10 •  Outstanding!", color: "text-emerald-400 font-bold" };
    case 10:
      return { label: "10/10 • Excellent work! ⭐", color: "text-amber-300 font-extrabold" };
    default:
      return { label: "Rate this project", color: "text-zinc-400 font-medium" };
  }
};

export default function RatingPopover({ userRatingScore, onSelectScore, onClose }) {
  const [hoveredScore, setHoveredScore] = useState(null);
  const activeScore = hoveredScore || userRatingScore;
  const tier = getTierDetails(activeScore);

  return (
    <div
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={() => {
        if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
          onClose();
        }
      }}
      className="absolute bottom-full pb-2.5 left-0 sm:left-1/2 sm:-translate-x-1/2 z-50 w-[275px] sm:w-72 select-none cursor-default"
    >
      <div
        className="w-full bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-2.5 flex flex-col items-center backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150"
        style={{ boxShadow: "0 12px 32px rgba(0, 0, 0, 0.85)" }}
      >
        {/* Dynamic Unique Message Header */}
        <div className="w-full text-center py-1 px-2 mb-2 bg-zinc-900/90 rounded-xl border border-zinc-800/80 flex items-center justify-center gap-1.5 min-h-[28px]">
          <i className="fa-solid fa-star text-amber-400 text-xs" />
          <span className={`text-[11px] truncate ${tier.color}`}>{tier.label}</span>
        </div>

        {/* 1 - 10 Score Range Buttons */}
        <div className="flex items-center justify-between w-full gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isSelected = userRatingScore === num;
            const isHovered = hoveredScore === num;
            const isTierAmber = num <= 3;
            const isTierSky = num > 3 && num <= 6;
            const isTierEmerald = num > 6 && num <= 9;
            const isTierGold = num === 10;

            let btnClass = "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:scale-110";
            if (isSelected || isHovered) {
              if (isTierAmber) btnClass = "bg-amber-500/20 text-amber-400 border-amber-500/50 scale-110";
              else if (isTierSky) btnClass = "bg-sky-500/20 text-sky-400 border-sky-500/50 scale-110";
              else if (isTierEmerald) btnClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 scale-110";
              else if (isTierGold) btnClass = "bg-amber-400/25 text-amber-300 border-amber-400/60 scale-110 font-black shadow-[0_0_12px_rgba(251,191,36,0.3)]";
            }

            return (
              <button
                key={num}
                type="button"
                onMouseEnter={() => setHoveredScore(num)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectScore(num);
                }}
                className={`w-6 h-7 rounded-lg border text-[11px] font-bold flex items-center justify-center transition-all duration-150 cursor-pointer ${btnClass}`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
