"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useProfile, useToggleFollow, useUserPosts } from "@/features/profile/hooks/useProfile";
import { useProfileUploads } from "@/features/profile/hooks/useProfileUploads";
import { deletePost, toggleFeaturePost } from "@/services/postService";

import ProfileHeader from "./ProfileHeader";
import ProfileSidebar from "./ProfileSidebar";
import FeaturedProjects from "./FeaturedProjects";
import AllShowcases from "./AllShowcases";
import EditProfileModal from "./EditProfileModal";
import ProfileSkeleton from "./ProfileSkeleton";

export default function ProfileLayout({ userId, isOwnProfile }) {
    const queryClient = useQueryClient();
    
    // 1. Fetch Profile and Posts
    const { data: profileWrapper, isLoading: profileLoading } = useProfile(userId);
    const { data: posts, isLoading: postsLoading } = useUserPosts(userId);
    
    const profile = profileWrapper?.profile;
    const user = profile?.userId || profileWrapper?.user;
    const isFollowing = profile?.isFollowing || false;

    // 2. Mutations
    const { mutate: toggleFollow } = useToggleFollow(userId, isFollowing);
    const { uploadBanner, isBannerPending } = useProfileUploads(userId);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const deleteMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            queryClient.invalidateQueries({ queryKey: ["userPosts", userId] });
        },
    });

    const featureMutation = useMutation({
        mutationFn: toggleFeaturePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            queryClient.invalidateQueries({ queryKey: ["userPosts", userId] });
            queryClient.invalidateQueries({ queryKey: ["profile", userId] });
        },
    });

    // 3. Dynamic lists computations
    const featuredProjects = useMemo(() => {
        if (!posts || posts.length === 0) return [];
        return posts.filter(p => p.isFeatured === true);
    }, [posts]);

    const feedProjects = useMemo(() => {
        return posts || [];
    }, [posts]);

    if (profileLoading) return <ProfileSkeleton />;

    if (!user) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-zinc-500">
                <i className="fa-solid fa-user-xmark text-4xl mb-3 text-zinc-750" aria-hidden="true"></i>
                <p>User not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 pt-4 md:pt-8" style={{ background: "var(--bg)" }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                
                {/* ── Profile Header ── */}
                <ProfileHeader
                    profile={profile}
                    user={user}
                    posts={posts}
                    isOwnProfile={isOwnProfile}
                    isFollowing={isFollowing}
                    isBannerPending={isBannerPending}
                    onToggleFollow={() => toggleFollow()}
                    onEditClick={() => setIsEditModalOpen(true)}
                    onUploadBanner={uploadBanner}
                />

                {/* ── Two-Column Main Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* ── LEFT COLUMN: Featured + All Showcases ── */}
                    <div className="lg:col-span-2 space-y-10 order-2 lg:order-1">
                        
                        {/* 1. Featured / Pinned Projects */}
                        <FeaturedProjects
                            featuredProjects={featuredProjects}
                            isOwnProfile={isOwnProfile}
                            postsLoading={postsLoading}
                            isDeletePending={deleteMutation.isPending}
                            isFeaturePending={featureMutation.isPending}
                            onDeletePost={(postId) => deleteMutation.mutate(postId)}
                            onToggleFeaturePost={(postId) => featureMutation.mutate(postId)}
                        />

                        {/* 2. All Showcases */}
                        <AllShowcases
                            feedProjects={feedProjects}
                            featuredProjects={featuredProjects}
                            isOwnProfile={isOwnProfile}
                            postsLoading={postsLoading}
                        />

                    </div>

                    {/* ── RIGHT COLUMN: Sidebar info ── */}
                    <div className="order-1 lg:order-2 w-full">
                        <ProfileSidebar
                            profile={profile}
                            user={user}
                        />
                    </div>

                </div>
            </div>

            {/* Edit Modal */}
            <EditProfileModal
                key={`${isEditModalOpen}-${profile?._id || "profile"}`}
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                initialData={profile} 
                userId={userId} 
            />
        </div>
    );
}
