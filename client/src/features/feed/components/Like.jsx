import React, { useState, useEffect, useRef } from 'react';

function Like({ initialLiked, initialLikeCount, onToggle }) {
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
    const debounceTimer = useRef(null);

    useEffect(() => {
        setIsLiked(initialLiked);
        setLikeCount(initialLikeCount || 0);
    }, [initialLiked, initialLikeCount]);

    const handleLikeClick = () => {
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount((prev) => newIsLiked ? prev + 1 : prev - 1);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            onToggle();
        }, 1000);
    };

    return (
        <button
            onClick={handleLikeClick}
            className={`flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1 rounded transition-all duration-300 ${isLiked ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-800'}`}
        >
            <div className="flex items-center justify-center">
                <i className={`${isLiked ? 'fa-solid text-yellow-500' : 'fa-regular'} fa-star text-sm transition-transform duration-200 ${isLiked ? 'scale-110' : ''}`}>
                </i>
            </div>
            <span className="font-semibold text-xs leading-none">{likeCount}</span>
        </button>
    );
}

export default Like;
