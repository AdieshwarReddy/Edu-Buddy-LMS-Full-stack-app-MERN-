const cloudinary = require('cloudinary').v2;

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Upload buffer to Cloudinary using stream
 * @param {Buffer} buffer 
 * @param {Object} options 
 * @returns {Promise<{url: string, public_id: string, duration?: number}>}
 */
const uploadStream = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isConfigured) {
      return reject(new Error('Cloudinary credentials are not configured. Please check your environment variables.'));
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'edubuddy',
        resource_type: options.resource_type || 'auto',
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          duration: result.duration || 0,
          format: result.format,
          bytes: result.bytes
        });
      }
    );

    stream.end(buffer);
  });
};

/**
 * Delete asset from Cloudinary
 * @param {string} publicId 
 * @param {string} resourceType 
 */
const deleteAsset = async (publicId, resourceType = 'image') => {
  if (!isConfigured || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`[Cloudinary Delete Error] ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  isConfigured,
  uploadStream,
  deleteAsset
};
