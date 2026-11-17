import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { PageLoading } from '@/components/ui/States'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoading message="Vérification de la session…" />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role as UserRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
