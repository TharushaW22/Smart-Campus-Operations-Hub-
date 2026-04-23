import { useState, useEffect } from 'react'
import notificationService from '../services/notificationService'

const ALL_TYPES = [
  { type: 'TICKET_CREATED',    label: 'New ticket submitted',      roles: ['ADMIN'] },
  { type: 'STATUS_UPDATED',    label: 'Ticket status changed',     roles: ['USER', 'TECHNICIAN'] },
  { type: 'ASSIGNED',          label: 'Ticket assigned to you',    roles: ['TECHNICIAN'] },
  { type: 'COMMENT_ADDED',     label: 'Comment added to ticket',   roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  { type: 'BOOKING_CREATED',   label: 'New booking requested',     roles: ['ADMIN'] },
  { type: 'BOOKING_APPROVED',  label: 'Booking approved',          roles: ['USER'] },
  { type: 'BOOKING_REJECTED',  label: 'Booking rejected',          roles: ['USER'] },
  { type: 'BOOKING_CANCELLED', label: 'Booking cancelled by user', roles: ['ADMIN'] },
]

export default function NotificationPreferencesPanel({ userRole }) {
  const [disabledTypes, setDisabledTypes] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [error, setError] = useState(null)

  const visibleTypes = ALL_TYPES.filter(t => t.roles.includes(userRole))

  useEffect(() => {
    notificationService.getPreferences()
      .then(data => setDisabledTypes(new Set(data.disabledTypes || [])))
      .catch(() => setError('Could not load preferences.'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (type) => {
    setDisabledTypes(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
    setSavedOk(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await notificationService.updatePreferences([...disabledTypes])
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 3000)
    } catch {
      setError('Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        Notification Preferences
      </h2>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-6">
        Toggle which notifications you receive
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading...
        </div>
      ) : (
        <div className="space-y-3">
          {visibleTypes.map(({ type, label }) => {
            const enabled = !disabledTypes.has(type)
            return (
              <div key={type} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <button
                  type="button"
                  onClick={() => toggle(type)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    enabled ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                  aria-checked={enabled}
                  role="switch"
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {error && (
        <p className="mt-4 text-[10px] text-red-500 font-bold flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {savedOk && (
        <p className="mt-4 text-[10px] text-emerald-600 font-bold flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Preferences saved!
        </p>
      )}

      {!loading && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-6 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      )}
    </div>
  )
}
