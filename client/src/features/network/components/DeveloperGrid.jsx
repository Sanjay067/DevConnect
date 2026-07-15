import React from "react";
import DeveloperCard from "./DeveloperCard";
import EmptyState from "./EmptyState";

export default function DeveloperGrid({ 
  profiles, 
  followingIds, 
  onToggleFollow, 
  activePendingId, 
  isPending, 
  onClearSearch 
}) {
  if (profiles.length === 0) {
    return <EmptyState onClear={onClearSearch} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile) => {
        const isFollowing = followingIds.has(String(profile._id));
        const cardPending = isPending && String(activePendingId) === String(profile._id);

        return (
          <DeveloperCard
            key={profile._id}
            profile={profile}
            isFollowing={isFollowing}
            onToggleFollow={onToggleFollow}
            isPending={cardPending}
          />
        );
      })}
    </div>
  );
}
