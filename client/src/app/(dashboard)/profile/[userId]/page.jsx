"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import ProfileLayout from "@/features/profile/components/ProfileLayout";

export default function UserProfilePage() {
    const { userId } = useParams();
    const currentUser = useSelector((state) => state.auth.user);
    
    // Fallback: If they click their own profile link by ID, treat it as their own profile
    const isOwnProfile = currentUser?._id === userId;

    if (!userId) return null;

    return <ProfileLayout userId={userId} isOwnProfile={isOwnProfile} />;
}
