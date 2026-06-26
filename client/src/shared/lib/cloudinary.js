const CLOUD_NAME = "dzxegwov1";

/**
 * Build an optimized Cloudinary image URL.
 * @param {string} publicId - The Cloudinary public_id (e.g. "linkedin/posts/abc123")
 * @param {number} width - Desired width in pixels
 * @returns {string} Full optimized URL
 */
export const getOptimizedImageUrl = (publicId, width = 800) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
};

/**
 * Build a Cloudinary video URL.
 * @param {string} publicId
 * @returns {string}
 */
export const getVideoUrl = (publicId) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/q_auto/${publicId}`;
};

/**
 * Build a profile picture URL (small, cropped square).
 * @param {string} publicId
 * @param {number} size
 * @returns {string}
 */
export const getAvatarUrl = (publicId, size = 200) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_${size},h_${size},c_fill/${publicId}`;
};
