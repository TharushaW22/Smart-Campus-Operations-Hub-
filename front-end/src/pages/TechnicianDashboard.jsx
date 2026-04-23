import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ticketService from '../services/ticketService'
import TicketDetailModal from '../components/TicketDetailModal'
import NotificationBell from '../components/NotificationBell'

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
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'bg-orange-100' },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: 'bg-blue-100' },
    emerald:{ bg: 'bg-emerald-50',text: 'text-emerald-600',icon: 'bg-emerald-100' },
    slate:  { bg: 'bg-slate-50',  text: 'text-slate-600',  icon: 'bg-slate-100' },
  }
  const c = colors[color] ?? colors.orange
  return (
    <div className={`${c.bg} rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform`}>
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

export default function TechnicianDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState('queue')
  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    ticketService.getAssignedTickets()
      .then(setTickets)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleTicketUpdated = (updated) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t))
    setSelectedTicket(updated)
  }

  const assigned   = tickets.length
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length
  const resolved   = tickets.filter(t => t.status === 'RESOLVED').length
  const open       = tickets.filter(t => t.status === 'OPEN').length

  const navItems = [
    { id: 'queue',    label: 'My Queue',  icon: '📌' },
    { id: 'resolved', label: 'Resolved',  icon: '✅' },
  ]

  const displayTickets = activeTab === 'resolved'
    ? tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED')
    : tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED')

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
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
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-slate-800/50">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 px-3 py-2 mb-3 w-full text-left hover:bg-slate-800/50 rounded-xl transition-all"
          >
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

      {/* Main */}
      <main className="flex-1 overflow-auto bg-slate-50 lg:p-4">
        <div className="min-h-full bg-white lg:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col">
          <header className="px-10 py-8 flex items-center justify-between border-b border-slate-50 sticky top-0 z-20 backdrop-blur-xl bg-white/70">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Technician Portal</h1>
              <p className="text-slate-400 text-xs font-bold mt-1">Welcome, {user?.name?.split(' ')[0]} — Your assigned work queue</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-orange-600/20">
                Technician
              </span>
            </div>
          </header>

          <div className="px-10 py-10 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Assigned"    value={assigned}   icon="📌" color="orange" />
              <StatCard label="Open"        value={open}       icon="📂" color="slate" />
              <StatCard label="In Progress" value={inProgress} icon="⚙️" color="blue" />
              <StatCard label="Resolved"    value={resolved}   icon="✅" color="emerald" />
            </div>

            {/* Ticket queue */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  {activeTab === 'queue' ? 'Active Work Queue' : 'Resolved Tickets'}
                </h2>
                <p className="text-slate-400 text-[11px] mt-1">Click a ticket to update status, add notes, or comment</p>
              </div>

              {loading ? (
                <div className="py-20 text-center text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">Loading queue...</div>
              ) : displayTickets.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <p className="text-slate-500 font-bold text-sm">
                    {activeTab === 'queue' ? 'No active tickets assigned to you.' : 'No resolved tickets yet.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto p-2">
                  <table className="w-full text-left border-separate border-spacing-y-1.5">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Location</th>
                        <th className="px-5 py-3">Reporter</th>
                        <th className="px-5 py-3">Priority</th>
                        <th className="px-5 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayTickets.map(ticket => (
                        <tr
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className="group bg-slate-50/50 hover:bg-orange-50/50 transition-all cursor-pointer"
                        >
                          <td className="px-5 py-4 first:rounded-l-xl border-y border-l border-slate-100 group-hover:border-orange-100 text-[10px] font-mono text-slate-400 italic">#{ticket.id}</td>
                          <td className="px-5 py-4 border-y border-slate-100 group-hover:border-orange-100 text-xs font-bold text-slate-800">{ticket.category}</td>
                          <td className="px-5 py-4 border-y border-slate-100 group-hover:border-orange-100 text-[11px] text-slate-500">{ticket.resourceLocation}</td>
                          <td className="px-5 py-4 border-y border-slate-100 group-hover:border-orange-100 text-[11px] text-slate-600">{ticket.creatorName}</td>
                          <td className="px-5 py-4 border-y border-slate-100 group-hover:border-orange-100">
                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${PRIORITY_STYLES[ticket.priority] || 'bg-slate-100 text-slate-500'}`}>{ticket.priority}</span>
                          </td>
                          <td className="px-5 py-4 last:rounded-r-xl border-y border-r border-slate-100 group-hover:border-orange-100 text-center">
                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[ticket.status] || 'bg-slate-100'}`}>{ticket.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          currentUser={user}
          viewerRole="technician"
          onClose={() => setSelectedTicket(null)}
          onTicketUpdated={handleTicketUpdated}
        />
      )}
    </div>
  )
}
