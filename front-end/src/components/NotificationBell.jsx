import { useState, useEffect, useRef } from 'react'
import notificationService from '../services/notificationService'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return 'Just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const TYPE_ICON = {
  TICKET_CREATED: '🎫',
  STATUS_UPDATED: '🔄',
  ASSIGNED:       '🔧',
  COMMENT_ADDED:  '💬',
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [open, setOpen]                   = useState(false)
  const dropdownRef = useRef(null)

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications()
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.isRead).length)
    } catch {
      // silently fail — user may not be logged in yet
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const handleMarkOne = async (id) => {
    await notificationService.markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleDeleteOne = async (e, id, wasUnread) => {
    e.stopPropagation()
    try {
      await notificationService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      // ignore
    }
  }

  const handleClearAll = async () => {
    try {
      await notificationService.deleteAll()
      setNotifications([])
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden">

          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Notifications</p>
              {unreadCount > 0 && (
                <p className="text-[11px] text-slate-400">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] font-semibold text-red-400 hover:text-red-600 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkOne(n.id)}
                  className={`px-4 py-3 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors group ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                >
                  <span className="text-lg shrink-0 mt-0.5">
                    {TYPE_ICON[n.type] ?? '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${!n.isRead ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  <div className="flex items-start gap-1.5 shrink-0 mt-0.5">
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                    )}
                    <button
                      onClick={(e) => handleDeleteOne(e, n.id, !n.isRead)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50"
                      title="Dismiss"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  )
}
