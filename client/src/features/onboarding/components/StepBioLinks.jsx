"use client";

import React from "react";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";
import { getTechIconClass } from "@/shared/lib/techIcons";

export default function StepBioLinks({
  formData,
  setFormData,
  avatarPreview,
}) {
  const social = formData.social || {
    github: "",
    linkedin: "",
    portfolio: "",
    twitter: "",
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      social: {
        ...(prev.social || {}),
        [platform]: value,
      },
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center sm:text-left">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Step 5 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2.5">
          Bio & Developer Links
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Finalize your profile with your developer links and a short bio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Bio Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              About You / Bio
            </label>
            <textarea
              rows={4}
              value={formData.bio || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Write a brief introduction... What are you currently building or learning? What problems excite you?"
              className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 resize-none"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Developer Profiles & Socials
            </label>

            {/* GitHub */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
              <i className="fa-brands fa-github text-sm text-zinc-400 w-4 text-center"></i>
              <input
                type="url"
                value={social.github || ""}
                onChange={(e) => handleSocialChange("github", e.target.value)}
                placeholder="https://github.com/yourusername"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-600 outline-none"
              />
            </div>

            {/* LinkedIn */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
              <i className="fa-brands fa-linkedin text-sm text-blue-400 w-4 text-center"></i>
              <input
                type="url"
                value={social.linkedin || ""}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-600 outline-none"
              />
            </div>

            {/* Portfolio */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
              <i className="fa-solid fa-globe text-sm text-emerald-400 w-4 text-center"></i>
              <input
                type="url"
                value={social.portfolio || ""}
                onChange={(e) => handleSocialChange("portfolio", e.target.value)}
                placeholder="https://yourportfolio.dev"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-600 outline-none"
              />
            </div>

            {/* Twitter / X */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
              <i className="fa-brands fa-x-twitter text-sm text-zinc-400 w-4 text-center"></i>
              <input
                type="url"
                value={social.twitter || ""}
                onChange={(e) => handleSocialChange("twitter", e.target.value)}
                placeholder="https://x.com/yourusername"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Live Preview Card */}
        <div className="lg:col-span-5 flex flex-col">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1.5">
            <i className="fa-regular fa-eye text-emerald-400"></i>
            Live Profile Card Preview
          </label>

          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-xl flex-1 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Avatar + Name header */}
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-1 ring-emerald-500/40 bg-zinc-900 shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : formData.profilePicture ? (
                    <img
                      src={resolveProfilePicture(formData.profilePicture)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-zinc-600 text-sm">
                      <i className="fa-solid fa-user"></i>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-zinc-100 leading-snug">
                    {formData.name || "Your Name"}
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono">
                    @{formData.username || "username"}
                  </p>
                </div>
              </div>

              {/* Headline */}
              <p className="text-xs font-semibold text-emerald-400 leading-snug mb-2">
                {formData.headline || "Your developer headline"}
              </p>

              {/* Position / Location */}
              {(formData.currentPosition || formData.location) && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 mb-3">
                  {formData.currentPosition && (
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-briefcase text-[10px]"></i>
                      {formData.currentPosition}
                    </span>
                  )}
                  {formData.location && (
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-location-dot text-[10px]"></i>
                      {formData.location}
                    </span>
                  )}
                </div>
              )}

              {/* Bio snippet */}
              {formData.bio && (
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 mb-3 border-t border-zinc-800/60 pt-2.5">
                  {formData.bio}
                </p>
              )}

              {/* Selected Tech Chips */}
              {formData.skills && formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3 pt-1">
                  {formData.skills.slice(0, 4).map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400"
                    >
                      <i className={getTechIconClass(tech)}></i>
                      {tech}
                    </span>
                  ))}
                  {formData.skills.length > 4 && (
                    <span className="text-[10px] text-zinc-500 font-semibold self-center ml-1">
                      +{formData.skills.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Social Icons Row */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-3 text-zinc-500 text-sm">
              {social.github && (
                <i className="fa-brands fa-github text-zinc-300"></i>
              )}
              {social.linkedin && (
                <i className="fa-brands fa-linkedin text-blue-400"></i>
              )}
              {social.portfolio && (
                <i className="fa-solid fa-globe text-emerald-400"></i>
              )}
              {social.twitter && (
                <i className="fa-brands fa-x-twitter text-zinc-300"></i>
              )}
              {!social.github &&
                !social.linkedin &&
                !social.portfolio &&
                !social.twitter && (
                  <span className="text-[11px] text-zinc-600 italic">
                    Add links to display them on your profile
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
