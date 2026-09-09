"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingNav() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-[#09090b]/90 backdrop-blur-md border-b border-[#27272a] shadow-lg"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] group-hover:border-[#00ff66]/50 transition-colors">
              <img
                src="/dev.connect.png"
                alt="dev.connect"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#00ff66] transition-colors">
                dev.connect
              </span>
              <span className="text-[10px] text-zinc-500 font-mono -mt-1 hidden sm:block">
                for developers
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a
              href="#showcase"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-code text-xs text-[#00ff66]"></i>
              Showcase
            </a>
            <a
              href="#ratings"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-star text-xs text-yellow-400"></i>
              Peer Ratings
            </a>
            <a
              href="#portfolio"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-id-card text-xs text-blue-400"></i>
              Portfolio Profile
            </a>
            <a
              href="#realtime"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-bolt text-xs text-purple-400"></i>
              Real-Time
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              onClick={() => router.push("/auth?mode=login")}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/auth?mode=signup")}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black bg-[#00ff66] hover:bg-[#00cc52] shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:shadow-[0_0_25px_rgba(0,255,102,0.5)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Join Now</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => router.push("/auth?mode=signup")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black bg-[#00ff66] cursor-pointer"
            >
              Join
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white"
            >
              <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#18181b] border-b border-[#27272a] px-4 py-5 space-y-3">
          <a
            href="#showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-white py-1"
          >
            <i className="fa-solid fa-code text-xs text-[#00ff66] mr-2"></i>
            Showcase
          </a>
          <a
            href="#ratings"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-white py-1"
          >
            <i className="fa-solid fa-star text-xs text-yellow-400 mr-2"></i>
            Peer Ratings
          </a>
          <a
            href="#portfolio"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-white py-1"
          >
            <i className="fa-solid fa-id-card text-xs text-blue-400 mr-2"></i>
            Portfolio Profile
          </a>
          <a
            href="#realtime"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-white py-1"
          >
            <i className="fa-solid fa-bolt text-xs text-purple-400 mr-2"></i>
            Real-Time
          </a>
          <div className="pt-3 border-t border-[#27272a] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                router.push("/auth?mode=login");
              }}
              className="w-full py-2.5 rounded-xl text-center text-sm font-medium text-zinc-300 bg-[#27272a] cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
