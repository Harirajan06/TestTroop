import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdminNavbar } from './components/AdminNavbar';
import { AdminSidebar } from './components/AdminSidebar';
import { initializeStore } from './lib/supabase';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ContestListingPage } from './pages/ContestListingPage';
import { ContestDetailPage } from './pages/ContestDetailPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { WinnersPage } from './pages/WinnersPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminContestListPage } from './pages/admin/AdminContestListPage';
import { AdminContestFormPage } from './pages/admin/AdminContestFormPage';
import { AdminParticipantsPage } from './pages/admin/AdminParticipantsPage';
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminWinnerPage } from './pages/admin/AdminWinnerPage';
import { AdminCampaignsPage } from './pages/admin/AdminCampaignsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Scroll to Top Helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// PUBLIC LAYOUT WRAPPER
const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// ADMIN LAYOUT WRAPPER (SECURED ROLE = ADMIN)
const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-bold">
        Verifying Admin Credentials & RLS Authorization...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <AdminNavbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// USER PROTECTED ROUTE
const ProtectedUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export const App: React.FC = () => {
  const [storeReady, setStoreReady] = useState(false);

  useEffect(() => {
    initializeStore().then(() => setStoreReady(true));
  }, []);

  if (!storeReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-medium">Loading The Test Troop...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          
          {/* PUBLIC APPLICATION ROUTES */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/contests" element={<ContestListingPage />} />
            <Route path="/contests/:slug" element={<ContestDetailPage />} />
            <Route path="/winners" element={<WinnersPage />} />

            <Route path="/dashboard" element={
              <ProtectedUserRoute><UserDashboardPage /></ProtectedUserRoute>
            } />
            <Route path="/my-contests" element={
              <ProtectedUserRoute><UserDashboardPage /></ProtectedUserRoute>
            } />
            <Route path="/profile" element={
              <ProtectedUserRoute><UserProfilePage /></ProtectedUserRoute>
            } />
          </Route>

          {/* DEDICATED SECURE ADMIN LOGIN */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ADMIN CONTROL CENTER ROUTES */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="contests" element={<AdminContestListPage />} />
            <Route path="contests/create" element={<AdminContestFormPage />} />
            <Route path="contests/:id/edit" element={<AdminContestFormPage />} />
            <Route path="contests/:id/participants" element={<AdminParticipantsPage />} />
            <Route path="contests/:id/submissions" element={<AdminSubmissionsPage />} />
            <Route path="contests/:id/reviews" element={<AdminReviewsPage />} />
            <Route path="contests/:id/winner" element={<AdminWinnerPage />} />
            <Route path="campaigns" element={<AdminCampaignsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

