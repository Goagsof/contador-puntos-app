import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';

export default function ProtectedRoute({ children, requireAdmin = false, requireLeader = false }) {
  const { user, profile, isAdmin, loading } = useAuth();
  const { config, loading: configLoading } = useConfig();

  if (loading || configLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está deshabilitado
  if (profile?.disabled === true) {
    return <Navigate to="/disabled" replace />;
  }

  // Si hay mantenimiento y no es admin
  if (config.maintenance && !isAdmin) {
    return <Navigate to="/maintenance" replace />;
  }

  // Admin-only route
  if (requireAdmin && !isAdmin) {
    return <Navigate to={profile?.role === 'lider' ? '/lider' : '/empleado'} replace />;
  }

  // Leader-only route (admin también puede entrar)
  if (requireLeader && profile?.role !== 'lider' && !isAdmin) {
    return <Navigate to="/empleado" replace />;
  }

  // Non-admin routes: si es admin, lo mandamos a /admin
  if (!requireAdmin && !requireLeader && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}