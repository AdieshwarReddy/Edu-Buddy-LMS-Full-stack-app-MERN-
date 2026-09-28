require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const Order = require('../models/Order');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edubuddy';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Cleaning existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Enrollment.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});

    console.log('[Seed] Creating demo users...');
    const defaultPassword = await User.hashPassword('password123');

    // 1. Admin
    const admin = await User.create({
      name: 'Adhi Administrator',
      email: 'admin@edubuddy.demo',
      passwordHash: defaultPassword,
      role: 'admin',
      bio: 'Lead System Administrator & Platform Overseer for Adhi EduBuddy LMS.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    // 2. Instructors
    const instructor1 = await User.create({
      name: 'Dr. Evelyn Reed',
      email: 'instructor@edubuddy.demo',
      passwordHash: defaultPassword,
      role: 'instructor',
      bio: 'Senior Full Stack Architect with 12+ years of industry experience at top tier tech firms.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    });

    const instructor2 = await User.create({
      name: 'Marcus Vance',
      email: 'marcus.instructor@edubuddy.demo',
      passwordHash: defaultPassword,
      role: 'instructor',
      bio: 'Cloud Architect, DevOps Evangelist, and Kubernetes Certified Trainer.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });

    // 3. Students
    const student1 = await User.create({
      name: 'Adhithya Student',
      email: 'student@edubuddy.demo',
      passwordHash: defaultPassword,
      role: 'student',
      bio: 'Passionate computer science student aiming to become a full stack engineer.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    });

    const student2 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.student@edubuddy.demo',
      passwordHash: defaultPassword,
      role: 'student',
      bio: 'Self-taught developer building modern cloud applications.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    });

    console.log('[Seed] Creating demo courses & lessons...');

    // Course 1: Full-Stack MERN Mastery
    const course1 = await Course.create({
      title: 'Full-Stack MERN Architecture: Production Ready Masterclass',
      description: `Master modern web application engineering from database architecture to frontend deployment. Learn how to architect scalable Express APIs, design resilient MongoDB schemas with Mongoose, integrate secure authentication using HTTP-only cookies & JWT, manage media streaming with Cloudinary, and accept payments with Stripe.`,
      shortDescription: 'Build scalable, secure full-stack applications with React, Node.js, Express, MongoDB, and Stripe.',
      instructor: instructor1._id,
      category: 'Web Development',
      level: 'All Levels',
      language: 'English',
      price: 49.99,
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      published: true,
      enrolledStudentsCount: 2
    });

    const c1Lessons = await Lesson.create([
      {
        course: course1._id,
        title: '1. Introduction to Modern MERN Architecture',
        description: 'Understand the big picture: client-server separation, RESTful standards, stateless authentication, and environment configs.',
        order: 1,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 480,
        previewAllowed: true
      },
      {
        course: course1._id,
        title: '2. Setting up Express & MongoDB Mongoose Schemas',
        description: 'Deep dive into Mongoose modeling, subdocuments, pre/post middleware hooks, and aggregation pipelines.',
        order: 2,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 720,
        previewAllowed: true
      },
      {
        course: course1._id,
        title: '3. Bulletproof JWT Auth & HTTP-Only Cookies',
        description: 'Securing cookies with SameSite, Secure flags, XSS prevention, and Role-Based Access Control (RBAC).',
        order: 3,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 900,
        previewAllowed: false
      },
      {
        course: course1._id,
        title: '4. Stripe Checkout & Webhook Idempotency',
        description: 'Implement real-world payment processing with verified webhooks and atomic enrollment creation.',
        order: 4,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        duration: 1100,
        previewAllowed: false
      }
    ]);

    // Course 2: Kubernetes & Docker DevOps
    const course2 = await Course.create({
      title: 'Cloud Native DevOps: Docker, Kubernetes & CI/CD Pipelines',
      description: `Containerize applications, orchestrate microservices with Kubernetes, write automated GitHub Actions workflows, and deploy with zero-downtime rolling updates.`,
      shortDescription: 'Master modern DevOps pipelines, Docker containers, Kubernetes clusters, and automated releases.',
      instructor: instructor2._id,
      category: 'Cloud & DevOps',
      level: 'Intermediate',
      language: 'English',
      price: 69.99,
      thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
      published: true,
      enrolledStudentsCount: 1
    });

    const c2Lessons = await Lesson.create([
      {
        course: course2._id,
        title: '1. Docker Fundamentals & Multi-Stage Builds',
        description: 'Creating lightweight, secure container images for Node.js and React frontend assets.',
        order: 1,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 600,
        previewAllowed: true
      },
      {
        course: course2._id,
        title: '2. Kubernetes Pods, Deployments & Services',
        description: 'Managing declarative manifests, ingress controllers, and service meshes.',
        order: 2,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 850,
        previewAllowed: false
      }
    ]);

    // Course 3: Free Web Development Bootcamp
    const course3 = await Course.create({
      title: 'Modern JavaScript & React 18 Essentials (Free)',
      description: `A fast-track primer on ES6+ syntax, Async/Await, React hooks, Context API, Tailwind CSS, and state management fundamentals.`,
      shortDescription: 'Start your coding journey with modern React, hooks, components, and responsive design.',
      instructor: instructor1._id,
      category: 'Web Development',
      level: 'Beginner',
      language: 'English',
      price: 0,
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      published: true,
      enrolledStudentsCount: 1
    });

    const c3Lessons = await Lesson.create([
      {
        course: course3._id,
        title: '1. Welcome & ES6+ JavaScript Refresher',
        description: 'Destructuring, spread operators, arrow functions, promises, and modules.',
        order: 1,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 400,
        previewAllowed: true
      },
      {
        course: course3._id,
        title: '2. React Components, Props, and State',
        description: 'Thinking in React, useState, useEffect, and component composition patterns.',
        order: 2,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 650,
        previewAllowed: true
      }
    ]);

    // Course 4: UI/UX Design Systems
    const course4 = await Course.create({
      title: 'UI/UX Design Systems & Figma to Code Workflow',
      description: `Learn how to design clean, high-conversion design systems in Figma and translate them pixel-perfect into Tailwind CSS.`,
      shortDescription: 'Design beautiful, accessible UI components and translate Figma designs to clean code.',
      instructor: instructor1._id,
      category: 'UI/UX Design',
      level: 'All Levels',
      language: 'English',
      price: 29.99,
      thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      published: true,
      enrolledStudentsCount: 0
    });

    await Lesson.create([
      {
        course: course4._id,
        title: '1. Color Theory, Typography, and Spacing Tokens',
        description: 'Building harmonious palettes and consistent visual rhythm.',
        order: 1,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 520,
        previewAllowed: true
      }
    ]);

    // Course 5: Python AI & Data Science
    const course5 = await Course.create({
      title: 'Practical Data Science & Machine Learning with Python',
      description: `Exploratory data analysis, Pandas, NumPy, Scikit-Learn, and deploying predictive ML models as REST microservices.`,
      shortDescription: 'Build real-world predictive models and machine learning pipelines from scratch.',
      instructor: instructor2._id,
      category: 'Data Science & AI',
      level: 'Intermediate',
      language: 'English',
      price: 59.99,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      published: true,
      enrolledStudentsCount: 0
    });

    await Lesson.create([
      {
        course: course5._id,
        title: '1. Python for Data Analysis & Pandas Basics',
        description: 'Loading datasets, cleaning null values, and summary statistics.',
        order: 1,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 700,
        previewAllowed: true
      }
    ]);

    console.log('[Seed] Creating enrollments and progress for students...');

    // Student 1 enrolled in Course 1 (MERN)
    const enrollment1 = await Enrollment.create({
      student: student1._id,
      course: course1._id,
      completedLessonIds: [c1Lessons[0]._id, c1Lessons[1]._id],
      progressPercentage: 50,
      completed: false,
      lastAccessedLesson: c1Lessons[1]._id
    });

    // Student 1 enrolled in Course 3 (Free)
    await Enrollment.create({
      student: student1._id,
      course: course3._id,
      completedLessonIds: [c3Lessons[0]._id, c3Lessons[1]._id],
      progressPercentage: 100,
      completed: true,
      lastAccessedLesson: c3Lessons[1]._id
    });

    // Student 2 enrolled in Course 1 (MERN) and Course 2 (DevOps)
    await Enrollment.create({
      student: student2._id,
      course: course1._id,
      completedLessonIds: [c1Lessons[0]._id],
      progressPercentage: 25,
      completed: false,
      lastAccessedLesson: c1Lessons[0]._id
    });

    await Enrollment.create({
      student: student2._id,
      course: course2._id,
      completedLessonIds: [c2Lessons[0]._id],
      progressPercentage: 50,
      completed: false,
      lastAccessedLesson: c2Lessons[0]._id
    });

    console.log('[Seed] Creating sample orders...');
    await Order.create([
      {
        student: student1._id,
        course: course1._id,
        stripeSessionId: 'cs_test_demo_student1_mern',
        stripePaymentIntentId: 'pi_test_demo_1',
        amount: course1.price,
        currency: 'usd',
        status: 'completed'
      },
      {
        student: student2._id,
        course: course1._id,
        stripeSessionId: 'cs_test_demo_student2_mern',
        stripePaymentIntentId: 'pi_test_demo_2',
        amount: course1.price,
        currency: 'usd',
        status: 'completed'
      },
      {
        student: student2._id,
        course: course2._id,
        stripeSessionId: 'cs_test_demo_student2_devops',
        stripePaymentIntentId: 'pi_test_demo_3',
        amount: course2.price,
        currency: 'usd',
        status: 'completed'
      }
    ]);

    console.log('[Seed] Creating reviews and ratings...');
    await Review.create([
      {
        student: student1._id,
        course: course1._id,
        rating: 5,
        comment: 'Hands down the most well-structured MERN course I have ever taken! The deep dive on HTTP-only cookies and Stripe webhooks is worth 10x the price.'
      },
      {
        student: student2._id,
        course: course1._id,
        rating: 5,
        comment: 'Brilliant explanations, production architecture patterns, and clean code. Highly recommended!'
      },
      {
        student: student2._id,
        course: course2._id,
        rating: 4,
        comment: 'Very practical DevOps breakdown. Kubernetes pods and deployments were explained crystal clear.'
      }
    ]);

    // Recalculate course ratings
    await Review.calcAverageRating(course1._id);
    await Review.calcAverageRating(course2._id);

    console.log('====================================================');
    console.log('  SEED COMPLETED SUCCESSFULLY!                      ');
    console.log('====================================================');
    console.log('  DEMO ACCOUNTS (Password for all: password123)     ');
    console.log('  Admin:       admin@edubuddy.demo                  ');
    console.log('  Instructor:  instructor@edubuddy.demo             ');
    console.log('  Instructor:  marcus.instructor@edubuddy.demo      ');
    console.log('  Student:     student@edubuddy.demo                 ');
    console.log('  Student:     alex.student@edubuddy.demo           ');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedData();
