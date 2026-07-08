"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { getAllProfiles } from "@/services/userService";
import { followUser, unfollowUser, getFollowing } from "@/services/followService";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";
import { getTechIconClass } from "@/shared/lib/techIcons";
import Loader from "@/shared/components/Loader";

function NetworkPage() {
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateSearchFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        setSearch(params.get("q") || "");
      };
      updateSearchFromUrl();
      window.addEventListener("popstate", updateSearchFromUrl);
      return () => window.removeEventListener("popstate", updateSearchFromUrl);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryInUrl = params.get("q") || "";
      if (queryInUrl !== search) {
        setSearch(queryInUrl);
      }
    }
  });

  const { data: profilesData, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => getAllProfiles().then((res) => res.data),
  });

  const { data: followingData } = useQuery({
    queryKey: ["following", currentUser?._id],
    queryFn: () => getFollowing(currentUser._id).then((res) => res.data),
    enabled: !!currentUser?._id,
  });

  const followingIds = useMemo(() => {
    return new Set(
      (followingData?.following || []).map((f) => String(f.followingId?._id || f.followingId))
    );
  }, [followingData]);

  const followMutation = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const toggleFollow = (userId) => {
    if (followingIds.has(String(userId))) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  const handleResetSearch = () => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/network");
      setSearch("");
    }
  };

  const allProfiles = profilesData?.profiles || [];

  // Filter profiles based on Navbar query
  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return allProfiles;
    return allProfiles.filter(
      (p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.username?.toLowerCase().includes(search.toLowerCase()) ||
        (p.skills || []).some((s) => s.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allProfiles, search]);

  // Recommended developers (e.g. top 3 with most followers or just first 3 excluding following)
  const recommendedDevelopers = useMemo(() => {
    return allProfiles
      .filter((p) => !followingIds.has(String(p._id)))
      .slice(0, 3);
  }, [allProfiles, followingIds]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20" style={{ background: "var(--bg)" }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10" style={{ background: "var(--bg)" }}>
      
      {/* ── Hero Section ── */}
      <section 
        className="relative rounded-3xl border border-zinc-800 p-6 md:p-8 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        style={{
          background: "linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(9, 9, 11, 0.95) 100%)",
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.7)"
        }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-emerald-500/25 via-transparent to-transparent pointer-events-none" />
        
        {/* Left Side Info */}
        <div className="flex-1 space-y-3 z-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-50 tracking-tight leading-tight">
            Network
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md">
            Discover developers building amazing products. <br className="hidden sm:inline" />
            Connect, collaborate, and learn together.
          </p>
        </div>

        {/* Right Side Illustration */}
        <div className="w-full md:w-1/2 h-40 md:h-56 shrink-0 flex items-center justify-center md:justify-end z-10 pointer-events-none">
          <img 
            src="/network.png" 
            alt="Network Nodes Collaboration" 
            className="w-auto h-full max-h-48 md:max-h-56 object-contain opacity-95 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          />
        </div>
      </section>

      {/* ── Recommended Developers Section ── */}
      {recommendedDevelopers.length > 0 && !search.trim() && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-sparkles text-emerald-500 text-xs animate-pulse"></i>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">Recommended Developers</h2>
            </div>
            <button 
              onClick={handleResetSearch}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              View All <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>

          {/* Recommended Horizontal Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedDevelopers.map((profile) => {
              const isFollowing = followingIds.has(String(profile._id));
              const isPending =
                (followMutation.isPending && String(followMutation.variables) === String(profile._id)) ||
                (unfollowMutation.isPending && String(unfollowMutation.variables) === String(profile._id));

              return (
                <div
                  key={`rec-${profile._id}`}
                  className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/20 p-5 hover:border-zinc-700/60 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <Link href={`/profile/${profile._id}`} className="space-y-3 block">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700 shrink-0 relative">
                        <img
                          src={resolveProfilePicture(profile.profilePicture)}
                          alt={profile.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950"></span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-zinc-100 text-sm truncate group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                          {profile.name}
                          <i className="fa-solid fa-circle-check text-emerald-500 text-[10px]" title="Verified profile"></i>
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
                    disabled={isPending}
                    onClick={() => toggleFollow(profile._id)}
                    className={`mt-4 w-full rounded-xl py-1.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer ${
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
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Developer Discovery Grid ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-users text-emerald-500 text-xs"></i>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">
            {search.trim() ? `Search Results for "${search}"` : "Discover Developers"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.length === 0 && (
            <div className="col-span-full text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
              <i className="fa-solid fa-user-slash text-4xl text-zinc-700 mb-4"></i>
              <h3 className="text-sm font-semibold text-zinc-400">No developers matched</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                Try searching for different names, usernames, or technology skills.
              </p>
              {search.trim() && (
                <button
                  onClick={handleResetSearch}
                  className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  Clear search filters
                </button>
              )}
            </div>
          )}

          {filteredProfiles.map((profile) => {
            const isFollowing = followingIds.has(String(profile._id));
            const isPending =
              (followMutation.isPending && String(followMutation.variables) === String(profile._id)) ||
              (unfollowMutation.isPending && String(unfollowMutation.variables) === String(profile._id));

            return (
              <div
                key={profile._id}
                className="group relative rounded-2xl border border-zinc-850 bg-zinc-900/20 p-6 hover:border-zinc-700/60 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[350px]"
              >
                {/* Developer Card Info */}
                <div className="space-y-4">
                  
                  {/* Card Header Profile Block */}
                  <div className="flex items-start gap-4">
                    {/* Large circular avatar with online status */}
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-zinc-700 shrink-0 relative">
                      <img
                        src={resolveProfilePicture(profile.profilePicture)}
                        alt={profile.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-zinc-950" title="Online indicator"></span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-extrabold text-zinc-50 text-base leading-snug truncate hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                        {profile.name}
                        <i className="fa-solid fa-circle-check text-emerald-500 text-xs" title="Verified Professional"></i>
                      </h3>
                      <p className="text-[10px] text-zinc-500">@{profile.username}</p>
                      {profile.headline && (
                        <p className="text-xs font-bold text-emerald-400 mt-1 truncate">{profile.headline}</p>
                      )}
                    </div>
                  </div>

                  {/* Bio Description (maximum 2 lines) */}
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 min-h-[32px]">
                    {profile.bio || "No biography details specified yet."}
                  </p>

                  {/* Technology Skill Badges */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {profile.skills.slice(0, 4).map((tech, idx) => (
                        <span 
                          key={idx} 
                          className="bg-zinc-950 border border-zinc-850 text-zinc-400 px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 capitalize transition-colors hover:border-emerald-500/20"
                        >
                          <i className={`${getTechIconClass(tech)} text-[9px]`}></i>
                          {tech}
                        </span>
                      ))}
                      {profile.skills.length > 4 && (
                        <span className="text-[9px] text-zinc-650 font-semibold self-center ml-1">
                          +{profile.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Statistics & Action Buttons Block */}
                <div className="pt-4 border-t border-zinc-850 mt-6 space-y-4">
                  {/* Lightweight Stats */}
                  <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    <div>Projects: <span className="text-xs font-extrabold text-zinc-200">{profile.projectsCount || 0}</span></div>
                    <div>Followers: <span className="text-xs font-extrabold text-zinc-200">{profile.followersCount || 0}</span></div>
                  </div>

                  {/* Actions (Equal Width Buttons) */}
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => toggleFollow(profile._id)}
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
          })}
        </div>
      </section>

    </div>
  );
}

export default NetworkPage;
