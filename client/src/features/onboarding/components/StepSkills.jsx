"use client";

import React, { useState } from "react";
import { getTechIconClass } from "@/shared/lib/techIcons";

const SUGGESTED_SKILL_CATEGORIES = [
  {
    category: "Languages",
    skills: ["JavaScript", "TypeScript", "Python", "Go", "Rust", "Java", "C++", "HTML5", "CSS3"],
  },
  {
    category: "Frontend & UI",
    skills: ["React", "Next.js", "Vue", "Angular", "TailwindCSS", "Redux", "Sass"],
  },
  {
    category: "Backend & Systems",
    skills: ["Node.js", "Express", "Django", "FastAPI", "GraphQL", "REST APIs"],
  },
  {
    category: "Databases",
    skills: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase"],
  },
  {
    category: "DevOps & Cloud",
    skills: ["Docker", "AWS", "Git", "Kubernetes", "Linux", "Cloudinary"],
  },
];

export default function StepSkills({ formData, setFormData }) {
  const [customInput, setCustomInput] = useState("");
  const selectedSkills = formData.skills || [];

  const toggleSkill = (skill) => {
    const exists = selectedSkills.some(
      (s) => s.toLowerCase() === skill.toLowerCase()
    );
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        skills: prev.skills.filter(
          (s) => s.toLowerCase() !== skill.toLowerCase()
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skill],
      }));
    }
  };

  const handleAddCustom = (e) => {
    e?.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;
    const exists = selectedSkills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), trimmed],
      }));
    }
    setCustomInput("");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center sm:text-left">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Step 2 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2.5">
          What is in your tech stack?
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Select technologies you work with. This helps match you with relevant projects and collaborators.
        </p>
      </div>

      {/* Selected Stack Showcase Bar */}
      <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/60">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <i className="fa-solid fa-layer-group text-emerald-400 text-xs"></i>
            Selected Technologies ({selectedSkills.length})
          </span>
          {selectedSkills.length > 0 && (
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, skills: [] }))}
              className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {selectedSkills.length === 0 ? (
          <p className="text-xs text-zinc-600 italic py-2">
            No technologies selected yet. Click pills below or type custom tools to add.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedSkills.map((skill, idx) => {
              const iconClass = getTechIconClass(skill);
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm animate-in zoom-in-95 duration-150"
                >
                  {iconClass && <i className={`${iconClass} text-xs`}></i>}
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="hover:text-emerald-100 text-emerald-400/70 ml-1 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <i className="fa-solid fa-xmark text-[11px]"></i>
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom skill adder */}
      <form onSubmit={handleAddCustom} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
          <i className="fa-solid fa-plus text-xs text-zinc-500"></i>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Add custom tech or tool (e.g. Solidity, Flutter, Prisma)..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!customInput.trim()}
          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-bold text-zinc-200 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          Add
        </button>
      </form>

      {/* Categorized Pills */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
        {SUGGESTED_SKILL_CATEGORIES.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              {cat.category}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {cat.skills.map((skill, sIdx) => {
                const isSelected = selectedSkills.some(
                  (s) => s.toLowerCase() === skill.toLowerCase()
                );
                const iconClass = getTechIconClass(skill);

                return (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                        : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-850"
                    }`}
                  >
                    {iconClass && <i className={`${iconClass} text-xs`}></i>}
                    <span>{skill}</span>
                    {isSelected && (
                      <i className="fa-solid fa-check text-[10px] text-emerald-400 ml-0.5"></i>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
