"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getAllProfiles } from "@/services/userService";
import { followUser, unfollowUser, getFollowing } from "@/services/followService";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";
import Loader from "@/shared/components/Loader";

function NetworkPage() {
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.user);

  const { data: profilesData, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => getAllProfiles().then((res) => res.data),
  });

  const { data: followingData } = useQuery({
    queryKey: ["following", currentUser?._id],
    queryFn: () => getFollowing(currentUser._id).then((res) => res.data),
    enabled: !!currentUser?._id,
  });

  const followingIds = new Set(
    (followingData?.following || []).map((f) => String(f.followingId?._id || f.followingId))
  );

  const followMutation = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });

  const toggleFollow = (userId) => {
    if (followingIds.has(String(userId))) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  const profiles = profilesData?.profiles || [];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Network</h1>
      <div className="grid gap-3">
        {profiles.length === 0 && (
          <p className="text-sm text-gray-500">No developers found yet.</p>
        )}
        {profiles.map((profile) => {
          const isFollowing = followingIds.has(String(profile._id));
          const isPending =
            (followMutation.isPending && String(followMutation.variables) === String(profile._id)) ||
            (unfollowMutation.isPending && String(unfollowMutation.variables) === String(profile._id));

          return (
            <div
              key={profile._id}
              className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200">
                  <img
                    src={resolveProfilePicture(profile.profilePicture)}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{profile.name}</p>
                  <p className="text-xs text-gray-500">@{profile.username}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => toggleFollow(profile._id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                  isFollowing
                    ? "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NetworkPage;
