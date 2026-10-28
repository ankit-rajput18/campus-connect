import { v2 as cloudinary } from "cloudinary";

const configureCloudinary = () => {
  const credentials = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  cloudinary.config({
    ...credentials,
  });

  if (Object.values(credentials).some((value) => !value)) {
    console.error("Cloudinary is missing required environment variables; image uploads will fail.");
    return;
  }

  console.log("✅ Cloudinary configured");
};

export { cloudinary, configureCloudinary };
