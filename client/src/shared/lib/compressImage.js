import imageCompression from 'browser-image-compression';

/**
 * Compress an image file before uploading.
 * @param {File} file - The raw file from an input element
 * @returns {Promise<File>} - Compressed file
 */
export const compressImage = async (file) => {
  // Skip non-image files (videos, etc.)
  if (!file.type.startsWith('image/')) return file;

  const options = {
    maxSizeMB: 1,           // Target max size: 1MB
    maxWidthOrHeight: 1920,  // Max dimension
    useWebWorker: true,      // Non-blocking compression
  };

  try {
    const compressed = await imageCompression(file, options);
    // Preserve the original filename
    return new File([compressed], file.name, { type: compressed.type });
  } catch (err) {
    console.warn('Image compression failed, using original:', err);
    return file; // Fallback to original if compression fails
  }
};

/**
 * Compress multiple files.
 * @param {File[]} files
 * @returns {Promise<File[]>}
 */
export const compressImages = async (files) => {
  return Promise.all(files.map(compressImage));
};
