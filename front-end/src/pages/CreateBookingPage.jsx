import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { createBooking } from '../services/bookingService'
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

export default function CreateBookingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(true)

  const [resourceId, setResourceId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [purpose, setPurpose] = useState('')
  const [expectedAttendees, setExpectedAttendees] = useState(1)

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const preselected = searchParams.get('resourceId')
    if (preselected) {
      setResourceId(preselected)
    }
    // only on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setLoadingResources(true)
    axios.get('http://localhost:8080/api/resources', { headers: authHeaders() })
      .then(res => setResources(res.data?.content ?? res.data ?? []))
      .catch(() => setServerError('Failed to load resources.'))
      .finally(() => setLoadingResources(false))
  }, [])

  const resourceOptions = useMemo(() => {
    return [...resources].sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? ''))
  }, [resources])

  const validate = () => {
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

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccess('')

    if (!validate()) return

    setSubmitting(true)
    try {
      await createBooking({
        resourceId: Number(resourceId),
        date,
        startTime,
        endTime,
        purpose: purpose.trim(),
        expectedAttendees: Number(expectedAttendees),
      })
      setSuccess('Booking created successfully. Redirecting to My Bookings…')
      setTimeout(() => navigate('/bookings/my'), 900)
    } catch (err) {
      const message = err.response?.data?.error
      const fields = err.response?.data?.fields
      if (fields) {
        setErrors(fields)
      }
      setServerError(message ?? 'Failed to create booking.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RoleSidebarLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Create Booking</h1>
        <p className="text-sm text-gray-500 mt-1">Book a campus resource for a specific date and time.</p>

        <form onSubmit={onSubmit} className="mt-6 bg-white border border-gray-100 rounded-2xl p-6">
          {serverError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Resource</label>
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                disabled={loadingResources}
              >
                <option value="">{loadingResources ? 'Loading…' : 'Select a resource'}</option>
                {resourceOptions.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                ))}
              </select>
              {errors.resourceId && <p className="text-xs text-red-600 mt-1">{errors.resourceId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              {errors.startTime && <p className="text-xs text-red-600 mt-1">{errors.startTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              {errors.endTime && <p className="text-xs text-red-600 mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {errors.time && <p className="text-xs text-red-600 mt-2">{errors.time}</p>}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Purpose</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={4}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="e.g., Club meeting / Lecture / Workshop"
            />
            {errors.purpose && <p className="text-xs text-red-600 mt-1">{errors.purpose}</p>}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Expected Attendees</label>
            <input
              type="number"
              min={1}
              value={expectedAttendees}
              onChange={(e) => setExpectedAttendees(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            {errors.expectedAttendees && <p className="text-xs text-red-600 mt-1">{errors.expectedAttendees}</p>}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Create Booking'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/bookings/my')}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Go to My Bookings
            </button>
          </div>
        </form>
      </div>
    </RoleSidebarLayout>
  )
}
