import { useEffect, useMemo, useRef, useState } from 'react'
import RoleSidebarLayout from '../components/RoleSidebarLayout'
import { checkInBookingByToken } from '../services/bookingService'

export default function BookingCheckInPage() {
  const scannerRegionId = useMemo(() => 'qr-reader-region', [])
  const qrCodeRef = useRef(null)

  const [token, setToken] = useState('')
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  // Lazy-load html5-qrcode only on this page.
  const loadScanner = async () => {
    const mod = await import('html5-qrcode/esm/index.js')
    return mod.Html5Qrcode
  }

  const stopScanner = async () => {
    try {
      if (qrCodeRef.current) {
        const state = qrCodeRef.current.getState?.()
        if (state === 2) {
          await qrCodeRef.current.stop()
        }
        await qrCodeRef.current.clear()
      }
    } catch {
      // ignore
    } finally {
      qrCodeRef.current = null
      setScanning(false)
    }
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startScanner = async () => {
    setError('')
    setResult(null)

    try {
      const Html5Qrcode = await loadScanner()
      const qr = new Html5Qrcode(scannerRegionId)
      qrCodeRef.current = qr

      setScanning(true)

      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (!decodedText) return
          await stopScanner()
          setToken(decodedText)
          await submitToken(decodedText)
        },
        () => {}
      )
    } catch (e) {
      await stopScanner()
      setError(e?.message ?? 'Failed to start camera scanner.')
    }
  }

  const submitToken = async (raw) => {
    const value = (raw ?? token).trim()
    if (!value) {
      setError('Token is required')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await checkInBookingByToken(value)
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Booking Check-In</h1>
            <p className="text-sm text-gray-500 mt-1">Scan a booking QR to check the user in.</p>
          </div>
          <div className="flex gap-2">
            {!scanning ? (
              <button
                onClick={startScanner}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700"
              >
                Start Scanner
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Stop
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800">Scanner</h2>
            <div className="mt-3">
              <div id={scannerRegionId} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 min-h-[280px]" />
              <p className="mt-3 text-xs text-gray-500">Allow camera access when prompted.</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800">Manual Token</h2>
            <p className="mt-2 text-xs text-gray-500">If camera scan fails, paste the token from the QR.</p>

            <div className="mt-3">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token here"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
              <button
                onClick={() => submitToken(token)}
                disabled={loading}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? 'Checking in…' : 'Check In'}
              </button>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {result && (
              <div className="mt-4 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800">
                <p className="text-sm font-semibold">Check-in successful</p>
                <div className="mt-2 text-sm text-emerald-900/80">
                  <div><span className="font-medium">Booking:</span> #{result.id}</div>
                  <div><span className="font-medium">Resource:</span> {result.resourceName}</div>
                  <div><span className="font-medium">Date:</span> {result.date}</div>
                  <div><span className="font-medium">Time:</span> {result.startTime} – {result.endTime}</div>
                  <div><span className="font-medium">Status:</span> {result.status}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleSidebarLayout>
  )
}
