import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";
import streamifier from "streamifier";

// Use memory storage — we stream the buffer directly to Cloudinary
// instead of writing to disk first.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/**
 * Upload a buffer to Cloudinary and return the result.
 * @param {Buffer} buffer  - File buffer from multer memoryStorage
 * @param {string} folder  - Cloudinary folder name (e.g. "posts", "avatars")
 * @param {string} [publicId] - Optional existing public_id to overwrite
 */
export const uploadToCloudinary = (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      const error = new Error("Image storage is not configured on the server.");
      error.code = "CLOUDINARY_NOT_CONFIGURED";
      reject(error);
      return;
    }

    const options = {
      folder: `campus_connect/${folder}`,
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    };
    if (publicId) options.public_id = publicId;

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        const uploadError = new Error("Image upload failed. Please try again.");
        uploadError.code = "CLOUDINARY_UPLOAD_FAILED";
        uploadError.cause = error;
        return reject(uploadError);
      }
      if (!result?.secure_url || !result?.public_id) {
        const uploadError = new Error("Image upload did not return a valid result.");
        uploadError.code = "CLOUDINARY_UPLOAD_FAILED";
        return reject(uploadError);
      }
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete an image from Cloudinary by its public_id.
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

export const deleteFromCloudinaryStrict = async (publicId) => {
  if (!publicId) return;

  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    const error = new Error("Image storage is not configured on the server.");
    error.code = "CLOUDINARY_NOT_CONFIGURED";
    throw error;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Unexpected Cloudinary delete result: ${result.result}`);
    }
  } catch (cause) {
    const error = new Error("The image could not be deleted from storage.");
    error.code = "CLOUDINARY_DELETE_FAILED";
    error.cause = cause;
    throw error;
  }
};

export const getProfileImagePublicIdFromUrl = (imageUrl, imageType) => {
  if (!imageUrl) return "";

  try {
    const url = new URL(imageUrl);
    if (url.hostname !== "res.cloudinary.com") return "";

    const path = decodeURIComponent(url.pathname);
    const uploadIndex = path.indexOf("/image/upload/");
    if (uploadIndex === -1) return "";

    let assetPath = path.slice(uploadIndex + "/image/upload/".length);
    assetPath = assetPath.replace(/^(?:[^/]+,)*[^/]+\/(?=v\d+\/)/, "");
    assetPath = assetPath.replace(/^v\d+\//, "");

    const expectedFolder =
      imageType === "avatar"
        ? "campus_connect/avatars/"
        : "campus_connect/backgrounds/";
    const folderIndex = assetPath.indexOf(expectedFolder);
    if (folderIndex === -1) return "";

    const publicIdWithExtension = assetPath.slice(folderIndex);
    const extensionIndex = publicIdWithExtension.lastIndexOf(".");
    return extensionIndex > expectedFolder.length
      ? publicIdWithExtension.slice(0, extensionIndex)
      : publicIdWithExtension;
  } catch {
    return "";
  }
};
