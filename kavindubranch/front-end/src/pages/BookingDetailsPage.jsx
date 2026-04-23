import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import BookingStatusBadge from '../components/BookingStatusBadge'
import { QRCode } from 'react-qr-code'
import { getBookingById, getBookingCheckInToken } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'
import RoleSidebarLayout from '../components/RoleSidebarLayout'

// Reusable field component for displaying label + value
function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="mt-1 text-sm text-gray-800">{children}</div>
    </div>
  )
}

export default function BookingDetailsPage() {

  // Get booking ID from URL
  const { id } = useParams()

  const navigate = useNavigate()
  const location = useLocation()

  // Get logged-in user details
  const { user } = useAuth()

  // State for booking data
  const [booking, setBooking] = useState(null)

  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Flash message state (for success messages)
  const [flash, setFlash] = useState('')

  // QR code state
  const [qr, setQr] = useState({
    token: '',
    expiresAt: '',
    loading: false,
    error: ''
  })

  // Handle flash message from navigation state
  useEffect(() => {
    const message = location.state?.flash
    if (!message) return

    setFlash(message)

    // Clear flash message from navigation state
    navigate(location.pathname + location.search, {
      replace: true,
      state: {}
    })
  }, [location.pathname, location.search, location.state, navigate])

  // Fetch booking details from backend
  useEffect(() => {
    let mounted = true

    setLoading(true)
    setError('')

    getBookingById(id)
      .then((data) => {
        if (!mounted) return
        setBooking(data)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err.response?.data?.error ?? 'Failed to load booking details.')
      })
      .finally(() => mounted && setLoading(false))

    // Cleanup to avoid memory leaks
    return () => {
      mounted = false
    }
  }, [id])

  // Check if QR code should be shown (only for approved & not checked-in bookings)
  const canShowQr = booking?.status === 'APPROVED' && !booking?.checkedInAt

  // Generate QR code token
  const handleLoadQr = async () => {
    if (!booking?.id) return

    // Set loading state
    setQr({ token: '', expiresAt: '', loading: true, error: '' })

    try {
      const data = await getBookingCheckInToken(booking.id)

      // Set QR token and expiry
      setQr({
        token: data?.token ?? '',
        expiresAt: data?.expiresAt ?? '',
        loading: false,
        error: ''
      })
    } catch (err) {
      setQr({
        token: '',
        expiresAt: '',
        loading: false,
        error: err.response?.data?.error ?? 'Failed to generate QR code.'
      })
    }
  }

  return (
    <RoleSidebarLayout>
      <div>

        {/* Header section */}
        <div className="flex items-center justify-between">
          <div>
            <h1>Booking Details</h1>
            <p>View booking information.</p>
          </div>

          {/* Navigation buttons */}
          <div>
            <button onClick={() => navigate(-1)}>Back</button>

            {/* Show edit only if booking is pending */}
            {booking?.status === 'PENDING' && (
              <Link to={`/bookings/${id}/edit`}>
                Edit
              </Link>
            )}
          </div>
        </div>

        {/* Flash message */}
        {flash && (
          <div>
            <p>{flash}</p>
            <button onClick={() => setFlash('')}>
              Dismiss
            </button>
          </div>
        )}

        {/* Loading and error states */}
        {loading && <p>Loading booking…</p>}
        {!loading && error && <p>{error}</p>}

        {/* Booking details */}
        {!loading && !error && booking && (
          <div>

            {/* Main booking info */}
            <div>

              {/* Resource and status */}
              <div>
                <p>Resource</p>
                <p>{booking.resourceName}</p>
                <BookingStatusBadge status={booking.status} />
              </div>

              {/* Booking details grid */}
              <div>

                {/* Show user info only for admin */}
                {user?.role === 'ADMIN' && (
                  <Field label="Booked By">
                    <p>{booking.userName}</p>
                    <p>User ID: {booking.userId}</p>
                  </Field>
                )}

                <Field label="Date">{booking.date}</Field>
                <Field label="Time">{booking.startTime} – {booking.endTime}</Field>
                <Field label="Expected Attendees">{booking.expectedAttendees ?? '—'}</Field>
              </div>

              {/* Purpose */}
              <div>
                <p>Purpose</p>
                <p>{booking.purpose || '—'}</p>
              </div>

              {/* Admin reason */}
              <div>
                <p>Admin Reason</p>
                <p>{booking.adminReason || '—'}</p>
              </div>
            </div>

            {/* Metadata section */}
            <div>
              <h2>Meta</h2>
              <Field label="Booking ID">{booking.id}</Field>
              <Field label="Created At">{booking.createdAt ?? '—'}</Field>
              <Field label="Updated At">{booking.updatedAt ?? '—'}</Field>
              <Field label="Checked In At">{booking.checkedInAt ?? '—'}</Field>
            </div>

            {/* QR Check-In section */}
            <div>
              <h2>QR Check-In</h2>

              {/* If QR not available */}
              {!canShowQr && (
                <p>
                  {booking?.checkedInAt
                    ? 'This booking is already checked in.'
                    : 'QR is available after approval.'}
                </p>
              )}

              {/* If QR can be shown */}
              {canShowQr && (
                <div>

                  {/* Show button if QR not generated */}
                  {!qr.token ? (
                    <button onClick={handleLoadQr} disabled={qr.loading}>
                      {qr.loading ? 'Generating…' : 'Show QR Code'}
                    </button>
                  ) : (

                    // Show QR code
                    <div>
                      <QRCode value={qr.token} size={160} />

                      <p>
                        Show this QR at check-in.
                        {qr.expiresAt ? ` Expires at: ${qr.expiresAt}` : ''}
                      </p>

                      {/* Regenerate QR */}
                      <button onClick={handleLoadQr}>
                        Regenerate
                      </button>
                    </div>
                  )}

                  {/* Error display */}
                  {qr.error && <p>{qr.error}</p>}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </RoleSidebarLayout>
  )
}