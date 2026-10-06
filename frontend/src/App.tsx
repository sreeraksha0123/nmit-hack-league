import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentSignupPage } from './pages/StudentSignupPage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { HackathonsListPage } from './pages/HackathonsListPage';
import { HackathonDetailsPage } from './pages/HackathonDetailsPage';
import { MyHackathonsPage } from './pages/MyHackathonsPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminHackathonsPage } from './pages/AdminHackathonsPage';
import { AdminRegistrationsPage } from './pages/AdminRegistrationsPage';
import { AdminStudentsPage } from './pages/AdminStudentsPage';
import { AdminFeedbackPage } from './pages/AdminFeedbackPage';

// Route Guards
const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isStudent, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !isStudent) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const AuthGuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0d14] text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/hackathons" element={<HackathonsListPage />} />
          <Route path="/hackathons/:id" element={<HackathonDetailsPage />} />

          {/* Guest Auth Routes */}
          <Route
            path="/signup"
            element={
              <AuthGuestRoute>
                <StudentSignupPage />
              </AuthGuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <AuthGuestRoute>
                <StudentLoginPage />
              </AuthGuestRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <AuthGuestRoute>
                <AdminLoginPage />
              </AuthGuestRoute>
            }
          />

          {/* Protected Student Routes */}
          <Route
            path="/dashboard"
            element={
              <StudentRoute>
                <StudentDashboardPage />
              </StudentRoute>
            }
          />
          <Route
            path="/my-hackathons"
            element={
              <StudentRoute>
                <MyHackathonsPage />
              </StudentRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <StudentRoute>
                <StudentProfilePage />
              </StudentRoute>
            }
          />

          {/* Protected Administrator Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/hackathons"
            element={
              <AdminRoute>
                <AdminHackathonsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/registrations"
            element={
              <AdminRoute>
                <AdminRegistrationsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <AdminRoute>
                <AdminStudentsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <AdminRoute>
                <AdminFeedbackPage />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
