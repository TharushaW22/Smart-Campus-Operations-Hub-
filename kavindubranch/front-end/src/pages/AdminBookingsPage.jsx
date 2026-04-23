import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import BookingStatusBadge from '../components/BookingStatusBadge'
import { getAllBookings, updateBookingStatus } from '../services/bookingService'
import RoleSidebarLayout from '../components/RoleSidebarLayout'

// Function to attach JWT token from localStorage to API requests
function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

// Available booking status options for filtering
const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'CHECKED_IN', 'REJECTED', 'CANCELLED']

export default function AdminBookingsPage() {

  // State to store resources (rooms, labs, etc.)
  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(true)

  // State to store bookings data
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter states
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const [resourceId, setResourceId] = useState('')

  // Reject modal states
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState(null)
  const [actionBusyId, setActionBusyId] = useState(null)

  // Memoized sorted resources list
  const resourceOptions = useMemo(() => {
    return [...resources].sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? ''))
  }, [resources])

  // Load resources from backend on component mount
  useEffect(() => {
    setLoadingResources(true)
    axios.get('http://localhost:8080/api/resources', { headers: authHeaders() })
      .then(res => setResources(res.data?.content ?? res.data ?? []))
      .catch(() => setError('Failed to load resources.'))
      .finally(() => setLoadingResources(false))
  }, [])

  // Function to load bookings with applied filters
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

  // Initial bookings load
  useEffect(() => {
    loadBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Approve booking handler
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

  // Open reject modal
  const openReject = (id) => {
    setRejectingId(id)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  // Close reject modal
  const closeReject = () => {
    setRejectModalOpen(false)
    setRejectingId(null)
    setRejectReason('')
  }

  // Reject booking handler with reason
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

        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">All Bookings (Admin)</h1>
            <p className="text-sm text-gray-500 mt-1">Review, approve, and reject booking requests.</p>
          </div>

          {/* Refresh bookings button */}
          <button
            onClick={loadBookings}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {/* Filters section */}
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

            {/* Status filter */}
            <div>
              <label className="block text-xs text-gray-600">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Date filter */}
            <div>
              <label className="block text-xs text-gray-600">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            {/* Resource filter */}
            <div>
              <label className="block text-xs text-gray-600">Resource</label>
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                disabled={loadingResources}
              >
                <option value="">{loadingResources ? 'Loading…' : 'All resources'}</option>
                {resourceOptions.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                ))}
              </select>
            </div>

            {/* Filter buttons */}
            <div className="flex items-end gap-2">
              <button onClick={loadBookings} className="w-full px-4 py-2 rounded-xl bg-purple-600 text-white">
                Apply Filters
              </button>
              <button
                onClick={() => { setStatus(''); setDate(''); setResourceId(''); }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>

        {/* Loading state */}
        {loading && <p className="text-gray-400 text-sm mt-6">Loading bookings…</p>}

        {/* Bookings table */}
        {!loading && !error && (
          <div className="mt-6 overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Resource</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Purpose</th>
                  <th>Attendees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>

                    {/* Booking details */}
                    <td>{b.userName}</td>
                    <td>{b.resourceName}</td>
                    <td>{b.date}</td>
                    <td>{b.startTime} – {b.endTime}</td>
                    <td>{b.purpose}</td>
                    <td>{b.expectedAttendees}</td>
                    <td><BookingStatusBadge status={b.status} /></td>

                    {/* Actions (view, edit, approve, reject) */}
                    <td>
                      <Link to={`/bookings/${b.id}`}>View</Link>

                      {b.status === 'PENDING' && (
                        <>
                          <Link to={`/bookings/${b.id}/edit`}>Edit</Link>

                          <button onClick={() => onApprove(b.id)}>
                            Approve
                          </button>

                          <button onClick={() => openReject(b.id)}>
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty state */}
            {bookings.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">No bookings found.</p>
            )}
          </div>
        )}

        {/* Reject modal */}
        {rejectModalOpen && (
          <div>
            <h3>Reject Booking</h3>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <button onClick={closeReject}>Cancel</button>
            <button onClick={onReject}>Submit Rejection</button>
          </div>
        )}

      </div>
    </RoleSidebarLayout>
  )
}