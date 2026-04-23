export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full opacity-5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full opacity-5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
          {/* Logo / Brand */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-5 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Smart Campus</h1>
            <p className="text-slate-400 text-sm mt-1">Operations Management System</p>
          </div>

          {/* Sign in section */}
          <div className="space-y-4">
            <p className="text-center text-slate-400 text-sm font-medium uppercase tracking-widest">Sign in to continue</p>
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 w-full px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
          </div>

          <p className="text-center text-slate-600 text-xs mt-8">
            Access is granted based on your assigned role.
          </p>
        </div>
      </div>
    </div>
  )
}
