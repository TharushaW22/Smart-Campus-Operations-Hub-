import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

function useQueryParam(name) {
  const { search } = useLocation()
  try {
    return new URLSearchParams(search).get(name)
  } catch {
    return null
  }
}

function UserShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const tab = useQueryParam('tab')

  const pathname = location.pathname

  const navItems = [
    {
      label: 'Dashboard',
      icon: '🏠',
      to: '/dashboard/user?tab=overview',
      active: pathname === '/dashboard/user' && (!tab || tab === 'overview'),
    },
    {
      label: 'My Tickets',
      icon: '📋',
      to: '/dashboard/user?tab=tickets',
      active: pathname === '/dashboard/user' && tab === 'tickets',
    },
    {
      label: 'Report Issue',
      icon: '➕',
      to: '/dashboard/user/report-incident',
      active: pathname === '/dashboard/user/report-incident',
    },
    {
      label: 'Resources',
      icon: '📦',
      to: '/resources',
      active: pathname.startsWith('/resources'),
    },
    {
      label: 'My Bookings',
      icon: '📅',
      to: '/bookings/my',
      active: pathname.startsWith('/bookings'),
    },
  ]

  return (
    <div className="h-screen bg-slate-900 flex font-sans overflow-hidden">
      <aside className="w-64 flex flex-col h-full shrink-0 border-r border-slate-800/50 bg-slate-900">
        <div className="px-8 py-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <p className="text-white font-black text-xs tracking-tight">Smart Campus</p>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">User Operations</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden min-h-0">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cx(
                'w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all',
                item.active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              )}
            >
              <span className="text-sm opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 shrink-0 bg-slate-900 border-t border-slate-800/50">
          <div className="bg-slate-800/40 rounded-[2rem] p-4 border border-slate-800/50 backdrop-blur-md shadow-inner">
            <button onClick={() => navigate('/profile')} className="flex items-center gap-3 mb-4 w-full text-left hover:opacity-80 transition-opacity">
              <div className="relative shrink-0">
                {user?.picture
                  ? <img src={user.picture.startsWith('http') ? user.picture : `http://localhost:8080${user.picture}`} alt="" className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover" />
                  : <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-black text-xs">{user?.name?.[0]}</div>
                }
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-800 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-black truncate leading-tight">{user?.name?.split(' ')[0]}</p>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">Student</p>
              </div>
              <svg className="w-3 h-3 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={logout} className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-slate-900/50 hover:bg-red-500/10 text-slate-500 hover:text-white border border-slate-800 group transition-all">
              <svg className="w-3.5 h-3.5 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-white rounded-l-[3.5rem] my-2 ml-2 transition-all duration-500 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.1)]">
        <div className="flex-1 overflow-auto bg-slate-50/30">
          <div className="max-w-(--breakpoint-2xl) mx-auto px-6 py-6 lg:px-10 lg:py-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

function AdminShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const pathname = location.pathname

  const links = [
    { label: 'Dashboard', icon: '🏠', to: '/dashboard/admin', active: pathname === '/dashboard/admin' },
    { label: 'Resources', icon: '📦', to: '/admin/resources', active: pathname.startsWith('/admin/resources') },
    { label: 'Bookings', icon: '📅', to: '/admin/bookings', active: pathname.startsWith('/admin/bookings') },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0 overflow-y-auto h-screen sticky top-0">
        <div className="px-6 py-8 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Smart Campus</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Admin Control</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-8 space-y-1">
          {links.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all duration-300',
                item.active
                  ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-slate-800/50">
          <button onClick={() => navigate('/profile')} className="flex items-center gap-3 px-3 py-2 mb-3 w-full text-left hover:bg-slate-800/50 rounded-xl transition-all">
            {user?.picture
              ? <img src={user.picture.startsWith('http') ? user.picture : `http://localhost:8080${user.picture}`} alt="" className="w-9 h-9 rounded-full ring-2 ring-purple-500/30 object-cover shrink-0" />
              : <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-purple-400 flex items-center justify-center text-white font-black text-xs shrink-0">{user?.name?.[0]}</div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{user?.name}</p>
              <p className="text-slate-500 text-[10px] truncate">{user?.email}</p>
            </div>
            <svg className="w-3 h-3 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/20 text-[11px] font-bold transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-50 lg:p-4">
        <div className="min-h-full bg-white lg:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col">
          <div className="px-6 py-6 lg:px-10 lg:py-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

function TechnicianShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const pathname = location.pathname

  const links = [
    { label: 'Portal', icon: '📌', to: '/dashboard/technician', active: pathname === '/dashboard/technician' },
    { label: 'Resources', icon: '📦', to: '/resources', active: pathname.startsWith('/resources') },
    { label: 'Bookings', icon: '📅', to: '/bookings/my', active: pathname.startsWith('/bookings') },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0 h-screen sticky top-0">
        <div className="px-6 py-8 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-orange-500 to-orange-700 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Smart Campus</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Operations</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-8 space-y-1">
          {links.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all duration-300',
                item.active
                  ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-slate-800/50">
          <button onClick={() => navigate('/profile')} className="flex items-center gap-3 px-3 py-2 mb-3 w-full text-left hover:bg-slate-800/50 rounded-xl transition-all">
            {user?.picture
              ? <img src={user.picture.startsWith('http') ? user.picture : `http://localhost:8080${user.picture}`} alt="" className="w-9 h-9 rounded-full ring-2 ring-orange-500/30 object-cover shrink-0" />
              : <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white font-black text-xs shrink-0">{user?.name?.[0]}</div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{user?.name}</p>
              <p className="text-slate-500 text-[10px] truncate">{user?.email}</p>
            </div>
            <svg className="w-3 h-3 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/20 text-[11px] font-bold transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-50 lg:p-4">
        <div className="min-h-full bg-white lg:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col">
          <div className="px-6 py-6 lg:px-10 lg:py-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function RoleSidebarLayout({ children }) {
  const { user } = useAuth()
  const role = user?.role

  if (role === 'ADMIN') return <AdminShell>{children}</AdminShell>
  if (role === 'TECHNICIAN') return <TechnicianShell>{children}</TechnicianShell>
  return <UserShell>{children}</UserShell>
}
