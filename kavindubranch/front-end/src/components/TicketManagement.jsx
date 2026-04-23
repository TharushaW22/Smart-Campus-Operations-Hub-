import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ticketService from '../services/ticketService'
import TicketDetailModal from './TicketDetailModal'

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

/**
 * Reusable ticket table used by AdminDashboard.
 * Props:
 *   limit          – optional max rows to show
 *   technicianList – passed through to the detail modal (admin only)
 */
export default function TicketManagement({ limit, technicianList = [] }) {
  const { user } = useAuth()
  const [tickets, setTickets]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    ticketService.getAllTickets()
      .then(setTickets)
      .catch(() => setError('Failed to load tickets.'))
      .finally(() => setLoading(false))
  }, [])

  const handleTicketUpdated = (updated) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t))
    setSelectedTicket(updated)
  }

  if (loading) return <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] animate-pulse p-6">Loading tickets…</p>
  if (error)   return <p className="text-red-500 text-sm font-bold p-6">{error}</p>

  const display = limit ? tickets.slice(0, limit) : tickets

  return (
    <>
      <div className="overflow-x-auto">
        {display.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/20 rounded-3xl border border-dashed border-slate-100">
            <div className="text-3xl mb-4 opacity-20">📋</div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No tickets found</p>
          </div>
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
                <tr
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="group bg-white hover:bg-slate-50/80 transition-all duration-300 cursor-pointer"
                >
                  <td className="px-5 py-4 first:rounded-l-2xl border-y border-l border-slate-50 group-hover:border-slate-100 italic font-mono text-[10px] text-slate-400">#{ticket.id}</td>
                  <td className="px-5 py-4 border-y border-slate-50 group-hover:border-slate-100 text-xs font-bold text-slate-800">{ticket.creatorName}</td>
                  <td className="px-5 py-4 border-y border-slate-50 group-hover:border-slate-100 text-[11px] text-slate-500">{ticket.resourceLocation}</td>
                  <td className="px-5 py-4 border-y border-slate-50 group-hover:border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">{ticket.category}</td>
                  <td className="px-5 py-4 border-y border-slate-50 group-hover:border-slate-100">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${PRIORITY_STYLES[ticket.priority] || 'bg-slate-100 text-slate-500'}`}>{ticket.priority}</span>
                  </td>
                  <td className="px-5 py-4 border-y border-slate-50 group-hover:border-slate-100 text-[11px] text-slate-500">
                    {ticket.assignedTechnicianName || <span className="text-slate-300 italic">Unassigned</span>}
                  </td>
                  <td className="px-5 py-4 last:rounded-r-2xl border-y border-r border-slate-50 group-hover:border-slate-100 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[ticket.status] || 'bg-slate-100'}`}>{ticket.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
    </>
  )
}
