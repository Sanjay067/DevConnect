'use client'
import { useState } from 'react';
import PostCard from './PostCard';
import Comment from './Comment';
import CreatePostCard from './CreatePostCard';



function FeedWrapper({ feed }) {



    return (
        <div className="max-w-7xl mx-auto flex gap-8 px-4 justify-center">


            <div className='flex-1 min-w-0 transition-all duration-300'>
                <CreatePostCard />
                {feed?.posts?.map((post) => (
                    <PostCard
                        key={post._id}
                        post={post}
                    />
                ))}
            </div>
        </div>

    )
}

export default FeedWrapper;