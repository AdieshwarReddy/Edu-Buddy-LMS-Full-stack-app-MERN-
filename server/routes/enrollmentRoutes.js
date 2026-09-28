const express = require('express');
const router = express.Router();
const {
  getMyEnrollments,
  getEnrollmentByCourseId,
  updateLessonProgress,
  freeEnroll
} = require('../controllers/enrollmentController');
const { generateCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyEnrollments);
router.get('/course/:courseId', protect, getEnrollmentByCourseId);
router.patch('/course/:courseId/progress', protect, updateLessonProgress);
router.post('/free/:courseId', protect, freeEnroll);
router.get('/course/:courseId/certificate', protect, generateCertificate);

module.exports = router;
