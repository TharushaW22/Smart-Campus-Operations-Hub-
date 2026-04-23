import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ticketService from '../services/ticketService'
import TicketDetailModal from '../components/TicketDetailModal'
import NotificationBell from '../components/NotificationBell'

const STATUS_STYLES = {
  OPEN:        'bg-amber-50 text-amber-600 border border-amber-100',
  IN_PROGRESS: 'bg-blue-50 text-blue-600 border border-blue-100',
  RESOLVED:    'bg-emerald-50 text-emerald-600 border border-emerald-100',
  CLOSED:      'bg-slate-50 text-slate-400 border border-slate-100',
  REJECTED:    'bg-red-50 text-red-600 border border-red-100',
}

const PRIORITY_STYLES = {
  LOW:      'bg-slate-50 text-slate-500 border border-slate-100',
  MEDIUM:   'bg-amber-50 text-amber-600 border border-amber-100',
  HIGH:     'bg-orange-50 text-orange-600 border border-orange-100',
  URGENT:   'bg-red-50 text-red-600 border border-red-100',
  CRITICAL: 'bg-red-100 text-red-700 border border-red-200',
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue:   { bg: 'bg-white', icon: 'bg-blue-50' },
    emerald:{ bg: 'bg-white', icon: 'bg-emerald-50' },
    amber:  { bg: 'bg-white', icon: 'bg-amber-50' },
    slate:  { bg: 'bg-white', icon: 'bg-slate-50' },
  }
  const c = colors[color] ?? colors.blue
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 flex items-center gap-4 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
      <div className={`${c.icon} w-12 h-12 rounded-2xl flex items-center justify-center shrink-0`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1.5">{label}</p>
      </div>
    </div>
  )
}

function NewTicketForm({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [images, setImages] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.target)
    const data = {
      resourceLocation: formData.get('resourceLocation'),
      category: formData.get('category'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      preferredContactDetails: formData.get('preferredContactDetails'),
      images,
    }
    try {
      await ticketService.createTicket(data)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3)
    setImages(files)
    setPreviewUrls(files.map(f => URL.createObjectURL(f)))
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 px-10 py-8 text-white">
        <h2 className="text-2xl font-black tracking-tight">Report Issue</h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Campus Maintenance & Support</p>
      </div>
      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
            <input required name="resourceLocation" placeholder="e.g. Lab 2, Building B" className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-hidden bg-slate-50/50 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
            <select required name="category" className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-hidden bg-slate-50/50 text-sm">
              <option value="">Select Category</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="FURNITURE">Furniture</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
            <select required name="priority" className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-hidden bg-slate-50/50 text-sm">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Method</label>
            <input required name="preferredContactDetails" placeholder="Email or Ext." className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-hidden bg-slate-50/50 text-sm" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brief Description</label>
          <textarea required name="description" rows={3} placeholder="Describe the issue..." className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-hidden bg-slate-50/50 text-sm resize-none"></textarea>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attachments</label>
          <div className="flex flex-wrap gap-3">
            <label className="w-24 h-24 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/30 transition-all group">
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              <span className="text-xl text-slate-300 group-hover:text-blue-500">+</span>
            </label>
            {previewUrls.map((url, i) => (
              <img key={i} src={url} alt="" className="w-24 h-24 rounded-2xl object-cover border border-slate-100 shadow-sm" />
            ))}
          </div>
        </div>
        <button disabled={loading} className="w-full py-4 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98]">
          {loading ? 'Submitting...' : 'Send Request'}
        </button>
      </form>
    </div>
  )
}

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tickets, setTickets]               = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [activeTab, setActiveTab]           = useState('overview')

  useEffect(() => {
    const tab = (searchParams.get('tab') ?? '').toLowerCase()
    if (tab === 'overview' || tab === 'tickets' || tab === 'new') {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    ticketService.getMyTickets().then(setTickets).catch(console.error)
  }, [])

  const handleTicketUpdated = (updated) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t))
    setSelectedTicket(updated)
  }

  const handleTicketCreated = () => {
    ticketService.getMyTickets().then(setTickets).catch(console.error)
    setActiveTab('tickets')
  }

  const stats = {
    total:      tickets.length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved:   tickets.filter(t => t.status === 'RESOLVED').length,
    open:       tickets.filter(t => t.status === 'OPEN').length,
  }

  const navItems = [
    { id: 'overview', label: 'Dashboard',    icon: '🏠' },
    { id: 'tickets',  label: 'My Tickets',   icon: '📋' },
    { id: 'new',      label: 'Report Issue', icon: '➕' },
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
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}>
              <span className="text-sm opacity-80">{item.icon}</span>{item.label}
            </button>
          ))}
          <Link to="/resources" className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all">
            <span className="text-sm opacity-80">📦</span>Resources
          </Link>
          <Link to="/bookings/my" className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all">
            <span className="text-sm opacity-80">📅</span>My Bookings
          </Link>
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
          <div className="max-w-(--breakpoint-2xl) mx-auto px-10 py-10">
            <header className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">
                  {activeTab === 'new' ? 'Report Issue' : activeTab === 'overview' ? 'Overview' : 'My Tickets'}
                </h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-1.5">Campus Logistics • System v1.2</p>
              </div>
              <div className="flex items-center gap-4">
                <NotificationBell />
                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                <span className="px-4 py-2 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em]">User</span>
              </div>
            </header>

            <div className="space-y-8">
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="My Total"   value={stats.total}      icon="📋" color="blue" />
                    <StatCard label="Waiting"    value={stats.open}       icon="📂" color="slate" />
                    <StatCard label="In Progress" value={stats.inProgress} icon="⏳" color="amber" />
                    <StatCard label="Resolved"   value={stats.resolved}   icon="✅" color="emerald" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center border border-slate-800 min-h-75">
                      <div className="relative z-10 space-y-4">
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">Active Support</div>
                        <h2 className="text-4xl font-black tracking-tight leading-tight">Fast Incident<br/>Response</h2>
                        <p className="text-slate-400 text-sm font-medium max-w-sm">Report campus infrastructure issues and our technicians will be deployed instantly.</p>
                        <button onClick={() => setActiveTab('new')} className="px-8 py-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95">
                          New Incident Report
                        </button>
                      </div>
                      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 text-[20rem] opacity-5 grayscale select-none pointer-events-none rotate-12">🏢</div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col">
                      <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em]">Recent</h2>
                        <button onClick={() => setActiveTab('tickets')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Journal</button>
                      </div>
                      <div className="flex-1 overflow-y-auto min-h-0">
                        {tickets.slice(0, 3).length > 0 ? tickets.slice(0, 3).map(t => (
                          <div key={t.id} onClick={() => setSelectedTicket(t)} className="px-8 py-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 cursor-pointer flex items-center justify-between group transition-all">
                            <div className="space-y-1 min-w-0">
                              <p className="text-xs font-black text-slate-800 group-hover:text-blue-600 truncate">{t.category}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">#{t.id} · {new Date(t.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${STATUS_STYLES[t.status]?.split(' ')[0] || 'bg-slate-200'} ml-3`}></div>
                          </div>
                        )) : (
                          <div className="h-full flex items-center justify-center py-10 text-slate-300 text-[10px] font-black uppercase tracking-widest">Clean</div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'tickets' && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white">
                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Maintenance Ledger</h2>
                    <button onClick={() => setActiveTab('new')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                      <span>+</span>Report Issue
                    </button>
                  </div>
                  {tickets.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.25em]">
                            <th className="px-10 py-6">Reference</th>
                            <th className="px-10 py-6">Details</th>
                            <th className="px-10 py-6 text-center">Status</th>
                            <th className="px-10 py-6 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {tickets.map(t => (
                            <tr key={t.id} onClick={() => setSelectedTicket(t)} className="hover:bg-slate-50/50 cursor-pointer group transition-all">
                              <td className="px-10 py-6 text-[10px] font-mono text-slate-400 italic font-bold">#{t.id}</td>
                              <td className="px-10 py-6">
                                <p className="text-xs font-black text-slate-800">{t.category}</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{t.resourceLocation}</p>
                              </td>
                              <td className="px-10 py-6 text-center">
                                <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${STATUS_STYLES[t.status]}`}>{t.status}</span>
                              </td>
                              <td className="px-10 py-6 text-right text-[10px] font-bold text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-32 text-center text-slate-300 font-black uppercase tracking-widest italic">Ledger Empty</div>
                  )}
                </div>
              )}

              {activeTab === 'new' && (
                <div className="max-w-3xl mx-auto">
                  <NewTicketForm onSuccess={handleTicketCreated} />
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
          viewerRole="user"
          onClose={() => setSelectedTicket(null)}
          onTicketUpdated={handleTicketUpdated}
        />
      )}
    </div>
  )
}
