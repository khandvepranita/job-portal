import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role.startsWith('ROLE_') ? user.role : `ROLE_${user.role}`;
    const formattedAllowed = allowedRoles.map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`);

    if (!formattedAllowed.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
