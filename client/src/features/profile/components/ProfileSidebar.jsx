import React from "react";
import { getTechIconClass } from "@/shared/lib/techIcons";
import { getNormalizedLinks, getPlatformConfig } from "@/shared/lib/socialLinks";

export default function ProfileSidebar({ profile, user }) {
  return (
    <div className="space-y-6 lg:sticky lg:top-24">

      {/* About Professional Card */}
      <section className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-4">
          <i className="fa-regular fa-address-card text-emerald-500" aria-hidden="true"></i> About
        </h3>
        <div className="space-y-4">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Current Position</span>
            <p className="text-sm font-semibold text-zinc-200 mt-0.5">{profile?.currentPosition || "Not specified"}</p>
          </div>
          {profile?.location && (
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Location</span>
              <p className="text-sm font-semibold text-zinc-200 mt-0.5">{profile.location}</p>
            </div>
          )}

          {/* Social Web Presence */}
          <div className="pt-2 border-t border-zinc-900">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Web Presence</span>
            <div className="flex flex-col gap-2 mt-2">
              {getNormalizedLinks(profile?.socialLinks).map((link, idx) => {
                const config = getPlatformConfig(link.platform);
                return (
                  <a 
                    key={idx}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    <i className={`${config.icon} text-sm`} aria-hidden="true"></i> {config.label}
                  </a>
                );
              })}
              {getNormalizedLinks(profile?.socialLinks).length === 0 && (
                <p className="text-zinc-650 text-xs italic">No social profiles linked</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Stack / Skills Card */}
      <section className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-4">
          <i className="fa-solid fa-screwdriver-wrench text-emerald-500" aria-hidden="true"></i> Skills & Stack
        </h3>
        {profile?.skills && profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-emerald-500/20 transition-colors">
                <i className={`${getTechIconClass(skill)} text-xs text-zinc-450`} aria-hidden="true"></i>
                <span className="text-xs font-medium text-zinc-350">{skill}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-xs">No stack specified yet.</p>
        )}
      </section>

      {/* Interests Card */}
      {user?.interests && user.interests.length > 0 && (
        <section className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-4">
            <i className="fa-regular fa-compass text-emerald-500" aria-hidden="true"></i> Interests
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {user.interests.map((interest, idx) => (
              <span key={idx} className="bg-zinc-950/40 text-zinc-400 border border-zinc-850 px-2.5 py-1 rounded-md text-xs font-medium capitalize">
                {interest}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Professional Experience Timeline */}
      {profile?.pastWork && profile.pastWork.length > 0 && (
        <section className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-4">
            <i className="fa-solid fa-briefcase text-emerald-500" aria-hidden="true"></i> Work Experience
          </h3>
          <div className="space-y-4">
            {profile.pastWork.map((work, idx) => (
              <div key={idx} className="border-l border-zinc-850 pl-3.5 relative py-0.5">
                <div className="absolute w-2 h-2 rounded-full bg-emerald-500 -left-1 top-1.5 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                <p className="text-xs font-bold text-zinc-200">{work.position || "Developer"}</p>
                <p className="text-[11px] text-zinc-350 mt-0.5">{work.company}</p>
                {work.years && (
                  <p className="text-[10px] text-zinc-500 mt-0.5 font-bold uppercase tracking-wider">{work.years}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
