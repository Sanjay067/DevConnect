"use client";


import FeedWrapper from "@/features/feed/components/FeedWrapper";
import { useFeed } from '../../../features/feed/hooks/useFeed';

function Feed() {
    const { data: feed, isLoading, isError, error } = useFeed();
    if (isLoading) {
        return (
            <div className="flex justify-center p-10">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-500"></i>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center text-red-500 p-10">
                Error loading feed: {error.message}
            </div>
        );
    }
    return (
        <main className="min-h-screen bg-gray-50 py-5 ">
            <FeedWrapper feed={feed} />

        </main>
    )
}

export default Feed;