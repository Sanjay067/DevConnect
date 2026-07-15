import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";
import { getTechIconClass } from "@/shared/lib/techIcons";

const MAX_SKILLS = 4;

export default function DeveloperCard({ profile, isFollowing, onToggleFollow, isPending }) {
  const router = useRouter();
  const isNewbie = !profile.bio && (!profile.skills || profile.skills.length === 0) && (profile.projectsCount || 0) === 0;

  const handleCardClick = (e) => {
    if (e.target.closest("button") || e.target.closest("a")) {
      return;
    }
    router.push(`/profile/${profile._id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative rounded-2xl border border-zinc-855 bg-zinc-900/20 p-6 hover:border-zinc-700/60 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[350px] cursor-pointer"
    >
      <div className="space-y-4">
        
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-zinc-700 shrink-0 relative">
            <Image
              src={resolveProfilePicture(profile.profilePicture)}
              alt={profile.name || "Developer"}
              width={56}
              height={56}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              loading="lazy"
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-extrabold text-zinc-50 text-base leading-snug truncate hover:text-emerald-400 transition-colors">
              {profile.name}
            </h3>
            <p className="text-[10px] text-zinc-500">@{profile.username}</p>
            {profile.headline && (
              <p className="text-xs font-bold text-emerald-400 mt-1 truncate">{profile.headline}</p>
            )}
          </div>
        </div>

        {isNewbie ? (
          <div className="flex flex-col items-center justify-center py-4 px-2 border border-zinc-850 rounded-xl bg-zinc-950/40 text-center my-2 select-none min-h-[90px]">
            <i className="fa-solid fa-seedling text-[#00ff66] text-base mb-1 animate-bounce" style={{ animationDuration: '3s' }} aria-hidden="true"></i>
            <span className="text-[9px] font-extrabold text-[#00ff66]/90 uppercase tracking-widest">Fresh Talent</span>
            <p className="text-[9px] text-zinc-500 mt-1 max-w-[180px]">
              New developer ready to collaborate on devConnect.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 min-h-[32px]">
              {profile.bio || "No biography details specified yet."}
            </p>

            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.skills.slice(0, MAX_SKILLS).map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="bg-zinc-950 border border-zinc-850 text-zinc-400 px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 capitalize transition-colors hover:border-emerald-500/20"
                  >
                    <i className={`${getTechIconClass(tech)} text-[9px]`} aria-hidden="true"></i>
                    {tech}
                  </span>
                ))}
                {profile.skills.length > MAX_SKILLS && (
                  <span className="text-[9px] text-zinc-650 font-semibold self-center ml-1">
                    +{profile.skills.length - MAX_SKILLS} more
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="pt-4 border-t border-zinc-850 mt-6 space-y-4">
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          <div>Projects: <span className="text-xs font-extrabold text-zinc-200">{profile.projectsCount || 0}</span></div>
          <div>Followers: <span className="text-xs font-extrabold text-zinc-200">{profile.followersCount || 0}</span></div>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            disabled={isPending}
            onClick={() => onToggleFollow(profile._id)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer ${
              isFollowing
                ? "border border-zinc-750 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            }`}
          >
            {isPending ? (
              <i className="fa-solid fa-circle-notch fa-spin text-xs" />
            ) : isFollowing ? (
              "Following"
            ) : (
              "Follow"
            )}
          </button>
          <Link
            href={`/profile/${profile._id}`}
            className="flex-1 text-center border border-zinc-850 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850 rounded-xl py-2 text-xs font-bold transition-all shadow-sm"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
