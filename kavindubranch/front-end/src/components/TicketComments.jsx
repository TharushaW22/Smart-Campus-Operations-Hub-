import { useEffect, useState, useRef } from 'react'
import commentService from '../services/commentService'

const ROLE_COLORS = {
  ADMIN:      'bg-purple-100 text-purple-700',
  TECHNICIAN: 'bg-orange-100 text-orange-700',
  USER:       'bg-blue-100 text-blue-700',
}

function formatTime(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function TicketComments({ ticketId, currentUser }) {
  const [comments, setComments]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [newText, setNewText]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId]   = useState(null)
  const [editText, setEditText]     = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    commentService.getComments(ticketId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [ticketId])

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newText.trim()) return
    setSubmitting(true)
    try {
      const added = await commentService.addComment(ticketId, newText.trim())
      setComments(prev => [...prev, added])
      setNewText('')
      scrollToBottom()
    } catch { /* silently fail */ } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return
    try {
      const updated = await commentService.updateComment(ticketId, commentId, editText.trim())
      setComments(prev => prev.map(c => c.id === commentId ? updated : c))
      setEditingId(null)
    } catch { /* silently fail */ }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await commentService.deleteComment(ticketId, commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch { /* silently fail */ }
  }

  const startEdit = (comment) => {
    setEditingId(comment.id)
    setEditText(comment.content)
  }

  const isAdmin = currentUser?.role === 'ADMIN'
  const canEdit  = (c) => c.authorId === currentUser?.id
  const canDelete = (c) => c.authorId === currentUser?.id || isAdmin

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          Discussion Thread
        </p>
        <span className="ml-auto text-[10px] font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
      </div>

      {/* Comment list */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-4 animate-pulse">Loading comments...</p>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
            <p className="text-xs text-slate-400 font-bold">No comments yet — be the first!</p>
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} className={`flex gap-3 group ${c.authorId === currentUser?.id ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              {c.authorPicture
                ? <img src={c.authorPicture} alt="" className="w-7 h-7 rounded-full shrink-0 ring-2 ring-white" />
                : <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-black text-[10px] shrink-0">
                    {c.authorName?.[0]?.toUpperCase()}
                  </div>
              }

              <div className={`flex-1 min-w-0 ${c.authorId === currentUser?.id ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {/* Author + role + time */}
                <div className={`flex items-center gap-1.5 ${c.authorId === currentUser?.id ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] font-black text-slate-700">{c.authorName}</span>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${ROLE_COLORS[c.authorRole] || 'bg-slate-100 text-slate-500'}`}>
                    {c.authorRole}
                  </span>
                  <span className="text-[9px] text-slate-400">{formatTime(c.createdAt)}</span>
                  {c.createdAt !== c.updatedAt && (
                    <span className="text-[9px] text-slate-300 italic">(edited)</span>
                  )}
                </div>

                {/* Content or edit form */}
                {editingId === c.id ? (
                  <div className="flex gap-2 w-full">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={2}
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-none bg-white"
                    />
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleEdit(c.id)} className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 transition-colors">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className={`relative max-w-xs sm:max-w-sm ${c.authorId === currentUser?.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'} rounded-2xl px-3.5 py-2.5`}>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{c.content}</p>

                    {/* Action buttons */}
                    {(canEdit(c) || canDelete(c)) && (
                      <div className={`absolute -top-2 ${c.authorId === currentUser?.id ? 'left-0' : 'right-0'} hidden group-hover:flex gap-0.5 bg-white shadow-lg rounded-lg border border-slate-100 p-0.5`}>
                        {canEdit(c) && (
                          <button
                            onClick={() => startEdit(c)}
                            className="p-1 rounded hover:bg-slate-100 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                        )}
                        {canDelete(c) && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Add comment form */}
      <form onSubmit={handleAdd} className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
        {currentUser?.picture
          ? <img src={currentUser.picture} alt="" className="w-7 h-7 rounded-full shrink-0 ring-2 ring-white mt-1" />
          : <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-black text-[10px] shrink-0 mt-1">
              {currentUser?.name?.[0]?.toUpperCase()}
            </div>
        }
        <div className="flex-1 flex gap-2">
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(e) } }}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-none bg-slate-50/50 transition-all"
          />
          <button
            type="submit"
            disabled={submitting || !newText.trim()}
            className="self-end px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[11px] font-black rounded-2xl transition-all active:scale-95"
          >
            {submitting ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
