"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

export default function MyProfilePage() {
    const currentUser = useSelector((state) => state.auth.user);
    const router = useRouter();

    useEffect(() => {
        if (currentUser?._id) {
            router.replace(`/profile/${currentUser._id}`);
        }
    }, [currentUser, router]);

    return null;
}
