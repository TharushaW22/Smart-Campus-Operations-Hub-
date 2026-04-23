import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import BookingStatusBadge from '../components/BookingStatusBadge'
import { deleteBooking, getBookingById, updateBooking, updateBookingStatus } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'
import RoleSidebarLayout from '../components/RoleSidebarLayout'

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

function minutesFromHHMM(value) {
  if (!value || !value.includes(':')) return null
  const [hh, mm] = value.split(':').map(v => parseInt(v, 10))
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null
  return hh * 60 + mm
}

export default function EditBookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)

  const [status, setStatus] = useState('')
  const [adminReason, setAdminReason] = useState('')

  const [resourceId, setResourceId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [purpose, setPurpose] = useState('')
  const [expectedAttendees, setExpectedAttendees] = useState(1)
  const [fieldErrors, setFieldErrors] = useState({})

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const role = user?.role

  const canAdminEdit = role === 'ADMIN' && booking?.status === 'PENDING'
  const canUserEdit = role === 'USER' && booking?.status === 'PENDING'
  const canUserDelete = role === 'USER' && booking?.status === 'PENDING'

  const mode = useMemo(() => {
    if (role === 'ADMIN') return 'ADMIN'
    if (role === 'USER') return 'USER'
    return 'OTHER'
  }, [role])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    setFieldErrors({})

    getBookingById(id)
      .then((data) => {
        if (!mounted) return
        setBooking(data)

        if (role === 'ADMIN') {
          setStatus('APPROVED')
          setAdminReason('')
        } else {
          setResourceId(String(data.resourceId ?? ''))
          setDate(data.date ?? '')
          setStartTime(data.startTime ?? '')
          setEndTime(data.endTime ?? '')
          setPurpose(data.purpose ?? '')
          setExpectedAttendees(data.expectedAttendees ?? 1)
        }
      })
      .catch((err) => {
        if (!mounted) return
        setError(err.response?.data?.error ?? 'Failed to load booking.')
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [id, role])

  useEffect(() => {
    if (role !== 'USER') return
    setLoadingResources(true)
    axios.get('http://localhost:8080/api/resources', { headers: authHeaders() })
      .then(res => setResources(res.data?.content ?? res.data ?? []))
      .catch(() => setError('Failed to load resources.'))
      .finally(() => setLoadingResources(false))
  }, [role])

  const resourceOptions = useMemo(() => {
    return [...resources].sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? ''))
  }, [resources])

  const validateUserEdit = () => {
    const next = {}
    if (!resourceId) next.resourceId = 'Please select a resource.'
    if (!date) next.date = 'Please select a date.'
    if (!startTime) next.startTime = 'Please select a start time.'
    if (!endTime) next.endTime = 'Please select an end time.'
    if (!purpose.trim()) next.purpose = 'Purpose is required.'

    const ea = Number(expectedAttendees)
    if (!Number.isFinite(ea) || ea < 1) next.expectedAttendees = 'Expected attendees must be at least 1.'

    const startMins = minutesFromHHMM(startTime)
    const endMins = minutesFromHHMM(endTime)
    if (startMins != null && endMins != null && startMins >= endMins) {
      next.time = 'Start time must be before end time.'
    }

    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const onSave = async (e) => {
    e.preventDefault()
    if (!booking) return

    if (mode === 'USER') {
      if (!canUserEdit) {
        setError('Only PENDING bookings can be edited.')
        return
      }
      if (!validateUserEdit()) return

      setSaving(true)
      setError('')
      try {
        const updated = await updateBooking(booking.id, {
          resourceId: Number(resourceId),
          date,
          startTime,
          endTime,
          purpose: purpose.trim(),
          expectedAttendees: Number(expectedAttendees),
        })
        setBooking(updated)
        navigate(`/bookings/${booking.id}`, { state: { flash: 'Booking updated successfully.' } })
      } catch (err) {
        setError(err.response?.data?.error ?? 'Failed to update booking.')
      } finally {
        setSaving(false)
      }
      return
    }

    if (mode === 'ADMIN') {
      if (!canAdminEdit) {
        setError('Only PENDING bookings can be approved or rejected.')
        return
      }
      if (status !== 'APPROVED' && status !== 'REJECTED') {
        setError('Admin can only set status to APPROVED or REJECTED.')
        return
      }
      if (status === 'REJECTED' && !adminReason.trim()) {
        setError('Rejection reason is required.')
        return
      }
    }

    setSaving(true)
    setError('')
    try {
      const payload = { status }
      if (mode === 'ADMIN' && status === 'REJECTED') {
        payload.adminReason = adminReason.trim()
      }

      const updated = await updateBookingStatus(booking.id, payload)
      setBooking(updated)
      navigate(`/bookings/${booking.id}`, { state: { flash: 'Booking updated successfully.' } })
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to update booking.')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (!booking) return
    if (!canUserDelete) return

    if (!window.confirm('Delete this pending booking?')) return

    setDeleting(true)
    setError('')
    try {
      await deleteBooking(booking.id)
      navigate('/bookings/my')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to delete booking.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <RoleSidebarLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Booking</h1>
            <p className="text-sm text-gray-500 mt-1">Update booking details or status.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <Link
              to={`/bookings/${id}`}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              View
            </Link>
          </div>
        </div>

        {loading && <p className="text-gray-400 text-sm mt-6">Loading booking…</p>}
        {!loading && error && <p className="text-red-600 text-sm mt-6">{error}</p>}

        {!loading && !error && booking && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Resource</p>
                  <p className="text-lg font-semibold text-gray-800">{booking.resourceName}</p>
                  <p className="text-sm text-gray-500 mt-1">{booking.date} · {booking.startTime} – {booking.endTime}</p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>

              <form onSubmit={onSave} className="mt-6 space-y-4">
              {mode === 'ADMIN' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600">New Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={!canAdminEdit || saving}
                      className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                    >
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                    {!canAdminEdit && (
                      <p className="text-xs text-gray-500 mt-2">Only PENDING bookings can be approved or rejected.</p>
                    )}
                  </div>

                  {status === 'REJECTED' && (
                    <div>
                      <label className="block text-xs text-gray-600">Rejection Reason</label>
                      <textarea
                        value={adminReason}
                        onChange={(e) => setAdminReason(e.target.value)}
                        rows={4}
                        disabled={!canAdminEdit || saving}
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                        placeholder="Reason…"
                      />
                    </div>
                  )}
                </>
              )}

              {mode === 'USER' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Resource</label>
                      <select
                        value={resourceId}
                        onChange={(e) => setResourceId(e.target.value)}
                        disabled={loadingResources || !canUserEdit || saving}
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                      >
                        <option value="">{loadingResources ? 'Loading…' : 'Select a resource'}</option>
                        {resourceOptions.map(r => (
                          <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                        ))}
                      </select>
                      {fieldErrors.resourceId && <p className="text-xs text-red-600 mt-1">{fieldErrors.resourceId}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={!canUserEdit || saving}
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                      />
                      {fieldErrors.date && <p className="text-xs text-red-600 mt-1">{fieldErrors.date}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={!canUserEdit || saving}
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                      />
                      {fieldErrors.startTime && <p className="text-xs text-red-600 mt-1">{fieldErrors.startTime}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={!canUserEdit || saving}
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                      />
                      {fieldErrors.endTime && <p className="text-xs text-red-600 mt-1">{fieldErrors.endTime}</p>}
                    </div>
                  </div>

                  {fieldErrors.time && <p className="text-xs text-red-600">{fieldErrors.time}</p>}

                  {!canUserEdit && (
                    <p className="text-xs text-gray-500">Only PENDING bookings can be edited.</p>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Purpose</label>
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      rows={4}
                      disabled={!canUserEdit || saving}
                      className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                      placeholder="e.g., Club meeting / Lecture / Workshop"
                    />
                    {fieldErrors.purpose && <p className="text-xs text-red-600 mt-1">{fieldErrors.purpose}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expected Attendees</label>
                    <input
                      type="number"
                      min={1}
                      value={expectedAttendees}
                      onChange={(e) => setExpectedAttendees(e.target.value)}
                      disabled={!canUserEdit || saving}
                      className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                    />
                    {fieldErrors.expectedAttendees && <p className="text-xs text-red-600 mt-1">{fieldErrors.expectedAttendees}</p>}
                  </div>
                </>
              )}

              {mode === 'OTHER' && (
                <p className="text-sm text-gray-600">Your role does not allow editing bookings.</p>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                {canUserDelete ? (
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting || saving}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    {deleting ? 'Deleting…' : 'Delete Booking'}
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  disabled={saving || (mode === 'ADMIN' && !canAdminEdit) || (mode === 'USER' && !canUserEdit) || mode === 'OTHER'}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
              </form>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-800">Quick Info</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <p><span className="text-gray-500">Booking ID:</span> {booking.id}</p>
                <p><span className="text-gray-500">Attendees:</span> {booking.expectedAttendees ?? '—'}</p>
                <p><span className="text-gray-500">Purpose:</span> {booking.purpose || '—'}</p>
                <p><span className="text-gray-500">Admin Reason:</span> {booking.adminReason || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleSidebarLayout>
  )
}
