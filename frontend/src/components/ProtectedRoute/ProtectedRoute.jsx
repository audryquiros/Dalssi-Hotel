import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import './ProtectedRoute.css'

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="protected-loading"><div className="protected-spinner" /><p>Preparando tu experiencia en Dalssi...</p></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user.tipo_usuario !== role) return <Navigate to={user.tipo_usuario === 'empleado' ? '/admin' : '/cliente'} replace />
  return <Outlet />
}
