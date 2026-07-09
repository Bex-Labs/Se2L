// src/App.tsx

import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'; // removed the 's'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import AppManagerPage from './pages/AppManagerPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'
import OnboardingPage from './pages/OnboardingPage'
import ResourcesPage from './pages/ResourcesPage'
import SuperAdminPage from './pages/SuperAdminPage'
import TaskDetailPage from './pages/TaskDetailPage'

type RedirectIfAuthenticatedProps = {
  children: React.ReactNode
}

function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const { session, loading } = useAuth()

  if (loading) {
    return null
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/auth"
          element={
            <RedirectIfAuthenticated>
              <AuthPage />
            </RedirectIfAuthenticated>
          }
        />

        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <AuthPage />
            </RedirectIfAuthenticated>
          }
        />

        <Route element={<AppLayout />}>
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/tasks/:taskId"
            element={
              <ProtectedRoute>
                <TaskDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/app-manager"
            element={
              <ProtectedRoute allowedRoles={['app_manager', 'super_admin']}>
                <AppManagerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </main>
  )
}

export default App