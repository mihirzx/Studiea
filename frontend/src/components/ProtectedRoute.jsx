import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

// Redirects to /login if unauthenticated, or to the user's own home if the role mismatches.
export default function ProtectedRoute({ role }) {
  const { token, role: userRole } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) {
    return <Navigate to={userRole === 'teacher' ? '/teacher' : '/student'} replace />;
  }
  return <Outlet />;
}
