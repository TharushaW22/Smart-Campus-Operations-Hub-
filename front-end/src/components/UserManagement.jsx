import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN']
const BACKEND_URL = 'http://localhost:8080'
const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

function avatarSrc(picture) {
  if (!picture) return null
  if (picture.startsWith('http')) return picture
  return `${BACKEND_URL}${picture}`
}

// ── Validation helpers ────────────────────────────────────────────────────────

function validateName(v) {
  if (!v || !v.trim()) return 'Full name is required.'
  if (v.trim().length < 2) return 'Name must be at least 2 characters.'
  if (v.trim().length > 80) return 'Name cannot exceed 80 characters.'
  if (/^\d+$/.test(v.trim())) return 'Name cannot be numbers only.'
  return null
}

function validatePhone(v) {
  if (!v || !v.trim()) return null
  const clean = v.trim().replace(/[\s\-().]/g, '')
  if (!/^\+?\d{7,15}$/.test(clean)) return 'Enter a valid phone number (7–15 digits, optional + prefix).'
  return null
}

function validateAddress(v) {
  if (!v || !v.trim()) return null
  if (v.trim().length > 200) return 'Address cannot exceed 200 characters.'
  return null
}

function validatePhoto(file) {
  if (!file) return null
  if (!ALLOWED_TYPES.includes(file.type)) return 'Only JPG, PNG, GIF, or WebP images are allowed.'
  if (file.size > MAX_PHOTO_BYTES) return `Photo is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`
  return null
}

// ── EditUserModal ─────────────────────────────────────────────────────────────

function EditUserModal({ user, onClose, onSaved }) {
  const [name, setName] = useState(user.name || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [address, setAddress] = useState(user.address || '')
  const [photoFile, setPhotoFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(avatarSrc(user.picture) || null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [errors, setErrors] = useState({ name: null, phone: null, address: null, photo: null })
  const fileInputRef = useRef(null)

  const currentAvatar = removePhoto ? null : previewUrl
  const hasErrors = Object.values(errors).some(Boolean)

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const photoError = validatePhoto(file)
    if (photoError) {
      setErrors(prev => ({ ...prev, photo: photoError }))
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setErrors(prev => ({ ...prev, photo: null }))
    setPhotoFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setRemovePhoto(false)
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPreviewUrl(null)
    setRemovePhoto(true)
    setErrors(prev => ({ ...prev, photo: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validate = () => {
    const next = {
      name: validateName(name),
      phone: validatePhone(phone),
      address: validateAddress(address),
      photo: null,
    }
    setErrors(next)
    return !next.name && !next.phone && !next.address
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return

    setSaving(true)
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('phone', phone.trim())
    formData.append('address', address.trim())
    formData.append('removePhoto', removePhoto)
    if (photoFile) formData.append('photo', photoFile)

    try {
      const res = await axios.patch(
        `${BACKEND_URL}/api/admin/users/${user.id}/profile`,
        formData,
        { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } }
      )
      onSaved(res.data)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error
      if (err.response?.status === 413 || (msg && msg.toLowerCase().includes('size'))) {
        setErrors(prev => ({ ...prev, photo: 'Photo exceeds the 5 MB server limit. Please choose a smaller image.' }))
      } else {
        setSubmitError(msg || 'Failed to save changes.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-sm tracking-tight">Edit User</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Admin — User Profile</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-8 space-y-5">

          {/* Photo */}
          <div className="flex items-center gap-5">
            <div className="shrink-0">
              {currentAvatar
                ? <img src={currentAvatar} alt="" className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                : <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-purple-600 to-purple-400 flex items-center justify-center text-white font-black text-xl shadow-sm">
                    {user.name?.[0]}
                  </div>
              }
            </div>
            <div className="flex flex-col gap-2">
              <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${errors.photo ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-900 text-white hover:bg-purple-600'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                {errors.photo ? 'Try Again' : 'Upload Photo'}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handlePhotoChange} className="hidden" />
              </label>
              {(currentAvatar || user.picture) && !removePhoto && (
                <button type="button" onClick={handleRemovePhoto}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Remove
                </button>
              )}
              {errors.photo
                ? <p className="text-[10px] text-red-500 font-bold flex items-start gap-1"><svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.photo}</p>
                : <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">JPG, PNG, GIF, WebP — max 5 MB</p>
              }
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text" value={name} maxLength={80}
              onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: validateName(e.target.value) })) }}
              onBlur={() => setErrors(prev => ({ ...prev, name: validateName(name) }))}
              className={`w-full px-4 py-3 rounded-2xl border bg-slate-50/50 focus:bg-white focus:ring-4 outline-none transition-all text-sm font-medium text-slate-800 ${errors.name ? 'border-red-300 focus:ring-red-50' : 'border-slate-100 focus:ring-purple-50'}`}
            />
            {errors.name && (
              <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.name}</p>
            )}
          </div>

          {/* Email — read only */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Email <span className="text-slate-300 normal-case font-bold tracking-normal">(cannot be changed)</span>
            </label>
            <div className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-100/60 text-sm font-medium text-slate-400 cursor-not-allowed select-none flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              {user.email}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Phone <span className="text-slate-300 font-bold normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="tel" value={phone} placeholder="e.g. +94 77 123 4567"
              onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: validatePhone(e.target.value) })) }}
              onBlur={() => setErrors(prev => ({ ...prev, phone: validatePhone(phone) }))}
              className={`w-full px-4 py-3 rounded-2xl border bg-slate-50/50 focus:bg-white focus:ring-4 outline-none transition-all text-sm font-medium text-slate-800 ${errors.phone ? 'border-red-300 focus:ring-red-50' : 'border-slate-100 focus:ring-purple-50'}`}
            />
            {errors.phone && (
              <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Address <span className="text-slate-300 font-bold normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={address} placeholder="Home or office address" rows={2} maxLength={200}
              onChange={e => { setAddress(e.target.value); setErrors(prev => ({ ...prev, address: validateAddress(e.target.value) })) }}
              onBlur={() => setErrors(prev => ({ ...prev, address: validateAddress(address) }))}
              className={`w-full px-4 py-3 rounded-2xl border bg-slate-50/50 focus:bg-white focus:ring-4 outline-none transition-all text-sm font-medium text-slate-800 resize-none ${errors.address ? 'border-red-300 focus:ring-red-50' : 'border-slate-100 focus:ring-purple-50'}`}
            />
            {errors.address && (
              <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.address}</p>
            )}
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs font-bold text-red-600">{submitError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving || hasErrors}
              className="flex-1 py-3 rounded-2xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-[0.98]">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UserManagement() {
  const { user: currentUser, refreshUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/admin/users`, { headers: authHeaders() })
      .then(res => setUsers(res.data))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = (id, role) => {
    axios.patch(
      `${BACKEND_URL}/api/admin/users/${id}/role`,
      { role },
      { headers: authHeaders() }
    ).then(res => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: res.data.role } : u))
      if (currentUser?.id === id) refreshUser()
    }).catch(err => {
      alert(err.response?.data?.error ?? 'Failed to update role.')
    })
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this user?')) return
    axios.delete(`${BACKEND_URL}/api/admin/users/${id}`, { headers: authHeaders() })
      .then(() => setUsers(prev => prev.filter(u => u.id !== id)))
      .catch(() => alert('Failed to delete user.'))
  }

  const handleSaved = (updated) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    if (currentUser?.id === updated.id) refreshUser()
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading users…</p>
  if (error) return <p className="text-red-500 text-sm">{error}</p>

  return (
    <>
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="mt-6">
        <h3 className="text-md font-semibold text-gray-700 mb-3">User Management</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {avatarSrc(u.picture)
                        ? <img src={avatarSrc(u.picture)} alt="" className="w-7 h-7 rounded-full object-cover" />
                        : <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">{u.name?.[0]}</div>
                      }
                      <span className="font-medium text-gray-700">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.id === currentUser?.id ? (
                      <span className="text-xs text-gray-400 px-2 py-1">{u.role}</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-300"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingUser(u)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Edit
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
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
          {users.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">No users found.</p>
          )}
        </div>
      </div>
    </>
  )
}
