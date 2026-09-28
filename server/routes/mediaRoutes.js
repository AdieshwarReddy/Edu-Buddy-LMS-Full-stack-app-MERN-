const express = require('express');
const router = express.Router();
const {
  uploadImageMedia,
  uploadVideoMedia,
  removeMedia
} = require('../controllers/mediaController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadImage, uploadVideo } = require('../middleware/uploadMiddleware');

router.post(
  '/upload-image',
  protect,
  uploadImage.single('image'),
  uploadImageMedia
);

router.post(
  '/upload-video',
  protect,
  authorize('instructor', 'admin'),
  uploadVideo.single('video'),
  uploadVideoMedia
);

router.delete(
  '/:publicId',
  protect,
  authorize('instructor', 'admin'),
  removeMedia
);

module.exports = router;
