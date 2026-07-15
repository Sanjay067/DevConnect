import { getAvatarUrl, getOptimizedImageUrl, getVideoUrl } from './cloudinary';

/**
 * Resolves a profile picture source.
 * If it's already a full URL (legacy data), return as-is.
 * If it's a publicId, build an optimized URL.
 */
export const resolveProfilePicture = (value, size = 200) => {
  if (!value) {
    return;
  }
  if (value.startsWith('http')) {
    return value;
  }
  return getAvatarUrl(value, size);
};

/**
 * Resolves a media item source.
 * Supports both legacy (url field) and new (publicId only) data.
 */
export const resolveMediaSrc = (item, width = 800) => {
  if (item.url) return item.url; // legacy data still has url
  if (item.type === 'video') {
    return getVideoUrl(item.publicId);
  }
  return getOptimizedImageUrl(item.publicId, width);
};
