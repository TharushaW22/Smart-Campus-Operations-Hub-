import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserManagement from '../components/UserManagement'
import TicketDetailModal from '../components/TicketDetailModal'
import NotificationBell from '../components/NotificationBell'
import ticketService from '../services/ticketService'
import { getBookingAnalytics } from '../services/bookingService'

const STATUS_STYLES = {
  OPEN:        'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED:    'bg-emerald-100 text-emerald-700',
  CLOSED:      'bg-slate-100 text-slate-500',
  REJECTED:    'bg-red-100 text-red-700',
}
const PRIORITY_STYLES = {
  LOW:      'bg-slate-100 text-slate-600',
  MEDIUM:   'bg-amber-50 text-amber-600',
  HIGH:     'bg-orange-100 text-orange-600',
  URGENT:   'bg-red-100 text-red-700',
  CRITICAL: 'bg-red-200 text-red-800',
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: 'bg-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100' },
    emerald:{ bg: 'bg-emerald-50',text: 'text-emerald-600',icon: 'bg-emerald-100' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: 'bg-amber-100' },
  }
  const c = colors[color] ?? colors.blue
  return (
    <div className={`${c.bg} shadow-xs border border-transparent rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300`}>
      <div className={`${c.icon} rounded-xl p-3 shrink-0`}>
        <span className={`${c.text} text-xl`}>{icon}</span>
      </div>
      <div>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab]           = useState('overview')
  const [tickets, setTickets]               = useState([])
  const [technicianList, setTechnicianList] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [stats, setStats]                   = useState({ users: 0, tickets: 0, technicians: 0, resolved: 0 })
  const [analytics, setAnalytics]           = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      axios.get('http://localhost:8080/api/admin/users', { headers }),
      ticketService.getAllTickets(),
    ]).then(([usersRes, ticketsData]) => {
      const users = usersRes.data
      setTechnicianList(users.filter(u => u.role === 'TECHNICIAN' || u.role === 'ADMIN'))
      setTickets(ticketsData)
      setStats({
        users: users.length,
        tickets: ticketsData.length,
        technicians: users.filter(u => u.role === 'TECHNICIAN').length,
        resolved: ticketsData.filter(t => t.status === 'RESOLVED').length,
      })
    }).catch(console.error)
  }, [])

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setAnalyticsLoading(true)
        const data = await getBookingAnalytics()
        setAnalytics(data)
      } catch (error) {
        setAnalyticsError(error.message || 'Failed to fetch analytics')
      } finally {
        setAnalyticsLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const handleTicketUpdated = (updated) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t))
    setSelectedTicket(updated)
    setStats(prev => ({
      ...prev,
      resolved: tickets.map(t => t.id === updated.id ? updated : t).filter(t => t.status === 'RESOLVED').length,
    }))
  }

  const navItems = [
    { id: 'overview', label: 'Overview',  icon: '🏠' },
    { id: 'users',    label: 'Users',     icon: '👥' },
    { id: 'tickets',  label: 'Tickets',   icon: '📋' },
    { id: 'requests', label: 'Requests',  icon: '📦' },
    { id: 'settings', label: 'Settings',  icon: '⚙️' },
  ]

  const TicketTable = ({ rows, limit }) => {
    const display = limit ? rows.slice(0, limit) : rows
    return (
      <div className="overflow-x-auto">
        {display.length === 0 ? (
          <div className="text-center py-16 text-slate-300 text-sm">No tickets found.</div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-1.5">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Reporter</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Assigned</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {display.map(ticket => (
                <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="group bg-white hover:bg-slate-50 transition-all cursor-pointer">
                  <td className="px-5 py-4 first:rounded-l-xl border-y border-l border-slate-50 group-hover:border-slate-100 text-[10px] font-mono text-slate-400 italic">#{ticket.id}</td>
                  <td className="px-5 py-4 border-y border-slate-50 group-hover:border-slate-100 text-xs font-bold text-slate-800">{ticket.creatorName}</td>
                  <td className="px-5 py-4 border-y border-slate-50 group-hover:border-slate-100 text-[11px] text-slate-500">{ticket.resourceLocation}</td>
                  <td className="px-5 py-4 border-y border-slate-50 group-hover:border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">{ticket.category}</td>
                  <td className="px-5 py-4 border-y border-slate-50 group-hover:border-slate-100">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${PRIORITY_STYLES[ticket.priority] || 'bg-slate-100 text-slate-500'}`}>{ticket.priority}</span>
                  </td>
                  <td className="px-5 py-4 border-y border-slate-50 group-hover:border-slate-100 text-xs text-slate-500">
                    {ticket.assignedTechnicianName || <span className="text-slate-300 italic">Unassigned</span>}
                  </td>
                  <td className="px-5 py-4 last:rounded-r-xl border-y border-r border-slate-50 group-hover:border-slate-100 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[ticket.status] || 'bg-slate-100'}`}>{ticket.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }

  const topResources = analytics?.topResources ?? []
  const peakHours    = analytics?.peakHours ?? []

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
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all duration-300 ${
                activeTab === item.id ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
          <Link to="/admin/resources" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-300">
            <span>📦</span>Resources
          </Link>
          <Link to="/admin/bookings" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-300">
            <span>📅</span>Bookings
          </Link>
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
          <header className="px-10 py-8 flex items-center justify-between border-b border-slate-50 sticky top-0 z-20 backdrop-blur-xl bg-white/70">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{activeTab}</h1>
              <p className="text-slate-400 text-xs font-bold mt-1">Administrator Portal • Real-time Operations</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <Link to="/admin/resources/add" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Resource
              </Link>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-slate-900/10">Admin</span>
            </div>
          </header>

          <div className="px-10 py-10 space-y-10">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Total Users"     value={stats.users}       icon="👥" color="blue" />
                  <StatCard label="Total Tickets"   value={stats.tickets}     icon="📋" color="amber" />
                  <StatCard label="Technicians"     value={stats.technicians} icon="🔧" color="purple" />
                  <StatCard label="Resolved"        value={stats.resolved}    icon="✅" color="emerald" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Total Bookings"    value={analytics?.totalBookings ?? '—'}          icon="📊" color="blue" />
                  <StatCard label="Approved Bookings" value={analytics?.approvedBookings ?? '—'}       icon="✅" color="emerald" />
                  <StatCard label="Pending Bookings"  value={analytics?.pendingBookings ?? '—'}        icon="⏳" color="amber" />
                  <StatCard label="Resources Used"    value={analytics?.uniqueResourcesBooked ?? '—'} icon="🏷️" color="purple" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-800">Top Resources</h2>
                        <p className="text-sm text-slate-500 mt-1">Most booked resources by count.</p>
                      </div>
                      {analyticsLoading && <p className="text-sm text-slate-400">Loading…</p>}
                    </div>
                    {analyticsError && <p className="text-red-600 text-sm mb-4">{analyticsError}</p>}
                    {topResources.length > 0 ? (
                      <div className="space-y-4">
                        {topResources.map((resource) => {
                          const maxCount = topResources[0]?.bookingCount || 1
                          const width = Math.max(10, Math.round((resource.bookingCount / maxCount) * 100))
                          return (
                            <div key={resource.resourceName}>
                              <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                                <span>{resource.resourceName}</span>
                                <span className="font-semibold text-slate-800">{resource.bookingCount}</span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full bg-purple-600" style={{ width: `${width}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">No booking data available yet.</p>
                    )}
                  </div>

                  <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-800">Peak Booking Hours</h2>
                        <p className="text-sm text-slate-500 mt-1">Hours with the most bookings.</p>
                      </div>
                      {analyticsLoading && <p className="text-sm text-slate-400">Loading…</p>}
                    </div>
                    {analyticsError && <p className="text-red-600 text-sm mb-4">{analyticsError}</p>}
                    {peakHours.length > 0 ? (
                      <div className="space-y-3">
                        {peakHours.map((hour) => (
                          <div key={hour.hourLabel} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <span className="text-sm font-medium text-slate-700">{hour.hourLabel}</span>
                            <span className="text-sm text-slate-500">{hour.bookings} bookings</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">No booking hour data available yet.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Tickets</h2>
                      <p className="text-slate-400 text-[11px] mt-1">Click a row to view full details</p>
                    </div>
                    <button onClick={() => setActiveTab('tickets')} className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-black text-slate-700 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                      View All
                    </button>
                  </div>
                  <div className="p-6"><TicketTable rows={tickets} limit={5} /></div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">User Directory</h2>
                </div>
                <div className="p-6"><UserManagement /></div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">All Incident Tickets</h2>
                  <p className="text-slate-400 text-[11px] mt-1">Click a row to assign technician, update status, or view comments</p>
                </div>
                <div className="p-6"><TicketTable rows={tickets} /></div>
              </div>
            )}

            {(activeTab === 'requests' || activeTab === 'settings') && (
              <div className="text-center py-32 bg-slate-50/30 rounded-[2rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-sm border border-slate-100 mx-auto mb-6">✨</div>
                <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-2">Coming Soon</h3>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wide">This module is being developed.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          currentUser={user}
          viewerRole="admin"
          technicianList={technicianList}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdated={handleTicketUpdated}
        />
      )}
    </div>
  )
}
