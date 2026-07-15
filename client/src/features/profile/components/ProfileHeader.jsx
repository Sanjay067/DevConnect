import React from "react";
import Link from "next/link";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";
import { getNormalizedLinks } from "@/shared/lib/socialLinks";

export default function ProfileHeader({
  profile,
  user,
  posts,
  isOwnProfile,
  isFollowing,
  isBannerPending,
  onToggleFollow,
  onEditClick,
  onUploadBanner,
}) {
  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadBanner(file);
    }
  };

  const websiteLink = getNormalizedLinks(profile?.socialLinks).find(
    (l) => l.platform === "portfolio" || l.platform === "custom"
  ) || getNormalizedLinks(profile?.socialLinks)[0];

  return (
    <div className="bg-zinc-950/50 rounded-2xl border border-zinc-800/80 shadow-xl overflow-hidden mb-8 backdrop-blur-sm">
      {/* Cover Banner */}
      <div className="h-28 sm:h-36 md:h-48 w-full relative group/banner border-b border-zinc-800 bg-zinc-950 overflow-hidden">
        {profile?.bannerPicture ? (
          <img src={profile.bannerPicture} alt="Profile Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/50 via-zinc-900 to-zinc-950">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent"></div>
          </div>
        )}
        
        {/* Change Banner overlay for owner */}
        {isOwnProfile && (
          <label className="absolute right-4 bottom-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 cursor-pointer transition-all border border-zinc-800 opacity-0 group-hover/banner:opacity-100 backdrop-blur-sm shadow-md">
            <i className="fa-solid fa-camera" aria-hidden="true"></i>
            {isBannerPending ? "Uploading..." : "Change Banner"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
              disabled={isBannerPending}
            />
          </label>
        )}
      </div>

      {/* Profile Identity and Bio */}
      <div className="relative z-10 px-4 sm:px-6 pb-6">

        {/* Avatar floats over banner; buttons sit beside it on mobile */}
        <div className="flex items-end justify-between -mt-12 sm:-mt-16 mb-4">
          {/* Avatar */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-zinc-950 bg-zinc-800 overflow-hidden shadow-2xl shrink-0">
            {user?.profilePicture ? (
              <img src={resolveProfilePicture(user.profilePicture)} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800" />
            )}
          </div>

          {/* Action Buttons — right of avatar */}
          <div className="flex items-center gap-2 pb-1">
            {isOwnProfile ? (
              <button
                type="button"
                onClick={onEditClick}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 border border-zinc-700/50 shadow-md cursor-pointer"
              >
                <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onToggleFollow}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                    isFollowing 
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                  }`}
                >
                  {isFollowing ? (
                    <><i className="fa-solid fa-user-check mr-1" aria-hidden="true"></i>Following</>
                  ) : (
                    <><i className="fa-solid fa-plus mr-1" aria-hidden="true"></i>Follow</>
                  )}
                </button>
                <Link 
                  href={`/messages?peer=${user?._id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <i className="fa-regular fa-comment-dots" aria-hidden="true"></i>
                  <span className="hidden sm:inline">Message</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Meta and Description Info */}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs text-zinc-500 font-semibold mt-0.5">@{user?.username}</p>
          <p className="text-sm font-bold text-emerald-400 mt-1.5">{profile?.headline || "Developer"}</p>
          
          {/* Short Bio Block */}
          {profile?.bio && (
            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl mt-3 whitespace-pre-wrap select-text">
              {profile.bio}
            </p>
          )}

          {/* Location / Meta row */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-zinc-500 font-semibold">
            {profile?.location && (
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-location-dot text-zinc-650" aria-hidden="true"></i> {profile.location}
              </span>
            )}
            {websiteLink && (
              <a href={websiteLink.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                <i className="fa-solid fa-globe text-zinc-650" aria-hidden="true"></i> Website
              </a>
            )}
          </div>

          {/* Stats — flex with equal spacing, no overflow */}
          <div className="flex items-center mt-5 pt-4 border-t border-zinc-900">
            <div className="flex-1 text-center">
              <div className="text-sm font-extrabold text-zinc-100">{posts?.length || 0}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">Projects</div>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="flex-1 text-center">
              <div className="text-sm font-extrabold text-zinc-100">{profile?.followersCount || 0}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">Followers</div>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="flex-1 text-center">
              <div className="text-sm font-extrabold text-zinc-100">{profile?.followingCount || 0}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">Following</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
