import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-8">
        <div className="flex items-center gap-4 mb-6">
          {user?.picture && (
            <img src={user.picture} alt="avatar" className="w-12 h-12 rounded-full" />
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
