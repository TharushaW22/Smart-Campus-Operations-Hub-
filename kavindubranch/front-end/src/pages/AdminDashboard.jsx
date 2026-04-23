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

// Styling classes for different ticket statuses
const STATUS_STYLES = {
  OPEN:        'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED:    'bg-emerald-100 text-emerald-700',
  CLOSED:      'bg-slate-100 text-slate-500',
  REJECTED:    'bg-red-100 text-red-700',
}

// Styling classes for different ticket priorities
const PRIORITY_STYLES = {
  LOW:      'bg-slate-100 text-slate-600',
  MEDIUM:   'bg-amber-50 text-amber-600',
  HIGH:     'bg-orange-100 text-orange-600',
  URGENT:   'bg-red-100 text-red-700',
  CRITICAL: 'bg-red-200 text-red-800',
}

// Reusable stat card component for dashboard metrics
function StatCard({ label, value, icon, color }) {

  // Color themes for cards
  const colors = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: 'bg-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100' },
    emerald:{ bg: 'bg-emerald-50',text: 'text-emerald-600',icon: 'bg-emerald-100' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: 'bg-amber-100' },
  }

  const c = colors[color] ?? colors.blue

  return (
    <div className={`${c.bg} shadow-xs border rounded-2xl p-5 flex items-center gap-4`}>
      {/* Icon */}
      <div className={`${c.icon} rounded-xl p-3`}>
        <span className={`${c.text} text-xl`}>{icon}</span>
      </div>

      {/* Value and label */}
      <div>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {

  // Auth context for user info and logout
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // UI state for active tab
  const [activeTab, setActiveTab] = useState('overview')

  // Data states
  const [tickets, setTickets] = useState([])
  const [technicianList, setTechnicianList] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)

  // Statistics state
  const [stats, setStats] = useState({
    users: 0,
    tickets: 0,
    technicians: 0,
    resolved: 0
  })

  // Booking analytics state
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState(null)

  // Load users and tickets on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      axios.get('http://localhost:8080/api/admin/users', { headers }),
      ticketService.getAllTickets(),
    ])
    .then(([usersRes, ticketsData]) => {

      const users = usersRes.data

      // Filter technicians and admins
      setTechnicianList(users.filter(u => u.role === 'TECHNICIAN' || u.role === 'ADMIN'))

      setTickets(ticketsData)

      // Set dashboard statistics
      setStats({
        users: users.length,
        tickets: ticketsData.length,
        technicians: users.filter(u => u.role === 'TECHNICIAN').length,
        resolved: ticketsData.filter(t => t.status === 'RESOLVED').length,
      })
    })
    .catch(console.error)

  }, [])

  // Load booking analytics
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

  // Handle ticket updates
  const handleTicketUpdated = (updated) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t))
    setSelectedTicket(updated)

    // Update resolved count
    setStats(prev => ({
      ...prev,
      resolved: tickets
        .map(t => t.id === updated.id ? updated : t)
        .filter(t => t.status === 'RESOLVED').length,
    }))
  }

  // Sidebar navigation items
  const navItems = [
    { id: 'overview', label: 'Overview',  icon: '🏠' },
    { id: 'users',    label: 'Users',     icon: '👥' },
    { id: 'tickets',  label: 'Tickets',   icon: '📋' },
    { id: 'requests', label: 'Requests',  icon: '📦' },
    { id: 'settings', label: 'Settings',  icon: '⚙️' },
  ]

  // Ticket table component
  const TicketTable = ({ rows, limit }) => {

    // Limit rows if needed
    const display = limit ? rows.slice(0, limit) : rows

    return (
      <div>
        {display.length === 0 ? (
          // Empty state
          <div>No tickets found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Reporter</th>
                <th>Location</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Assigned</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {display.map(ticket => (
                <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)}>
                  
                  {/* Ticket details */}
                  <td>#{ticket.id}</td>
                  <td>{ticket.creatorName}</td>
                  <td>{ticket.resourceLocation}</td>
                  <td>{ticket.category}</td>

                  {/* Priority badge */}
                  <td>
                    <span className={PRIORITY_STYLES[ticket.priority]}>
                      {ticket.priority}
                    </span>
                  </td>

                  {/* Assigned technician */}
                  <td>
                    {ticket.assignedTechnicianName || 'Unassigned'}
                  </td>

                  {/* Status badge */}
                  <td>
                    <span className={STATUS_STYLES[ticket.status]}>
                      {ticket.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }

  // Extract analytics data
  const topResources = analytics?.topResources ?? []
  const peakHours    = analytics?.peakHours ?? []

  return (
    <div className="flex">

      {/* Sidebar */}
      <aside>
        {/* Navigation buttons */}
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}>
            {item.icon} {item.label}
          </button>
        ))}

        {/* Extra links */}
        <Link to="/admin/resources">Resources</Link>
        <Link to="/admin/bookings">Bookings</Link>

        {/* Profile and logout */}
        <button onClick={() => navigate('/profile')}>
          {user?.name}
        </button>

        <button onClick={logout}>
          Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main>

        {/* Header */}
        <header>
          <h1>{activeTab}</h1>
          <NotificationBell />
        </header>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats cards */}
            <StatCard label="Total Users" value={stats.users} icon="👥" />
            <StatCard label="Total Tickets" value={stats.tickets} icon="📋" />

            {/* Analytics */}
            {analyticsLoading && <p>Loading…</p>}
            {analyticsError && <p>{analyticsError}</p>}

            {/* Top resources */}
            {topResources.map(r => (
              <div key={r.resourceName}>
                {r.resourceName} - {r.bookingCount}
              </div>
            ))}

            {/* Peak hours */}
            {peakHours.map(h => (
              <div key={h.hourLabel}>
                {h.hourLabel} - {h.bookings}
              </div>
            ))}

            {/* Recent tickets */}
            <TicketTable rows={tickets} limit={5} />
          </>
        )}

        {/* Users tab */}
        {activeTab === 'users' && <UserManagement />}

        {/* Tickets tab */}
        {activeTab === 'tickets' && <TicketTable rows={tickets} />}

      </main>

      {/* Ticket detail modal */}
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