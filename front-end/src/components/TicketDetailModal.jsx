import { useState } from 'react'
import ticketService from '../services/ticketService'
import TicketComments from './TicketComments'

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

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

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

/**
 * Shared ticket detail modal used across all 3 dashboards.
 *
 * Props:
 *  ticket          – initial ticket object  (required)
 *  currentUser     – user object from AuthContext
 *  viewerRole      – 'admin' | 'technician' | 'user'
 *  technicianList  – array of technician users (admin only, else [])
 *  onClose         – () => void
 *  onTicketUpdated – (updatedTicket) => void
 */
export default function TicketDetailModal({
  ticket: initialTicket,
  currentUser,
  viewerRole = 'user',
  technicianList = [],
  onClose,
  onTicketUpdated,
}) {
  const [ticket, setTicket]           = useState(initialTicket)
  const [previewImage, setPreviewImage] = useState(null)
  const [activeTab, setActiveTab]     = useState('details')

  // Status update form (admin + technician)
  const [statusForm, setStatusForm] = useState({
    status:          ticket.status,
    resolutionNote:  ticket.resolutionNote || '',
    rejectionReason: ticket.rejectionReason || '',
  })
  const [assignId, setAssignId] = useState(ticket.assignedTechnicianId || '')
  const [submitting, setSubmitting] = useState(false)
  const [updateMsg, setUpdateMsg]   = useState(null)

  if (!ticket) return null

  const handleStatusUpdate = async () => {
    setSubmitting(true)
    setUpdateMsg(null)
    try {
      const payload = { status: statusForm.status }
      if (statusForm.resolutionNote) payload.resolutionNote = statusForm.resolutionNote
      if (statusForm.rejectionReason) payload.rejectionReason = statusForm.rejectionReason
      const updated = await ticketService.updateTicket(ticket.id, payload)
      setTicket(updated)
      setUpdateMsg({ type: 'ok', text: 'Ticket updated successfully.' })
      if (onTicketUpdated) onTicketUpdated(updated)
    } catch {
      setUpdateMsg({ type: 'err', text: 'Failed to update ticket.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssign = async () => {
    if (!assignId) return
    setSubmitting(true)
    setUpdateMsg(null)
    try {
      const updated = await ticketService.assignTechnician(ticket.id, Number(assignId))
      setTicket(updated)
      setUpdateMsg({ type: 'ok', text: 'Technician assigned successfully.' })
      if (onTicketUpdated) onTicketUpdated(updated)
    } catch {
      setUpdateMsg({ type: 'err', text: 'Failed to assign technician.' })
    } finally {
      setSubmitting(false)
    }
  }

  const tabs = [
    { id: 'details',  label: 'Details' },
    { id: 'actions',  label: viewerRole === 'user' ? 'Status' : 'Actions', hidden: false },
    { id: 'comments', label: 'Comments' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Modal panel */}
        <div
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/60 flex items-start justify-between gap-4 shrink-0">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Incident Report
              </p>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 flex-wrap">
                #{ticket.id} — {ticket.category}
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${PRIORITY_STYLES[ticket.priority] || 'bg-slate-100 text-slate-500'}`}>
                  {ticket.priority}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${STATUS_STYLES[ticket.status] || 'bg-slate-100'}`}>
                  {ticket.status}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">{ticket.resourceLocation}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Tabs ───────────────────────────────────────────── */}
          <div className="flex border-b border-slate-100 shrink-0 bg-white">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab content ────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">

            {/* DETAILS TAB */}
            {activeTab === 'details' && (
              <div className="p-8 space-y-6">
                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-5 bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
                  {[
                    { label: 'Reporter',   value: ticket.creatorName },
                    { label: 'Location',   value: ticket.resourceLocation },
                    { label: 'Category',   value: ticket.category },
                    { label: 'Contact',    value: ticket.preferredContactDetails },
                    { label: 'Submitted',  value: formatDate(ticket.createdAt) },
                    { label: 'Last Updated', value: formatDate(ticket.updatedAt) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                      <p className="text-sm font-bold text-slate-800 break-words">{value || '—'}</p>
                    </div>
                  ))}
                  {ticket.assignedTechnicianName && (
                    <div className="col-span-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned Technician</p>
                      <p className="text-sm font-bold text-orange-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
                        {ticket.assignedTechnicianName}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                </div>

                {/* Resolution note */}
                {ticket.resolutionNote && (
                  <div>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Resolution Note</p>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap">
                      {ticket.resolutionNote}
                    </div>
                  </div>
                )}

                {/* Rejection reason */}
                {ticket.rejectionReason && (
                  <div>
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">Rejection Reason</p>
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-800 leading-relaxed whitespace-pre-wrap">
                      {ticket.rejectionReason}
                    </div>
                  </div>
                )}

                {/* Images */}
                {ticket.images?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Evidence ({ticket.images.length})</p>
                    <div className="grid grid-cols-3 gap-3">
                      {ticket.images.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewImage(img)}
                          className="aspect-square rounded-xl overflow-hidden border border-slate-100 cursor-zoom-in group relative"
                        >
                          <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ACTIONS TAB */}
            {activeTab === 'actions' && (
              <div className="p-8 space-y-6">
                {/* Feedback message */}
                {updateMsg && (
                  <div className={`p-3.5 rounded-xl text-xs font-bold border ${updateMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {updateMsg.text}
                  </div>
                )}

                {/* USER — read-only */}
                {viewerRole === 'user' && (
                  <div className="text-center py-10">
                    <div className={`inline-flex px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest ${STATUS_STYLES[ticket.status] || 'bg-slate-100'}`}>
                      {ticket.status}
                    </div>
                    <p className="text-xs text-slate-400 mt-3">An admin or technician will update this ticket's status.</p>
                  </div>
                )}

                {/* TECHNICIAN */}
                {viewerRole === 'technician' && (
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Update Status</label>
                      <div className="flex flex-wrap gap-2">
                        {['IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
                          <button
                            key={s}
                            onClick={() => setStatusForm(f => ({ ...f, status: s }))}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusForm.status === s ? `${STATUS_STYLES[s]} ring-2 ring-offset-1 ring-current` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                          >
                            {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Resolution Note</label>
                      <textarea
                        value={statusForm.resolutionNote}
                        onChange={e => setStatusForm(f => ({ ...f, resolutionNote: e.target.value }))}
                        rows={3}
                        placeholder="Describe the resolution or work performed…"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none resize-none bg-slate-50/50 transition-all"
                      />
                    </div>

                    <button
                      onClick={handleStatusUpdate}
                      disabled={submitting}
                      className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.99]"
                    >
                      {submitting ? 'Saving…' : 'Save Update'}
                    </button>
                  </div>
                )}

                {/* ADMIN */}
                {viewerRole === 'admin' && (
                  <div className="space-y-6">
                    {/* Assign technician */}
                    <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Assign Technician</p>
                      <select
                        value={assignId}
                        onChange={e => setAssignId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none bg-white"
                      >
                        <option value="">— Select technician —</option>
                        {technicianList.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssign}
                        disabled={!assignId || submitting}
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.99]"
                      >
                        {submitting ? 'Assigning…' : 'Assign'}
                      </button>
                    </div>

                    {/* Status update */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Update Status</p>
                      <select
                        value={statusForm.status}
                        onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-white"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>

                      {statusForm.status === 'RESOLVED' && (
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Resolution Note</label>
                          <textarea
                            value={statusForm.resolutionNote}
                            onChange={e => setStatusForm(f => ({ ...f, resolutionNote: e.target.value }))}
                            rows={3}
                            placeholder="Describe the resolution…"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none resize-none bg-slate-50/50"
                          />
                        </div>
                      )}

                      {statusForm.status === 'REJECTED' && (
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1.5 block">Rejection Reason *</label>
                          <textarea
                            value={statusForm.rejectionReason}
                            onChange={e => setStatusForm(f => ({ ...f, rejectionReason: e.target.value }))}
                            rows={3}
                            placeholder="Explain why this ticket is being rejected…"
                            className="w-full px-4 py-3 rounded-xl border border-red-200 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none resize-none bg-red-50/30"
                          />
                        </div>
                      )}

                      <button
                        onClick={handleStatusUpdate}
                        disabled={submitting || (statusForm.status === 'REJECTED' && !statusForm.rejectionReason.trim())}
                        className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.99]"
                      >
                        {submitting ? 'Saving…' : 'Apply Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COMMENTS TAB */}
            {activeTab === 'comments' && (
              <div className="p-8">
                <TicketComments ticketId={ticket.id} currentUser={currentUser} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={() => setPreviewImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={previewImage} alt="Full Preview" className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10" />
        </div>
      )}
    </>
  )
}
