"use client";

import React, { useState } from 'react';
import { resolveMediaSrc } from '@/shared/lib/imageHelpers';

function MediaCarousel({ media }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!media || media.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    };

    const currentItem = media[currentIndex];

    return (
        <div className="relative mt-4 w-full rounded-2xl overflow-hidden aspect-[16/9] bg-gray-900 group/carousel shadow-sm">
            
            {/* Media Rendering (Mapping all items for seamless transition) */}
            {media.map((item, i) => {
                const isActive = i === currentIndex;
                
                return (
                    <div 
                        key={i} 
                        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                            isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                        }`}
                    >
                        {item.type === 'image' ? (
                            <img
                                src={resolveMediaSrc(item)}
                                alt={`Slide ${i + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <video
                                src={resolveMediaSrc(item)}
                                controls
                                className="w-full h-full object-cover bg-black"
                            />
                        )}
                    </div>
                );
            })}

            {/* Navigation Arrows (Z-index ensures they stay above images) */}
            {media.length > 1 && (
                <div className="z-20">
                    {/* Left Arrow */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-sm transition-colors hover:bg-white"
                    >
                        <i className="fa-solid fa-chevron-left text-sm"></i>
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={nextSlide}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-sm transition-colors hover:bg-white"
                    >
                        <i className="fa-solid fa-chevron-right text-sm"></i>
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {media.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MediaCarousel;
