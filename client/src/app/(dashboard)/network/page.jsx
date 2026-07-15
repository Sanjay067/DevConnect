"use client";

import React, { useMemo, Suspense, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";

import { getFollowing } from "@/services/followService";
import { useProfiles } from "@/features/network/hooks/useProfiles";
import { useFollow } from "@/features/network/hooks/useFollow";

import HeroSection from "@/features/network/components/HeroSection";
import RecommendedDevelopers from "@/features/network/components/RecommendedDevelopers";
import DeveloperGrid from "@/features/network/components/DeveloperGrid";
import NetworkSkeleton from "@/features/network/components/NetworkSkeleton";

// Simple debounce hook to avoid hammering the backend on search keystrokes
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function NetworkPageContent() {
  const currentUser = useSelector((state) => state.auth.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";
  const debouncedSearch = useDebounce(search, 300);

  // 1. Fetch Infinite Profiles list matching debounced search from server
  const { 
    data: profilesData, 
    isLoading, 
    hasNextPage, 
    fetchNextPage, 
    isFetchingNextPage 
  } = useProfiles(debouncedSearch);

  // 2. Fetch current user following relationships
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

  // 3. Follow mutations hook with optimistic updates
  const followState = useFollow(currentUser);

  const toggleFollow = (userId) => {
    if (followingIds.has(String(userId))) {
      followState.unfollow(userId);
    } else {
      followState.follow(userId);
    }
  };

  const handleResetSearch = () => {
    router.replace("/network");
  };

  const profiles = useMemo(() => {
    return profilesData?.pages 
      ? profilesData.pages.flatMap((page) => page.profiles || []) 
      : [];
  }, [profilesData]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10" style={{ background: "var(--bg)" }}>
      
      {/* Hero Header */}
      <HeroSection />

      {/* Recommended Section */}
      {!isLoading && !search.trim() && (
        <RecommendedDevelopers
          profiles={profiles}
          followingIds={followingIds}
          onToggleFollow={toggleFollow}
          activePendingId={followState.activeVariables}
          isPending={followState.isPending}
          onResetSearch={handleResetSearch}
        />
      )}

      {/* Discovery Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-users text-emerald-500 text-xs" aria-hidden="true"></i>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">
            {search.trim() ? `Search Results for "${search}"` : "Discover Developers"}
          </h2>
        </div>

        {isLoading ? (
          <NetworkSkeleton />
        ) : (
          <>
            <DeveloperGrid
              profiles={profiles}
              followingIds={followingIds}
              onToggleFollow={toggleFollow}
              activePendingId={followState.activeVariables}
              isPending={followState.isPending}
              onClearSearch={handleResetSearch}
            />

            {hasNextPage && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  {isFetchingNextPage ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin text-xs animate-spin" aria-hidden="true" />
                      Loading...
                    </>
                  ) : (
                    "Load More Developers"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default function NetworkPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
        <NetworkSkeleton />
      </div>
    }>
      <NetworkPageContent />
    </Suspense>
  );
}
