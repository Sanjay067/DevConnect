"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

const SCORE_LABELS = {
  1:  "Needs Work",
  2:  "Poor",
  3:  "Fair",
  4:  "Average",
  5:  "Decent",
  6:  "Good",
  7:  "Very Good",
  8:  "Great",
  9:  "Outstanding",
  10: "Excellent",
};

/**
 * RatingButton — 1–10 developer rating UI
 *
 * Props:
 *   post           — post object with { averageRating, ratingCount, userRatingScore, totalPoints }
 *   onRate(score)  — called when the user clicks a score (debounced at the hook level)
 *   isOwnPost      — optional boolean indicating if post belongs to logged-in user
 */
export default function RatingButton({ post, onRate, isOwnPost: isOwnPostProp }) {
  const currentUser = useSelector((state) => state.auth.user);
  const isOwnPost = isOwnPostProp ?? Boolean(post?.isAuthor || (currentUser?._id && post?.author?._id === currentUser?._id));

  const [showPopover, setShowPopover] = useState(false);
  const [hoveredScore, setHoveredScore] = useState(null);
  const [deltaLabel, setDeltaLabel] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const prevAvgRef = useRef(post.averageRating);

  const userScore    = post.userRatingScore ?? null;
  const avgRating    = post.averageRating   ?? 0;
  const ratingCount  = post.ratingCount     ?? 0;
  const hasRatings   = ratingCount > 0;
  const activeScore  = hoveredScore ?? userScore;

  // Animate when average changes
  useEffect(() => {
    if (prevAvgRef.current !== avgRating && prevAvgRef.current !== undefined) {
      const diff = (avgRating - prevAvgRef.current).toFixed(1);
      const sign = Number(diff) >= 0 ? "+" : "";
      setDeltaLabel(`${sign}${diff}`);
      setIsAnimating(true);
      const t = setTimeout(() => {
        setIsAnimating(false);
        setDeltaLabel(null);
      }, 900);
      prevAvgRef.current = avgRating;
      return () => clearTimeout(t);
    }
    prevAvgRef.current = avgRating;
  }, [avgRating]);

  // Close on outside click
  useEffect(() => {
    if (!showPopover) return;
    const onOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowPopover(false);
        setHoveredScore(null);
      }
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [showPopover]);

  const openPopover = () => {
    if (isOwnPost) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setShowPopover(true);
  };

  const scheduleClose = () => {
    if (isOwnPost) return;
    closeTimerRef.current = setTimeout(() => {
      setShowPopover(false);
      setHoveredScore(null);
    }, 200);
  };

  const handleSelectScore = (score) => {
    if (isOwnPost) return;
    onRate(score);
    setShowPopover(false);
    setHoveredScore(null);
  };

  const formattedAvg = hasRatings ? avgRating.toFixed(1) : "–";
  const isPointerFine = typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={isPointerFine ? openPopover : undefined}
      onMouseLeave={isPointerFine ? scheduleClose : undefined}
    >
      {/* Floating delta indicator */}
      {deltaLabel && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full
          bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-black
          shadow pointer-events-none z-30 whitespace-nowrap animate-bounce">
          {deltaLabel}
        </span>
      )}

      {/* Trigger button */}
      <button
        type="button"
        title={isOwnPost ? "Your project" : undefined}
        onClick={(e) => {
          e.stopPropagation();
          if (isOwnPost) return;
          setShowPopover((v) => !v);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold
          transition-all duration-200
          ${isOwnPost
            ? "cursor-default border-zinc-800/80 bg-zinc-950/40 text-zinc-400"
            : userScore
            ? "cursor-pointer border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
            : "cursor-pointer border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
          }`}
      >
        <i className={`fa-solid fa-star text-sm transition-transform duration-300
          ${isAnimating ? "scale-125 rotate-12 text-amber-300"
            : userScore ? "text-amber-400 scale-110"
            : "text-zinc-500 hover:text-amber-400"}`}
        />
        <span className={`font-extrabold tracking-tight transition-transform duration-300 inline-block
          ${isAnimating ? "scale-110 text-amber-300" : ""}`}>
          {formattedAvg}
          <span className="text-[10px] font-medium opacity-60 ml-0.5">/ 10</span>
        </span>
        {/* Rating count — always rendered, fades in when ratings exist */}
        <span
          className={`text-[10px] text-zinc-600 font-medium hidden sm:inline
            transition-opacity duration-200
            ${hasRatings ? "opacity-100" : "opacity-0 pointer-events-none select-none"}`}
          aria-hidden={!hasRatings}
        >
          · {ratingCount || 0}
        </span>

        {/* You badge — always rendered, fades in when user has rated */}
        <span
          className={`ml-0.5 text-[10px] font-extrabold bg-amber-400/20 text-amber-300
            border border-amber-400/30 px-1.5 py-0.5 rounded-md
            transition-all duration-200 whitespace-nowrap
            ${userScore
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none select-none"}`}
          aria-hidden={!userScore}
        >
          You: {userScore ?? "–"}★
        </span>
      </button>

      {/* Score Popover */}
      {showPopover && (
        <div
          className="absolute bottom-full mb-2 left-0 z-50
            bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3
            min-w-[220px]"
          onMouseEnter={isPointerFine ? openPopover : undefined}
          onMouseLeave={isPointerFine ? scheduleClose : undefined}
        >
          {/* Label */}
          <p className="text-[11px] text-zinc-500 font-semibold mb-2 text-center tracking-wide uppercase">
            {hoveredScore
              ? <><span className="text-amber-300">{hoveredScore}</span> — {SCORE_LABELS[hoveredScore]}</>
              : userScore
              ? <><span className="text-amber-300">{userScore}</span> — {SCORE_LABELS[userScore]} (click to remove)</>
              : "Rate this project"}
          </p>

          {/* Score grid — two rows: 1–5 and 6–10 */}
          <div className="flex flex-col gap-1">
            {[[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]].map((row, ri) => (
              <div key={ri} className="flex gap-1 justify-center">
                {row.map((num) => {
                  const isSelected = num === userScore;
                  const isHovered  = num === hoveredScore;
                  const isActive   = num === activeScore;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSelectScore(num)}
                      onMouseEnter={() => setHoveredScore(num)}
                      onMouseLeave={() => setHoveredScore(null)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all duration-150 cursor-pointer
                        ${isSelected
                          ? "bg-amber-500 text-zinc-900 shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-110"
                          : isActive
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 scale-105"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
                        }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Current average */}
          {hasRatings && (
            <p className="text-center text-[11px] text-zinc-600 mt-2 font-medium">
              <span className="text-amber-400 font-bold">{avgRating.toFixed(1)}</span>
              {" "}avg · {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
