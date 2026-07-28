"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationsRead } from "@/services/notificationService";
import { followUser, unfollowUser } from "@/services/followService";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function NotificationsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse flex items-center gap-3.5 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/40">
          <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 rounded bg-zinc-800" />
            <div className="h-2.5 w-24 rounded bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications().then((res) => res.data),
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  const followMutation = useMutation({
    mutationFn: ({ userId, isFollowing }) =>
      isFollowing ? unfollowUser(userId) : followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  useEffect(() => {
    markReadMutation.mutate();
  }, []);

  const notifications = notificationsData?.notifications || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-850">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <i className="fa-regular fa-bell text-emerald-400 text-sm"></i>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-100 tracking-tight">Notifications</h1>
            <p className="text-xs text-zinc-500 font-medium">Recent activity and follow updates</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <NotificationsSkeleton />
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 p-8">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-3 text-zinc-600 border border-zinc-850 shadow-inner">
            <i className="fa-regular fa-bell-slash text-lg"></i>
          </div>
          <h3 className="text-sm font-bold text-zinc-300">All quiet here</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            You&apos;ll see activity updates when other developers follow your profile or engage with your showcases.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const sender = notif.senderId;
            if (!sender) return null;
            return (
              <div
                key={notif._id}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60 hover:border-zinc-700/60 transition-all shadow-md group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Sender Avatar */}
                  <Link
                    href={`/profile/${sender._id}`}
                    className="w-10 h-10 rounded-full overflow-hidden border border-zinc-800 shrink-0 group-hover:border-emerald-500/50 transition-colors"
                  >
                    {sender.profilePicture ? (
                      <img
                        src={resolveProfilePicture(sender.profilePicture)}
                        alt={sender.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-850" />
                    )}
                  </Link>

                  {/* Activity Details */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-300 leading-normal">
                      <Link
                        href={`/profile/${sender._id}`}
                        className="font-bold text-zinc-100 hover:text-emerald-400 transition-colors mr-1"
                      >
                        {sender.name}
                      </Link>
                      <span className="text-zinc-400">started following you.</span>
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium mt-1 flex items-center gap-1.5">
                      <span>@{sender.username}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(notif.createdAt)}</span>
                    </p>
                  </div>
                </div>

                {/* Follow / Following Action */}
                <button
                  type="button"
                  onClick={() =>
                    followMutation.mutate({
                      userId: sender._id,
                      isFollowing: sender.isFollowing,
                    })
                  }
                  disabled={followMutation.isPending}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-60 ${
                    sender.isFollowing
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/50"
                      : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                  }`}
                >
                  {sender.isFollowing ? (
                    <>
                      <i className="fa-solid fa-user-check mr-1" aria-hidden="true" />
                      Following
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-plus mr-1" aria-hidden="true" />
                      Follow
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
