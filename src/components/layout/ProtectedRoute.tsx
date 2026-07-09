import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';

// 1. Tell TypeScript about the new props from the contributor's code
type ProtectedRouteProps = {
  children?: React.ReactNode;
  allowedRoles?: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, loading } = useAuth();

  // Show a loading spinner while Supabase checks local storage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If there is no active session, boot them to the auth page
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // 2. Handle the contributor's Role-Based Access Control (RBAC)
  if (allowedRoles && allowedRoles.length > 0) {
    // Assuming the user's role is stored in Supabase's user_metadata
    // Defaults to 'user' if no role is found
    const userRole = session.user.user_metadata?.role || 'user';
    
    // If their role isn't in the allowed list, kick them back to the dashboard
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 3. Support BOTH ways of rendering (with children or as an Outlet)
  return children ? <>{children}</> : <Outlet />;
}