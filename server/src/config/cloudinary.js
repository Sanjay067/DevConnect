import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


class CloudinaryStorage {
  constructor({ cloudinary: cld, params = {} }) {
    this._cloudinary = cld;
    this._params = typeof params === "function" ? params : () => params;
  }

  async _handleFile(req, file, cb) {
    try {
      const params = await this._params(req, file);
      const uploadStream = this._cloudinary.uploader.upload_stream(
        params,
        (error, result) => {
          if (error) return cb(error);
          cb(null, {
            path: result.secure_url,
            filename: result.public_id,
            mimetype: file.mimetype,
            size: result.bytes,
          });
        }
      );
      file.stream.pipe(uploadStream);
    } catch (error) {
      cb(error);
    }
  }

  _removeFile(req, file, cb) {
    if (!file.filename) return cb(null);
    this._cloudinary.uploader.destroy(file.filename, (err) => cb(err || null));
  }
}

const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const postMimeTypes = new Set([...imageMimeTypes, "video/mp4"]);
const fileFilterFor = (allowedTypes) => (req, file, cb) => {
  if (!allowedTypes.has(file.mimetype)) {
    return cb(new Error("Unsupported media type"));
  }
  return cb(null, true);
};

// profile pictures
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "devConnect/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

//temporary media
const tempMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "devConnect/temp",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "auto",
  },
});

// post media
const postMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "devConnect/posts",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4"],
    resource_type: "auto",
  },
});

const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "devConnect/banners",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 400, crop: "fill" }],
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: fileFilterFor(imageMimeTypes),
  limits: { fileSize: 1024 * 1024 } // 1MB limit
});

export const uploadBanner = multer({
  storage: bannerStorage,
  fileFilter: fileFilterFor(imageMimeTypes),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

export const uploadPostMedia = multer({
  storage: postMediaStorage,
  fileFilter: fileFilterFor(postMimeTypes),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 } // 10MB per file
});

export const uploadTempMedia = multer({
  storage: tempMediaStorage,
  fileFilter: fileFilterFor(imageMimeTypes),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }
});

export { cloudinary };
