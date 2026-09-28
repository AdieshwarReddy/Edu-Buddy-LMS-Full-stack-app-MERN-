const { isConfigured, uploadStream, deleteAsset } = require('../config/cloudinary');

/**
 * @desc    Upload thumbnail/avatar image
 * @route   POST /api/media/upload-image
 * @access  Private (Instructor, Admin, Student)
 */
const uploadImageMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file.'
      });
    }

    // If Cloudinary credentials are set, stream to Cloudinary
    if (isConfigured) {
      const result = await uploadStream(req.file.buffer, {
        folder: 'edubuddy/images',
        resource_type: 'image'
      });

      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully.',
        url: result.url,
        publicId: result.publicId
      });
    }

    // Dev Fallback when Cloudinary credentials are empty: Data URL
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    res.status(200).json({
      success: true,
      message: 'Image processed (development mode).',
      url: dataUrl,
      publicId: `dev_img_${Date.now()}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload lesson video
 * @route   POST /api/media/upload-video
 * @access  Private (Instructor, Admin)
 */
const uploadVideoMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a video file.'
      });
    }

    // If Cloudinary is configured
    if (isConfigured) {
      const result = await uploadStream(req.file.buffer, {
        folder: 'edubuddy/videos',
        resource_type: 'video'
      });

      return res.status(200).json({
        success: true,
        message: 'Video uploaded successfully.',
        url: result.url,
        publicId: result.publicId,
        duration: Math.round(result.duration || 0)
      });
    }

    // Dev fallback if Cloudinary credentials are not set
    const sampleVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ];
    const fallbackUrl = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];

    res.status(200).json({
      success: true,
      message: 'Video processed with test fallback (configure Cloudinary for custom video streaming).',
      url: fallbackUrl,
      publicId: `dev_vid_${Date.now()}`,
      duration: 360
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete media from Cloudinary
 * @route   DELETE /api/media/:publicId
 * @access  Private (Instructor, Admin)
 */
const removeMedia = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    await deleteAsset(publicId, resourceType);

    res.status(200).json({
      success: true,
      message: 'Asset removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImageMedia,
  uploadVideoMedia,
  removeMedia
};
