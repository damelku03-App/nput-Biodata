import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import UserDashboard from './pages/UserDashboard';
import ProfileForm from './pages/ProfileForm';
import UploadDocs from './pages/UploadDocs';
import ApplicationStatus from './pages/ApplicationStatus';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplicants from './pages/AdminApplicants';
import AdminProgress from './pages/AdminProgress';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'user' | 'admin' }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Memuat...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        
        {/* User Routes */}
        <Route element={<ProtectedRoute role="user"><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/upload" element={<UploadDocs />} />
          <Route path="/status" element={<ApplicationStatus />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute role="admin"><DashboardLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/applicants" element={<AdminApplicants />} />
          <Route path="/admin/progress" element={<AdminProgress />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
