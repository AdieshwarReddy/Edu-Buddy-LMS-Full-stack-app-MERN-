const multer = require('multer');

// Memory storage to handle file streams
const storage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed!'), false);
  }
};

// File filter for videos
const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (MP4, WEBM, MKV, MOV) are allowed!'), false);
  }
};

// Image uploader (Max 10MB)
const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter
});

// Video uploader (Max 100MB)
const uploadVideo = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: videoFileFilter
});

module.exports = {
  uploadImage,
  uploadVideo
};
