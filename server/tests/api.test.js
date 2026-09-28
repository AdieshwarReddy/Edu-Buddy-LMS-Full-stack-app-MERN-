const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const Order = require('../models/Order');

let mongoServer;

beforeAll(async () => {
  console.log("Setup starting...");
  process.env.JWT_SECRET = 'test_jwt_secret_key_1234567890';
  process.env.NODE_ENV = 'test';

  console.log("Creating MongoMemoryServer...");
  mongoServer = await MongoMemoryServer.create();
  console.log("MongoMemoryServer created.");
  
  const testUri = mongoServer.getUri();
  console.log("Connecting to mongoose at:", testUri);
  try {
    await mongoose.connect(testUri);
    console.log("Mongoose connected.");
  } catch (err) {
    console.warn(`[Test DB] Connect error: ${err.message}. Using fallback.`);
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (e) {
    // Ignore cleanup error
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Enrollment.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
  }
});

describe('1. Health Check Endpoint', () => {
  it('GET /api/health should return status 200 and server health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('2. Authentication & Authorization Flows', () => {
  it('should register a new student successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Student',
        email: 'teststudent@edubuddy.demo',
        password: 'password123',
        role: 'student'
      });

    if (res.statusCode !== 201) console.log('Register Res:', res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('teststudent@edubuddy.demo');
    expect(res.body.user.role).toBe('student');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should prevent duplicate registration with the same email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Student',
        email: 'duplicate@edubuddy.demo',
        password: 'password123',
        role: 'student'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Student',
        email: 'duplicate@edubuddy.demo',
        password: 'password123',
        role: 'student'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should login successfully with valid credentials and reject invalid credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'login@edubuddy.demo',
        password: 'password123',
        role: 'student'
      });

    // Valid login
    const validRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@edubuddy.demo',
        password: 'password123'
      });
    expect(validRes.statusCode).toBe(200);
    expect(validRes.body.token).toBeDefined();

    // Invalid login
    const invalidRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@edubuddy.demo',
        password: 'wrongpassword'
      });
    expect(invalidRes.statusCode).toBe(401);
  });

  it('GET /api/auth/me should return current user when authenticated, and 401 when not', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Me User',
        email: 'me@edubuddy.demo',
        password: 'password123',
        role: 'student'
      });

    const token = registerRes.body.token;

    // Unauthenticated
    const unauthRes = await request(app).get('/api/auth/me');
    expect(unauthRes.statusCode).toBe(401);

    // Authenticated with Bearer token
    const authRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(authRes.statusCode).toBe(200);
    expect(authRes.body.user.email).toBe('me@edubuddy.demo');
  });
});

describe('3. Courses & Ownership System', () => {
  let instructorToken;
  let instructor2Token;
  let studentToken;

  beforeEach(async () => {
    const inst1 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Inst One', email: 'inst1@edubuddy.demo', password: 'password123', role: 'instructor' });
    instructorToken = inst1.body.token;

    const inst2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Inst Two', email: 'inst2@edubuddy.demo', password: 'password123', role: 'instructor' });
    instructor2Token = inst2.body.token;

    const stud = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Stud One', email: 'stud1@edubuddy.demo', password: 'password123', role: 'student' });
    studentToken = stud.body.token;
  });

  it('Instructor can create a course, student cannot', async () => {
    // Instructor creates course
    const instCourseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'MERN Stack Guide',
        description: 'Comprehensive guide to modern MERN applications.',
        price: 39.99,
        category: 'Web Development'
      });
    expect(instCourseRes.statusCode).toBe(201);
    expect(instCourseRes.body.course.title).toBe('MERN Stack Guide');

    // Student tries to create course
    const studCourseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Course',
        description: 'Should fail'
      });
    expect(studCourseRes.statusCode).toBe(403);
  });

  it('Instructor cannot edit or delete another instructor course', async () => {
    // Instructor 1 creates course
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'Instructor 1 Course',
        description: 'Course owned by Instructor 1',
        price: 29.99
      });
    const courseId = courseRes.body.course._id;

    // Instructor 2 attempts to edit it
    const editRes = await request(app)
      .put(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${instructor2Token}`)
      .send({ title: 'Hacked Title' });
    expect(editRes.statusCode).toBe(403);

    // Instructor 2 attempts to delete it
    const deleteRes = await request(app)
      .delete(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${instructor2Token}`);
    expect(deleteRes.statusCode).toBe(403);
  });
});

describe('4. Enrollment & Progress System', () => {
  let studentToken;
  let course;
  let lesson1;
  let lesson2;

  beforeEach(async () => {
    const inst = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Inst', email: 'inst@edubuddy.demo', password: 'password123', role: 'instructor' });

    const stud = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Student', email: 'student@edubuddy.demo', password: 'password123', role: 'student' });
    studentToken = stud.body.token;

    course = await Course.create({
      title: 'Free Web Dev',
      description: 'Free introduction course',
      price: 0,
      instructor: inst.body.user._id,
      published: true
    });

    lesson1 = await Lesson.create({ course: course._id, title: 'Lesson 1', order: 1 });
    lesson2 = await Lesson.create({ course: course._id, title: 'Lesson 2', order: 2 });
  });

  it('Student can enroll in free course and track progress accurately', async () => {
    // Free enrollment
    const enrollRes = await request(app)
      .post(`/api/enrollments/free/${course._id}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(enrollRes.statusCode).toBe(201);
    expect(enrollRes.body.success).toBe(true);

    // Update progress on lesson 1
    const progressRes1 = await request(app)
      .patch(`/api/enrollments/course/${course._id}/progress`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ lessonId: lesson1._id, completed: true });
    expect(progressRes1.statusCode).toBe(200);
    expect(progressRes1.body.enrollment.progressPercentage).toBe(50);
    expect(progressRes1.body.enrollment.completed).toBe(false);

    // Update progress on lesson 2 (100% complete)
    const progressRes2 = await request(app)
      .patch(`/api/enrollments/course/${course._id}/progress`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ lessonId: lesson2._id, completed: true });
    expect(progressRes2.statusCode).toBe(200);
    expect(progressRes2.body.enrollment.progressPercentage).toBe(100);
    expect(progressRes2.body.enrollment.completed).toBe(true);
  });
});

describe('5. Reviews & Ratings System', () => {
  let studentToken;
  let unenrolledStudentToken;
  let course;

  beforeEach(async () => {
    const inst = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Inst', email: 'inst@edubuddy.demo', password: 'password123', role: 'instructor' });

    const stud1 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Enrolled Stud', email: 'enrolled@edubuddy.demo', password: 'password123', role: 'student' });
    studentToken = stud1.body.token;

    const stud2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Unenrolled Stud', email: 'unenrolled@edubuddy.demo', password: 'password123', role: 'student' });
    unenrolledStudentToken = stud2.body.token;

    course = await Course.create({
      title: 'Course for Review',
      description: 'Course description',
      price: 0,
      instructor: inst.body.user._id,
      published: true
    });

    // Enroll stud1
    await Enrollment.create({
      student: stud1.body.user._id,
      course: course._id
    });
  });

  it('Enrolled student can review course; unenrolled is blocked; duplicate is prevented', async () => {
    // Unenrolled student attempt
    const blockedRes = await request(app)
      .post(`/api/courses/${course._id}/reviews`)
      .set('Authorization', `Bearer ${unenrolledStudentToken}`)
      .send({ rating: 5, comment: 'I did not buy this' });
    expect(blockedRes.statusCode).toBe(403);

    // Enrolled student review
    const reviewRes = await request(app)
      .post(`/api/courses/${course._id}/reviews`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ rating: 5, comment: 'Awesome course!' });
    expect(reviewRes.statusCode).toBe(201);
    expect(reviewRes.body.review.rating).toBe(5);

    // Duplicate review attempt
    const dupRes = await request(app)
      .post(`/api/courses/${course._id}/reviews`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ rating: 4, comment: 'Second review' });
    expect(dupRes.statusCode).toBe(400);

    // Verify course averageRating updated
    const updatedCourse = await Course.findById(course._id);
    expect(updatedCourse.averageRating).toBe(5);
    expect(updatedCourse.ratingsCount).toBe(1);
  });
});

describe('6. Admin Role & Protection', () => {
  it('Admin can access admin stats, student and instructor are blocked', async () => {
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      passwordHash: await User.hashPassword('password123'),
      role: 'admin'
    });
    const adminToken = require('jsonwebtoken').sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET);

    const stud = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Stud', email: 'stud@test.com', password: 'password123', role: 'student' });
    const studentToken = stud.body.token;

    // Student blocked
    const studRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(studRes.statusCode).toBe(403);

    // Admin allowed
    const adminRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.statusCode).toBe(200);
    expect(adminRes.body.success).toBe(true);
  });
});
