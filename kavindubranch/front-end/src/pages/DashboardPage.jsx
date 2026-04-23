import { useAuth } from '../context/AuthContext'

// Dashboard page component
export default function DashboardPage() {

  // Get logged-in user data and logout function from AuthContext
  const { user, logout } = useAuth()

  return (
    // Main container with full height and background styling
    <div className="min-h-screen bg-gray-50 p-8">

      {/* Centered card container */}
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-8">

        {/* User info section */}
        <div className="flex items-center gap-4 mb-6">

          {/* Display user profile picture if available */}
          {user?.picture && (
            <img
              src={user.picture}
              alt="avatar"
              className="w-12 h-12 rounded-full"
            />
          )}

          {/* User details */}
          <div>
            {/* User name */}
            <h1 className="text-xl font-bold text-gray-800">
              {user?.name}
            </h1>

            {/* User email */}
            <p className="text-sm text-gray-500">
              {user?.email}
            </p>

            {/* User role badge */}
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout} // Call logout function on click
          className="w-full py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
        >
          Sign out
        </button>

      </div>
    </div>
  )
}