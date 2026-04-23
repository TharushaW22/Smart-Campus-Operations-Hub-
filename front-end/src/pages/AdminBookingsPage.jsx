import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import BookingStatusBadge from '../components/BookingStatusBadge'
import { getAllBookings, updateBookingStatus } from '../services/bookingService'
import RoleSidebarLayout from '../components/RoleSidebarLayout'

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'CHECKED_IN', 'REJECTED', 'CANCELLED']

export default function AdminBookingsPage() {
  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(true)

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const [resourceId, setResourceId] = useState('')

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState(null)
  const [actionBusyId, setActionBusyId] = useState(null)

  const resourceOptions = useMemo(() => {
    return [...resources].sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? ''))
  }, [resources])

  useEffect(() => {
    setLoadingResources(true)
    axios.get('http://localhost:8080/api/resources', { headers: authHeaders() })
      .then(res => setResources(res.data?.content ?? res.data ?? []))
      .catch(() => setError('Failed to load resources.'))
      .finally(() => setLoadingResources(false))
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAllBookings({
        status: status || undefined,
        date: date || undefined,
        resourceId: resourceId ? Number(resourceId) : undefined,
      })
      setBookings(data ?? [])
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onApprove = async (id) => {
    setActionBusyId(id)
    try {
      const updated = await updateBookingStatus(id, { status: 'APPROVED' })
      setBookings(prev => prev.map(b => (b.id === id ? updated : b)))
    } catch (err) {
      alert(err.response?.data?.error ?? 'Failed to approve booking.')
    } finally {
      setActionBusyId(null)
    }
  }

  const openReject = (id) => {
    setRejectingId(id)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const closeReject = () => {
    setRejectModalOpen(false)
    setRejectingId(null)
    setRejectReason('')
  }

  const onReject = async () => {
    if (!rejectingId) return
    if (!rejectReason.trim()) {
      alert('Rejection reason is required.')
      return
    }

    setActionBusyId(rejectingId)
    try {
      const updated = await updateBookingStatus(rejectingId, {
        status: 'REJECTED',
        adminReason: rejectReason.trim(),
      })
      setBookings(prev => prev.map(b => (b.id === rejectingId ? updated : b)))
      closeReject()
    } catch (err) {
      alert(err.response?.data?.error ?? 'Failed to reject booking.')
    } finally {
      setActionBusyId(null)
    }
  }

  return (
    <RoleSidebarLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">All Bookings (Admin)</h1>
            <p className="text-sm text-gray-500 mt-1">Review, approve, and reject booking requests.</p>
          </div>
          <button
            onClick={loadBookings}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-600">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="">All</option>
                {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600">Resource</label>
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                disabled={loadingResources}
              >
                <option value="">{loadingResources ? 'Loading…' : 'All resources'}</option>
                {resourceOptions.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={loadBookings}
                className="w-full px-4 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700"
              >
                Apply Filters
              </button>
              <button
                onClick={() => { setStatus(''); setDate(''); setResourceId(''); }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>

        {loading && <p className="text-gray-400 text-sm mt-6">Loading bookings…</p>}

        {!loading && !error && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Resource</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Purpose</th>
                  <th className="px-4 py-3 text-left">Attendees</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 font-medium text-gray-800">{b.userName}</td>
                    <td className="px-4 py-3 text-gray-700">{b.resourceName}</td>
                    <td className="px-4 py-3 text-gray-600">{b.date}</td>
                    <td className="px-4 py-3 text-gray-600">{b.startTime} – {b.endTime}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[380px] whitespace-pre-wrap">{b.purpose}</td>
                    <td className="px-4 py-3 text-gray-600">{b.expectedAttendees}</td>
                    <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/bookings/${b.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                        >
                          View
                        </Link>
                        {b.status === 'PENDING' && (
                          <Link
                            to={`/bookings/${b.id}/edit`}
                            className="text-xs px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                          >
                            Edit
                          </Link>
                        )}
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => onApprove(b.id)}
                            disabled={actionBusyId === b.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            {actionBusyId === b.id ? 'Working…' : 'Approve'}
                          </button>
                        )}
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => openReject(b.id)}
                            disabled={actionBusyId === b.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        )}
                        {b.status !== 'PENDING' && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {bookings.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">No bookings found.</p>
            )}
          </div>
        )}

        {rejectModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-lg font-semibold text-gray-800">Reject Booking</h3>
              <p className="text-sm text-gray-500 mt-1">Please provide a reason for rejection.</p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="mt-4 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="Reason…"
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={closeReject}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onReject}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700"
                >
                  Submit Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleSidebarLayout>
  )
}
