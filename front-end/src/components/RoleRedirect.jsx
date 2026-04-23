import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_HOME = {
  USER: '/dashboard/user',
  ADMIN: '/dashboard/admin',
  TECHNICIAN: '/dashboard/technician',
}

export default function RoleRedirect() {
  const { user } = useAuth()

  if (user === undefined) return null // still loading

  if (!user) return <Navigate to="/login" replace />

  return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />
}
