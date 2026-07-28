"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getFollowers, getFollowing } from "@/services/followService";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";

export default function FollowListModal({ isOpen, onClose, userId, type }) {
  const { data: list, isLoading } = useQuery({
    queryKey: ["profileFollows", userId, type],
    queryFn: () => {
      const apiCall = type === "followers" ? getFollowers(userId) : getFollowing(userId);
      return apiCall.then((res) => {
        return type === "followers" ? res.data.followers : res.data.following;
      });
    },
    enabled: isOpen && !!userId && !!type,
  });

  if (!isOpen) return null;

  const title = type === "followers" ? "Followers" : "Following";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-sm bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] z-10 animate-in fade-in zoom-in-95 duration-200"
        style={{ backdropFilter: "blur(12px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-300">{title}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="w-7 h-7 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto px-2 py-3 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Loading list...</p>
            </div>
          ) : !list || list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-zinc-900/50 flex items-center justify-center mb-3 text-zinc-600 border border-zinc-900">
                <i className={type === "followers" ? "fa-solid fa-users text-lg" : "fa-solid fa-user-plus text-lg"}></i>
              </div>
              <p className="text-xs text-zinc-450 font-medium">
                {type === "followers" ? "No followers yet." : "Not following anyone yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {list.map((item) => {
                const u = type === "followers" ? item.followerId : item.followingId;
                if (!u) return null;
                return (
                  <Link
                    key={item._id}
                    href={`/profile/${u._id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900/50 group transition-all"
                  >
                    {/* User Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-zinc-850 shrink-0">
                      {u.profilePicture ? (
                        <img 
                          src={resolveProfilePicture(u.profilePicture)} 
                          alt={u.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-850" />
                      )}
                    </div>
                    
                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                        {u.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                        @{u.username}
                      </p>
                    </div>

                    {/* View Profile arrow hint */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500/80 mr-1.5">
                      <i className="fa-solid fa-angle-right text-xs"></i>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
