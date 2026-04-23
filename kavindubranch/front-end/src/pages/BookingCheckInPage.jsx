import { useEffect, useMemo, useRef, useState } from 'react'
import RoleSidebarLayout from '../components/RoleSidebarLayout'
import { checkInBookingByToken } from '../services/bookingService'

export default function BookingCheckInPage() {

  // Unique ID for QR scanner region
  const scannerRegionId = useMemo(() => 'qr-reader-region', [])

  // Reference to QR scanner instance
  const qrCodeRef = useRef(null)

  // State for manual or scanned token
  const [token, setToken] = useState('')

  // Scanner active state
  const [scanning, setScanning] = useState(false)

  // Loading state for API call
  const [loading, setLoading] = useState(false)

  // Error message state
  const [error, setError] = useState('')

  // Result of successful check-in
  const [result, setResult] = useState(null)

  // Lazy-load QR scanner library only when needed
  const loadScanner = async () => {
    const mod = await import('html5-qrcode/esm/index.js')
    return mod.Html5Qrcode
  }

  // Stop and clear QR scanner
  const stopScanner = async () => {
    try {
      if (qrCodeRef.current) {

        // Check scanner state before stopping
        const state = qrCodeRef.current.getState?.()

        // Stop scanner if running
        if (state === 2) {
          await qrCodeRef.current.stop()
        }

        // Clear scanner UI
        await qrCodeRef.current.clear()
      }
    } catch {
      // Ignore errors during cleanup
    } finally {
      qrCodeRef.current = null
      setScanning(false)
    }
  }

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Start QR scanner using device camera
  const startScanner = async () => {
    setError('')
    setResult(null)

    try {
      const Html5Qrcode = await loadScanner()

      // Initialize scanner
      const qr = new Html5Qrcode(scannerRegionId)
      qrCodeRef.current = qr

      setScanning(true)

      // Start camera and scan QR codes
      await qr.start(
        { facingMode: 'environment' }, // Use back camera
        { fps: 10, qrbox: 250 },       // Scanner settings

        // On successful scan
        async (decodedText) => {
          if (!decodedText) return

          await stopScanner()

          // Set scanned token
          setToken(decodedText)

          // Automatically submit token
          await submitToken(decodedText)
        },

        // On scan failure (ignored)
        () => {}
      )

    } catch (e) {
      await stopScanner()
      setError(e?.message ?? 'Failed to start camera scanner.')
    }
  }

  // Submit token for check-in
  const submitToken = async (raw) => {

    // Use scanned token or manually entered token
    const value = (raw ?? token).trim()

    if (!value) {
      setError('Token is required')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Call backend API for check-in
      const data = await checkInBookingByToken(value)

      // Save successful result
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Check-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RoleSidebarLayout>
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1>Booking Check-In</h1>
            <p>Scan a booking QR to check the user in.</p>
          </div>

          {/* Start/Stop scanner button */}
          <div>
            {!scanning ? (
              <button onClick={startScanner}>
                Start Scanner
              </button>
            ) : (
              <button onClick={stopScanner}>
                Stop
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* QR Scanner section */}
          <div>
            <h2>Scanner</h2>
            <div>
              {/* QR scanner container */}
              <div id={scannerRegionId} />
              <p>Allow camera access when prompted.</p>
            </div>
          </div>

          {/* Manual token entry section */}
          <div>
            <h2>Manual Token</h2>
            <p>If camera scan fails, paste the token from the QR.</p>

            <div>
              {/* Input for token */}
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token here"
              />

              {/* Submit button */}
              <button onClick={() => submitToken(token)} disabled={loading}>
                {loading ? 'Checking in…' : 'Check In'}
              </button>
            </div>

            {/* Error message */}
            {error && <p>{error}</p>}

            {/* Success result */}
            {result && (
              <div>
                <p>Check-in successful</p>

                {/* Booking details */}
                <div>
                  <div>Booking: #{result.id}</div>
                  <div>Resource: {result.resourceName}</div>
                  <div>Date: {result.date}</div>
                  <div>Time: {result.startTime} – {result.endTime}</div>
                  <div>Status: {result.status}</div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </RoleSidebarLayout>
  )
}