'use client'
import { useState } from 'react';
import PostCard from './PostCard';
import Comment from './Comment';
import CreatePostCard from './CreatePostCard';



function FeedWrapper({ posts = [], isFetchingNextPage }) {
    return (
        <div className="max-w-7xl mx-auto flex gap-8 px-4 justify-center">
            <div className='flex-1 min-w-0 transition-all duration-300'>
                <CreatePostCard />
                {posts.map((post) => (
                    <PostCard
                        key={post._id}
                        post={post}
                    />
                ))}
                {isFetchingNextPage && (
                    <div className="text-center py-4 text-zinc-550 text-xs font-semibold">
                        <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                        Loading more posts...
                    </div>
                )}
            </div>
        </div>
    )
}

export default FeedWrapper;