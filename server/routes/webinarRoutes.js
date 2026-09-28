const express = require('express');
const {
  createWebinar,
  getInstructorWebinars,
  getStudentWebinars,
  getCourseWebinars,
  deleteWebinar,
  markAttendance
} = require('../controllers/webinarController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('instructor', 'admin'), createWebinar);
router.get('/instructor', protect, authorize('instructor', 'admin'), getInstructorWebinars);
router.get('/student', protect, authorize('student'), getStudentWebinars);
router.get('/course/:courseId', protect, getCourseWebinars);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteWebinar);
router.post('/room/:roomName/attend', protect, markAttendance);

module.exports = router;
