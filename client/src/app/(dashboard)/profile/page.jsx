"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

export default function MyProfilePage() {
    const currentUser = useSelector((state) => state.auth.user);
    const isCheckingAuth = useSelector((state) => state.auth.isCheckingAuth);
    const router = useRouter();

    useEffect(() => {
        if (isCheckingAuth) return; // Wait for auth check to finish

        if (currentUser?._id) {
            router.replace(`/profile/${currentUser._id}`);
        } else {
            // Auth check finished but no user — send to login
            router.replace("/auth");
        }
    }, [currentUser, isCheckingAuth, router]);

    // Show a full-screen loading state while auth resolves
    return (
        <div
            className="flex min-h-screen items-center justify-center"
            style={{ background: "var(--bg)" }}
        >
            <div className="flex flex-col items-center gap-4">
                <i className="fa-solid fa-circle-notch fa-spin text-3xl text-emerald-500" />
                <p className="text-sm text-zinc-500">Loading profile…</p>
            </div>
        </div>
    );
}
