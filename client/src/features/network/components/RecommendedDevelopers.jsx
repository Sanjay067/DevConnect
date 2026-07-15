import React from "react";
import Link from "next/link";
import Image from "next/image";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";

const MAX_RECOMMENDED = 3;

export default function RecommendedDevelopers({ 
  profiles, 
  followingIds, 
  onToggleFollow, 
  activePendingId, 
  isPending,
  onResetSearch 
}) {
  const recommended = React.useMemo(() => {
    return profiles
      .filter((p) => !followingIds.has(String(p._id)))
      .slice(0, MAX_RECOMMENDED);
  }, [profiles, followingIds]);

  if (recommended.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-sparkles text-emerald-500 text-xs animate-pulse" aria-hidden="true"></i>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">Recommended Developers</h2>
        </div>
        <button 
          onClick={onResetSearch}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          View All <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommended.map((profile) => {
          const isFollowing = followingIds.has(String(profile._id));
          const cardPending = isPending && String(activePendingId) === String(profile._id);

          return (
            <div
              key={`rec-${profile._id}`}
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/20 p-5 hover:border-zinc-700/60 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
            >
              <Link href={`/profile/${profile._id}`} className="space-y-3 block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700 shrink-0 relative">
                    <Image
                      src={resolveProfilePicture(profile.profilePicture)}
                      alt={profile.name || "Developer"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-zinc-100 text-sm truncate group-hover:text-emerald-400 transition-colors">
                      {profile.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 truncate">@{profile.username}</p>
                  </div>
                </div>
                {profile.headline && (
                  <p className="text-[11px] font-bold text-emerald-400 truncate">{profile.headline}</p>
                )}
              </Link>

              <button
                type="button"
                disabled={cardPending}
                onClick={() => onToggleFollow(profile._id)}
                className={`mt-4 w-full rounded-xl py-1.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer ${
                  isFollowing
                    ? "border border-zinc-750 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                }`}
              >
                {cardPending ? (
                  <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                ) : isFollowing ? (
                  "Following"
                ) : (
                  "Follow"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
