"use client";

import React, { useRef } from "react";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";

const HEADLINE_PRESETS = [
  "🚀 Full-Stack Developer",
  "⚡ Frontend Engineer & UI Designer",
  "🛠️ Backend & Distributed Systems",
  "🤖 AI / Machine Learning Engineer",
  "🎓 CS Student & Open-Source Builder",
  "📱 Mobile App Developer (React Native / Flutter)",
  "☁️ Cloud & DevOps Enthusiast",
];

export default function StepIdentity({
  formData,
  setFormData,
  avatarPreview,
  setAvatarPreview,
  setAvatarFile,
}) {
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image must be smaller than 3MB");
        return;
      }
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center sm:text-left">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Step 1 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2.5">
          Let&apos;s setup your developer identity
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Tell other builders who you are and what role you specialize in.
        </p>
      </div>

      {/* Avatar Row */}
      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/40">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-emerald-500/30 bg-zinc-900 flex items-center justify-center shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : formData.profilePicture ? (
              <img
                src={resolveProfilePicture(formData.profilePicture)}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-zinc-600">
                <i className="fa-solid fa-user text-2xl"></i>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
            title="Upload photo"
          >
            <i className="fa-solid fa-camera text-xs"></i>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <div className="text-center sm:text-left space-y-1.5 flex-1">
          <p className="text-sm font-semibold text-zinc-200">Profile Photo</p>
          <p className="text-xs text-zinc-500">
            Upload a clear avatar or photo. JPG, PNG or WEBP up to 5MB.
          </p>
          <div className="flex gap-2 justify-center sm:justify-start pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium transition-colors cursor-pointer"
            >
              Upload New
            </button>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-red-950/40 text-red-400 hover:bg-red-950/20 font-medium transition-colors cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Name and Username */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Full Name <span className="text-emerald-400">*</span>
          </label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
            <i className="fa-solid fa-user text-xs text-zinc-500"></i>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. Alex Rivera"
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Username <span className="text-emerald-400">*</span>
          </label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
            <i className="fa-solid fa-at text-xs text-zinc-500"></i>
            <input
              type="text"
              required
              value={formData.username || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  username: e.target.value.toLowerCase().replace(/\s+/g, ""),
                }))
              }
              placeholder="username"
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Headline with quick presets */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Professional Headline <span className="text-emerald-400">*</span>
          </label>
          <span className="text-[11px] text-zinc-500">
            {formData.headline?.length || 0}/90
          </span>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
          <i className="fa-solid fa-bolt text-xs text-emerald-400"></i>
          <input
            type="text"
            maxLength={90}
            required
            value={formData.headline || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, headline: e.target.value }))
            }
            placeholder="e.g. Full-Stack Engineer | Building scalable cloud applications"
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
          />
        </div>

        {/* Presets */}
        <div className="mt-2.5">
          <p className="text-[11px] text-zinc-500 mb-1.5 font-medium">
            Suggested headlines (click to apply):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {HEADLINE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, headline: preset }))
                }
                className="text-[11px] px-2.5 py-1 rounded-lg border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 transition-all cursor-pointer font-medium"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role and Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Current Position / Affiliation
          </label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
            <i className="fa-solid fa-briefcase text-xs text-zinc-500"></i>
            <input
              type="text"
              value={formData.currentPosition || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentPosition: e.target.value,
                }))
              }
              placeholder="e.g. Software Engineer @ Stripe or CS Student"
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Location
          </label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
            <i className="fa-solid fa-location-dot text-xs text-zinc-500"></i>
            <input
              type="text"
              value={formData.location || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="e.g. San Francisco, CA or Remote"
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
