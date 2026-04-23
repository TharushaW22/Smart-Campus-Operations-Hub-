import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_HOME = {
  USER: '/dashboard/user',
  ADMIN: '/dashboard/admin',
  TECHNICIAN: '/dashboard/technician',
}

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()

  if (user === undefined) return null // still loading

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />
  }

  return children
}
