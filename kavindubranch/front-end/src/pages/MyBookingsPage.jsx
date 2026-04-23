import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BookingStatusBadge from '../components/BookingStatusBadge'
import { deleteBooking, getMyBookings, updateBookingStatus } from '../services/bookingService'
import RoleSidebarLayout from '../components/RoleSidebarLayout'

const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'CHECKED_IN', 'REJECTED', 'CANCELLED']

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const load = () => {
    setLoading(true)
    setError('')
    getMyBookings()
      .then(data => setBookings(data ?? []))
      .catch(err => setError(err.response?.data?.error ?? 'Failed to load bookings.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return bookings
    return bookings.filter(b => (b.status ?? '').toUpperCase() === statusFilter)
  }, [bookings, statusFilter])

  const onCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return
    try {
      const updated = await updateBookingStatus(bookingId, { status: 'CANCELLED' })
      setBookings(prev => prev.map(b => (b.id === bookingId ? updated : b)))
    } catch (err) {
      alert(err.response?.data?.error ?? 'Failed to cancel booking.')
    }
  }

  const onDelete = async (bookingId) => {
    if (!window.confirm('Delete this pending booking?')) return
    try {
      await deleteBooking(bookingId)
      setBookings(prev => prev.filter(b => b.id !== bookingId))
    } catch (err) {
      alert(err.response?.data?.error ?? 'Failed to delete booking.')
    }
  }

  return (
    <RoleSidebarLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your booking requests and approvals.</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/bookings/create"
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700"
            >
              Create Booking
            </Link>
            <button
              onClick={load}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <label className="text-sm text-gray-600">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading && <p className="text-gray-400 text-sm mt-6">Loading bookings…</p>}
        {!loading && error && <p className="text-red-600 text-sm mt-6">{error}</p>}

        {!loading && !error && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
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
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 font-medium text-gray-800">{b.resourceName}</td>
                    <td className="px-4 py-3 text-gray-600">{b.date}</td>
                    <td className="px-4 py-3 text-gray-600">{b.startTime} – {b.endTime}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[360px] whitespace-pre-wrap">{b.purpose}</td>
                    <td className="px-4 py-3 text-gray-600">{b.expectedAttendees}</td>
                    <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
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
                        {b.status === 'APPROVED' && (
                          <button
                            onClick={() => onCancel(b.id)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        )}
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => onDelete(b.id)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">
                No bookings found for the selected filter.
              </p>
            )}
          </div>
        )}
      </div>
    </RoleSidebarLayout>
  )
}
