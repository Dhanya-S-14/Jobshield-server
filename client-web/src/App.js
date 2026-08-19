import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';
import './styles/theme.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatBot from './components/chatbot/ChatBot';
import { WarningBanner } from './components/warning/WarningBanner';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import HistoryPage from './pages/HistoryPage';
import SavedJobsPage from './pages/SavedJobsPage';
import CommunityReportsPage from './pages/CommunityReportsPage';
import NewReportPage from './pages/NewReportPage';
import CompanyVerifyPage from './pages/CompanyVerifyPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminKeywordsPage from './pages/AdminKeywordsPage';
import NotFoundPage from './pages/NotFoundPage';

const ProtectedRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader-container"><div className="loader-spinner lg" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

const AppLayout = ({ children, hideFooter }) => (
  <>
    <Navbar />
    <div className="page-wrapper">
      {children}
    </div>
    {!hideFooter && <Footer />}
  </>
);

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<AppLayout hideFooter><LandingPage /></AppLayout>} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/scanner" element={<AppLayout><ScannerPage /></AppLayout>} />
      <Route path="/history" element={<ProtectedRoute><AppLayout><HistoryPage /></AppLayout></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><AppLayout><SavedJobsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/community-reports" element={<AppLayout><CommunityReportsPage /></AppLayout>} />
      <Route path="/new-report" element={<AppLayout><NewReportPage /></AppLayout>} />
      <Route path="/company-verify" element={<ProtectedRoute><AppLayout><CompanyVerifyPage /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AppLayout><AdminDashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><AppLayout><AdminUsersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AppLayout><AdminReportsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/keywords" element={<ProtectedRoute adminOnly><AppLayout><AdminKeywordsPage /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<AppLayout hideFooter><NotFoundPage /></AppLayout>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <WarningBanner />
        <ChatBot />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          className="toast-container"
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
