"use client";

import React, { useState, useRef, useEffect } from "react";
import RatingPopover from "./RatingPopover";

export default function PointsButton({ post, onRate }) {
  const [showPopover, setShowPopover] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Compute metrics with fallback for legacy posts
  const userScore = post.userRatingScore || (post.isLiked ? 10 : null);
  const totalPoints = post.totalPoints ?? ((post.likeCount || 0) * 10);

  const [isPopAnimating, setIsPopAnimating] = useState(false);
  const [addedPointsDelta, setAddedPointsDelta] = useState(null);
  const prevPointsRef = useRef(totalPoints);

  useEffect(() => {
    if (prevPointsRef.current !== totalPoints) {
      const diff = totalPoints - prevPointsRef.current;
      if (diff !== 0) {
        setAddedPointsDelta(diff > 0 ? `+${diff}` : `${diff}`);
        setIsPopAnimating(true);
        const timer = setTimeout(() => {
          setIsPopAnimating(false);
          setAddedPointsDelta(null);
        }, 750);
        prevPointsRef.current = totalPoints;
        return () => clearTimeout(timer);
      }
    }
  }, [totalPoints]);

  // Handle tap / click outside on mobile screens
  useEffect(() => {
    if (!showPopover) return;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowPopover(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [showPopover]);

  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setShowPopover(true);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
      timeoutRef.current = setTimeout(() => {
        setShowPopover(false);
      }, 150);
    }
  };

  const formattedPoints =
    totalPoints > 999 ? `${(totalPoints / 1000).toFixed(1)}k` : String(totalPoints);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Floating Score Delta Indicator (+8 pts! / +10 pts!) */}
      {addedPointsDelta && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-black shadow-lg animate-bounce pointer-events-none z-30 whitespace-nowrap">
          {addedPointsDelta} pts!
        </span>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowPopover((prev) => !prev);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${userScore
          ? "border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
          }`}
      >
        <i
          className={`fa-solid fa-star text-sm transition-transform duration-300 ${isPopAnimating
            ? "scale-125 rotate-12 text-amber-300"
            : userScore
              ? "text-amber-400 scale-110"
              : "text-zinc-500 hover:text-amber-400"
            }`}
        />
        <span
          className={`font-extrabold tracking-tight transition-transform duration-300 inline-block ${isPopAnimating ? "scale-125 text-amber-300" : ""
            }`}
        >
          {formattedPoints} <span className="text-[10px] font-medium opacity-70">pts</span>
        </span>
        {userScore && (
          <span
            title="Click to remove rating"
            onClick={(e) => {
              e.stopPropagation();
              onRate(userScore);
              setShowPopover(false);
            }}
            className={`ml-1 text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded-md transition-all duration-200 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 cursor-pointer ${isPopAnimating ? "scale-110" : ""
              }`}
          >
            Your: {userScore}★
          </span>
        )}
      </button>

      {/* Floating Range Popover */}
      {showPopover && (
        <RatingPopover
          userRatingScore={userScore}
          onSelectScore={(score) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            onRate(score);
            setShowPopover(false);
          }}
          onClose={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setShowPopover(false);
          }}
        />
      )}
    </div>
  );
}
