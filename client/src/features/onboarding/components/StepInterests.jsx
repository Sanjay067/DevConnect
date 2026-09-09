"use client";

import React from "react";

const INTEREST_OPTIONS = [
  {
    id: "Open Source",
    title: "Open Source & Tooling",
    desc: "Building, contributing to, and maintaining public repos",
    icon: "fa-brands fa-github",
    color: "emerald",
  },
  {
    id: "AI & ML",
    title: "AI & Machine Learning",
    desc: "LLMs, computer vision, PyTorch, LangChain, neural nets",
    icon: "fa-solid fa-brain",
    color: "purple",
  },
  {
    id: "Full Stack Web",
    title: "Full-Stack Web Apps",
    desc: "Modern web experiences, Next.js, APIs, distributed systems",
    icon: "fa-solid fa-globe",
    color: "blue",
  },
  {
    id: "Cloud & DevOps",
    title: "Cloud & DevOps",
    desc: "Docker, Kubernetes, CI/CD, AWS, Terraform, scaling",
    icon: "fa-solid fa-cloud",
    color: "amber",
  },
  {
    id: "Mobile Apps",
    title: "Mobile App Development",
    desc: "Cross-platform and native iOS & Android applications",
    icon: "fa-solid fa-mobile-screen",
    color: "teal",
  },
  {
    id: "System Design",
    title: "System Design & Architecture",
    desc: "High concurrency, microservices, databases & caching",
    icon: "fa-solid fa-diagram-project",
    color: "indigo",
  },
  {
    id: "UI/UX & Design",
    title: "UI/UX & Design Systems",
    desc: "Design tokens, accessible interfaces, micro-interactions",
    icon: "fa-solid fa-wand-magic-sparkles",
    color: "pink",
  },
  {
    id: "Web3 & Crypto",
    title: "Web3 & Blockchain",
    desc: "Smart contracts, dApps, Solidity, decentralized protocols",
    icon: "fa-brands fa-ethereum",
    color: "yellow",
  },
  {
    id: "Cybersecurity",
    title: "Cybersecurity & InfoSec",
    desc: "App security, penetration testing, cryptography, audits",
    icon: "fa-solid fa-shield-halved",
    color: "red",
  },
];

export default function StepInterests({ formData, setFormData }) {
  const selectedInterests = formData.interests || [];

  const toggleInterest = (id) => {
    const exists = selectedInterests.includes(id);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        interests: prev.interests.filter((item) => item !== id),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        interests: [...(prev.interests || []), id],
      }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center sm:text-left">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Step 3 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2.5">
          What domains inspire you?
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Pick your engineering interests so we can personalize your discover feed and project discussions.
        </p>
      </div>

      {/* Grid of Interest Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto pr-1">
        {INTEREST_OPTIONS.map((item) => {
          const isSelected = selectedInterests.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => toggleInterest(item.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? "bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_16px_rgba(16,185,129,0.12)] -translate-y-0.5"
                  : "bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm border ${
                    isSelected
                      ? "bg-emerald-500 text-black border-emerald-400"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800"
                  }`}
                >
                  <i className={item.icon}></i>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-emerald-500 border-emerald-400 text-black"
                      : "border-zinc-700 bg-zinc-900"
                  }`}
                >
                  {isSelected && <i className="fa-solid fa-check text-[10px]"></i>}
                </div>
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-bold text-zinc-100">{item.title}</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Open for Collaboration Callout */}
      <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <i className="fa-solid fa-handshake text-base"></i>
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-200">
              Open to Peer Collaboration
            </h4>
            <p className="text-[11px] text-zinc-500">
              Signal to fellow developers that you&apos;re open to building together.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              openForCollabs: !prev.openForCollabs,
            }))
          }
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
            formData.openForCollabs
              ? "bg-emerald-500 text-black border-emerald-400"
              : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-zinc-200"
          }`}
        >
          {formData.openForCollabs ? "Active ✓" : "Enable"}
        </button>
      </div>
    </div>
  );
}
