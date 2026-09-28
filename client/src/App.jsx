import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute, RoleProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { CourseCatalogPage } from './pages/public/CourseCatalogPage';
import { CourseDetailPage } from './pages/public/CourseDetailPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { PaymentSuccessPage } from './pages/public/PaymentSuccessPage';
import { PaymentCancelPage } from './pages/public/PaymentCancelPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { UnauthorizedPage } from './pages/public/UnauthorizedPage';
import { LiveClassRoom } from './pages/public/LiveClassRoom';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyCoursesPage } from './pages/student/MyCoursesPage';
import { CoursePlayerPage } from './pages/student/CoursePlayerPage';
import { OrdersPage } from './pages/student/OrdersPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Instructor Pages
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { InstructorCoursesPage } from './pages/instructor/InstructorCoursesPage';
import { CreateCoursePage } from './pages/instructor/CreateCoursePage';
import { EditCoursePage } from './pages/instructor/EditCoursePage';
import { CurriculumBuilderPage } from './pages/instructor/CurriculumBuilderPage';
import { InstructorAnalyticsPage } from './pages/instructor/InstructorAnalyticsPage';
import { InstructorWebinarsPage } from './pages/instructor/InstructorWebinarsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';

export const App = () => {
  const location = useLocation();

  // Hide global navbar/footer in immersive course player
  const isImmersivePlayer = location.pathname.includes('/learn') || location.pathname.includes('/live/');

  return (
    <div className="flex flex-col min-h-screen">
      {!isImmersivePlayer && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CourseCatalogPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/live/:roomName" element={<LiveClassRoom />} />

          {/* Student Protected Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/my-courses"
            element={
              <ProtectedRoute>
                <MyCoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/course/:courseId/learn"
            element={
              <ProtectedRoute>
                <CoursePlayerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Instructor Protected Routes */}
          <Route
            path="/instructor/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses"
            element={
              <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorCoursesPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/new"
            element={
              <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                <CreateCoursePage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/:id/edit"
            element={
              <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                <EditCoursePage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/:id/curriculum"
            element={
              <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                <CurriculumBuilderPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/instructor/analytics"
            element={
              <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorAnalyticsPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/instructor/webinars"
            element={
              <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorWebinarsPage />
              </RoleProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminUsersPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminCoursesPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminOrdersPage />
              </RoleProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isImmersivePlayer && <Footer />}
    </div>
  );
};
