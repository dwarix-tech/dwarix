import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

// Multer memory storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, SVG, GIF) are allowed'), false);
    }
  }
});

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured = () => {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a file buffer to Cloudinary or falls back to an encoded data URL in local mock mode
 */
export const uploadImage = async (fileBuffer, folder = 'dwarix', originalname = 'upload') => {
  if (!fileBuffer) {
    throw new Error('No file buffer provided for upload');
  }

  if (!isCloudinaryConfigured()) {
    console.warn('[UploadService] Cloudinary credentials not detected. Simulating storage via local asset URI.');
    const safeName = originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    return {
      url: `/uploads/${folder}/${Date.now()}-${safeName}`,
      publicId: `mock_${Date.now()}`,
      format: 'webp',
      simulated: true
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

