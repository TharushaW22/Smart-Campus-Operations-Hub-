export default function BookingStatusBadge({ status }) {
  const normalized = (status ?? '').toUpperCase()

  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-700 border-green-200',
    CHECKED_IN: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const cls = styles[normalized] ?? 'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${cls}`}>
      {normalized || 'UNKNOWN'}
    </span>
  )
}
