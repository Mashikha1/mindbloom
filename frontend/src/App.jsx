// ============================================
//  src/App.jsx
//  Root component. Sets up:
//  - React Router (navigation)
//  - Auth protection (private routes)
//  - Toast notifications
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/ui/Card';
import AppShell   from './components/layout/AppShell';
import AuthPage   from './pages/AuthPage';
import HomePage   from './pages/HomePage';
import JournalPage  from './pages/JournalPage';
import BreathePage  from './pages/BreathePage';
import InsightsPage from './pages/InsightsPage';
import ProfilePage  from './pages/ProfilePage';
import './styles/globals.css';

// ── PROTECTED ROUTE ───────────────────────
// If user is not logged in → redirect to /login
// If logged in → show the page wrapped in AppShell
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/" replace />;
  return <AppShell>{children}</AppShell>;
}

// ── PUBLIC ROUTE ──────────────────────────
// If user IS logged in → redirect to /home (don't show login)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user)    return <Navigate to="/home" replace />;
  return children;
}

// ── APP ROUTES ────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={
        <PublicRoute><AuthPage /></PublicRoute>
      } />

      {/* Protected */}
      <Route path="/home" element={
        <PrivateRoute><HomePage /></PrivateRoute>
      } />
      <Route path="/journal" element={
        <PrivateRoute><JournalPage /></PrivateRoute>
      } />
      <Route path="/breathe" element={
        <PrivateRoute><BreathePage /></PrivateRoute>
      } />
      <Route path="/insights" element={
        <PrivateRoute><InsightsPage /></PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute><ProfilePage /></PrivateRoute>
      } />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ── ROOT APP ──────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />

        {/* Toast notifications — shows success/error messages */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background:   'var(--card)',
              color:        'var(--text)',
              border:       '1px solid var(--border)',
              borderRadius: '14px',
              fontSize:     '13px',
              fontFamily:   'var(--font-body)',
              maxWidth:     '340px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
