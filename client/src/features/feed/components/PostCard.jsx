"use client"

import { useState } from 'react';
import Like from './Like'
import MediaCarousel from './MediaCarousel'
import Comment from './Comment'
import { resolveProfilePicture } from '@/shared/lib/imageHelpers'
import { useLikePost } from '../hooks/useLikePost';
import { useSelector } from 'react-redux';

function PostCard({ post }) {
    const { mutate: executeLikeMutation } = useLikePost();
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
    const currentUser = useSelector((state) => state.auth.user);
    const isOwnPost = post.author?._id === currentUser?._id;


    const handleCommentBtn = () => {
        setIsCommentDialogOpen(!isCommentDialogOpen);
    }

    return (
        <div className="w-full max-w-2xl mx-auto my-6 rounded-2xl p-6 bg-white border border-gray-100 shadow-sm 
        transition-shadow hover:shadow-md z-10">
            {/* 1. Header: Author Info & Follow Button */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-gray-200">
                        { (post.author?.profilePicture || post.authorProfilePicture) ? (
                            <img
                                src={resolveProfilePicture(post.author?.profilePicture || post.authorProfilePicture)}
                                alt={post.author?.name || post.authorName || "Author"}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-yellow-500"></div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 tracking-tight leading-tight">{post.author?.name || post.authorName}</h3>
                        <p className="text-sm text-gray-500 font-medium">
                            @{post.author?.username || post.authorUsername} <span className="mx-1">•</span> 2h ago
                        </p>
                    </div>
                </div>

                {!isOwnPost && (
                    <button className="border border-blue-500 text-blue-600 rounded-full px-5 py-1.5 font-semibold text-sm hover:bg-blue-50 transition-colors">
                        Follow
                    </button>
                )}
            </div>


            {/* 2. Body: The Post Text */}
            <div className="flex flex-col gap-2 mb-4">
                <h2 className="text-[1.15rem] font-bold text-gray-900 leading-tight">
                    {post.title}
                </h2>

                {post.shortDescription && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {post.shortDescription}
                    </p>
                )}

                {/* Attached Media Carousel */}
                <MediaCarousel media={post.media} />
            </div>

            {/* 3. Post Links (View more, GitHub, Live Demo) */}
            <div className="flex items-center justify-between mb-4 mt-3">
                <button className="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center gap-1 transition-colors">
                    View more <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>

                <div className="flex items-center gap-3">
                    {post.links?.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                        >
                            <i className={link.label === 'Github' ? "fa-brands fa-github text-sm" : "fa-solid fa-triangle-exclamation text-sm"}></i>
                            {link.label === 'Github' ? 'GitHub' : 'Live Demo'}
                        </a>
                    ))}
                </div>
            </div>

            {/* 4. Tech Stack Badges */}
            {post.techStack && post.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {post.techStack.map((tech, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                            {tech}
                        </span>
                    ))}
                </div>
            )}

            {/* 5. Footer: Action Buttons */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-100 text-gray-500">

                {/* Like Button Component */}
                <Like
                    initialLiked={post.isLiked}
                    initialLikeCount={post.likeCount || 0}
                    onToggle={() => executeLikeMutation(post._id)}
                />

                {/* Comment Button */}
                <button className="flex items-center gap-2 transition-colors hover:text-gray-800" onClick={handleCommentBtn} >

                    <i className="fa-regular fa-comment text-[1.1rem]"></i>
                    <span className="font-semibold text-sm">{post.commentCount || 0}</span>
                </button>

                {/* Bookmark Button */}
                <button className="flex items-center gap-2 ml-auto transition-colors hover:text-gray-800">
                    <i className="fa-regular fa-bookmark text-[1.1rem]"></i>
                </button>
            </div>
            {isCommentDialogOpen && (
                <div className='mt-5 min-h-60 max-h-[600px] flex flex-col transition-all duration-300'>
                    <Comment postId={post._id} />
                </div>
            )}

        </div>
    )
}

export default PostCard;
