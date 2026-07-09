import type { ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

type ProtectedRouteProps = {
  children?: ReactNode;
  allowedRoles?: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Handle loading state
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Checking access
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Loading your Se2L workspace
          </h1>
        </section>
      </main>
    );
  }

  // Handle completely unauthenticated users
  if (!user) {
    // Send them to /auth if they aren't logged in
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // Handle Role-Based Access Control (RBAC)
  if (allowedRoles && allowedRoles.length > 0) {
    // Default to 'newcomer' if no profile role is found
    const userRole = profile?.role || 'newcomer';

    if (!allowedRoles.includes(userRole)) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
          <section className="max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
              Access denied
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">
              You do not have permission to view this page
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This area is restricted to approved Se2L App Managers and Super Admins.
            </p>
          </section>
        </main>
      );
    }
  }

  // Support BOTH rendering methods (Wrapper or Outlet) seamlessly
  return children ? <>{children}</> : <Outlet />;
}