import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';
import { useAuth } from './auth/AuthContext';
import { Header } from './components/Header';
import { AdminPage } from './pages/AdminPage';
import { ListingPage } from './pages/ListingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <main className="p-6 text-center text-slate-600">Loading…</main>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return <div className="min-h-screen bg-white text-slate-900">
    <Header />
    <Routes>
      <Route path="/" element={<ListingPage />} />
      <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
    </Routes>
    <Toaster position="top-right" />
  </div>;
}
