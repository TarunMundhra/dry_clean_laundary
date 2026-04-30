import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ requiredRole }) => {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) return <div className="p-10 text-center">Verifying Session...</div>;

  if (!user) return <Navigate to="/" replace />;

  // Future role check (User vs Creator)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;