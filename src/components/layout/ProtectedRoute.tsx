import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute() {
  const { session, isLoading } = useAuth();

  // Show a blank screen or a loading spinner while Supabase checks local storage
  if (isLoading) {
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

  // If they are logged in, render the child routes
  return <Outlet />;
}