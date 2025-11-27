import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, requireAdmin = false, requireSuperAdmin = false }) {
  const { isAuthenticated, isAdmin, isSuperAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barber-gold mx-auto mb-4"></div>
          <p className="text-black">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    // Redirect to admin login if trying to access admin routes
    if (requireAdmin || requireSuperAdmin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />
    }
    return <Navigate to="/login" replace />
  }

  if (requireSuperAdmin && !isSuperAdmin()) {
    return <Navigate to="/" replace />
  }

  if (requireAdmin && !isAdmin() && !isSuperAdmin()) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

