import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import profileService from '../services/profileService'
import NotificationPreferencesPanel from '../components/NotificationPreferencesPanel'

const BACKEND_URL = 'http://localhost:8080'
const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

function getAvatarSrc(picture) {
  if (!picture) return null
  if (picture.startsWith('http')) return picture
  return `${BACKEND_URL}${picture}`
}

function validateName(value) {
  if (!value || !value.trim()) return 'Full name is required.'
  if (value.trim().length < 2) return 'Name must be at least 2 characters.'
  if (value.trim().length > 80) return 'Name cannot exceed 80 characters.'
  if (/^\d+$/.test(value.trim())) return 'Name cannot be numbers only.'
  return null
}

function validatePhone(value) {
  if (!value || !value.trim()) return null // optional
  const clean = value.trim().replace(/[\s\-().]/g, '')
  if (!/^\+?\d{7,15}$/.test(clean)) return 'Enter a valid phone number (7–15 digits, optional + prefix).'
  return null
}

function validateAddress(value) {
  if (!value || !value.trim()) return null // optional
  if (value.trim().length > 200) return 'Address cannot exceed 200 characters.'
  return null
}

function validatePhoto(file) {
  if (!file) return null
  if (!ALLOWED_TYPES.includes(file.type)) return 'Only JPG, PNG, GIF, or WebP images are allowed.'
  if (file.size > MAX_PHOTO_BYTES) return `Photo is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`
  return null
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [address, setAddress] = useState(user?.address || '')
  const [photoFile, setPhotoFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(getAvatarSrc(user?.picture) || null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Field-level errors
  const [errors, setErrors] = useState({ name: null, phone: null, address: null, photo: null })

  const fileInputRef = useRef(null)

  const roleLabel = {
    USER: 'Student',
    ADMIN: 'Administrator',
    TECHNICIAN: 'Technician',
  }[user?.role] || 'User'

  const dashboardPath = {
    USER: '/dashboard/user',
    ADMIN: '/dashboard/admin',
    TECHNICIAN: '/dashboard/technician',
  }[user?.role] || '/'

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleNameChange = (e) => {
    setName(e.target.value)
    setErrors(prev => ({ ...prev, name: validateName(e.target.value) }))
  }

  const handlePhoneChange = (e) => {
    setPhone(e.target.value)
    setErrors(prev => ({ ...prev, phone: validatePhone(e.target.value) }))
  }

  const handleAddressChange = (e) => {
    setAddress(e.target.value)
    setErrors(prev => ({ ...prev, address: validateAddress(e.target.value) }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const photoError = validatePhoto(file)
    if (photoError) {
      setErrors(prev => ({ ...prev, photo: photoError }))
      // Reset the input so the user can pick again
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
    setSuccess(false)
    if (!validate()) return

    setSaving(true)
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('phone', phone.trim())
    formData.append('address', address.trim())
    formData.append('removePhoto', removePhoto)
    if (photoFile) formData.append('photo', photoFile)

    try {
      await profileService.updateProfile(formData)
      await refreshUser()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error
      if (err.response?.status === 413 || (msg && msg.toLowerCase().includes('size'))) {
        setErrors(prev => ({ ...prev, photo: 'Photo exceeds the 5 MB server limit. Please choose a smaller image.' }))
      } else {
        setSubmitError(msg || 'Failed to save profile. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const currentAvatar = removePhoto ? null : previewUrl
  const hasErrors = Object.values(errors).some(Boolean)

  // ── UI ──────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0 h-screen sticky top-0">
        <div className="px-8 py-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-white font-black text-xs tracking-tight">Smart Campus</p>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">{roleLabel} Profile</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <button
            onClick={() => navigate(dashboardPath)}
            className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
          >
            <span className="text-sm opacity-80">←</span>
            Back to Dashboard
          </button>
          <div className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <span className="text-sm opacity-80">👤</span>
            Edit Profile
          </div>
        </nav>

        <div className="p-4 shrink-0 bg-slate-900 border-t border-slate-800/50">
          <div className="bg-slate-800/40 rounded-[2rem] p-4 border border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                {currentAvatar
                  ? <img src={currentAvatar} alt="" className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover" />
                  : <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-black text-xs">{user?.name?.[0]}</div>
                }
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-800 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-black truncate leading-tight">{user?.name?.split(' ')[0]}</p>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">{roleLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Profile</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-1.5">
              Manage your personal information
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* ── Profile Photo ── */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Profile Photo</h2>
              <div className="flex items-center gap-6">
                <div className="shrink-0">
                  {currentAvatar
                    ? <img src={currentAvatar} alt="Profile" className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" />
                    : <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-black text-2xl shadow-sm">
                        {user?.name?.[0]}
                      </div>
                  }
                </div>

                <div className="flex flex-col gap-3">
                  <label className={`cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${errors.photo ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {errors.photo ? 'Try Again' : 'Upload Photo'}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>

                  {(currentAvatar || user?.picture) && !removePhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove Photo
                    </button>
                  )}

                  {errors.photo
                    ? <p className="text-[10px] text-red-500 font-bold flex items-start gap-1.5">
                        <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {errors.photo}
                      </p>
                    : <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">JPG, PNG, GIF, WebP — max 5 MB</p>
                  }
                </div>
              </div>
            </div>

            {/* ── Personal Info ── */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Information</h2>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => setErrors(prev => ({ ...prev, name: validateName(name) }))}
                  placeholder="Your full name"
                  maxLength={80}
                  className={`w-full px-5 py-3.5 rounded-2xl border bg-slate-50/50 focus:bg-white focus:ring-4 outline-none transition-all text-sm font-medium text-slate-800 ${
                    errors.name
                      ? 'border-red-300 focus:ring-red-50'
                      : 'border-slate-100 focus:ring-blue-50'
                  }`}
                />
                {errors.name && (
                  <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {errors.name}
                  </p>
                )}
                <p className={`text-[9px] ml-1 font-bold tracking-wide text-right ${name.trim().length > 72 ? 'text-amber-500' : 'text-slate-300'}`}>
                  {name.trim().length}/80
                </p>
              </div>

              {/* Email — read only */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Email <span className="text-slate-300 normal-case font-bold tracking-normal">(cannot be changed)</span>
                </label>
                <div className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-100/60 text-sm font-medium text-slate-400 select-none cursor-not-allowed flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  {user?.email}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Phone Number <span className="text-slate-300 font-bold normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setErrors(prev => ({ ...prev, phone: validatePhone(phone) }))}
                  placeholder="e.g. +94 77 123 4567"
                  className={`w-full px-5 py-3.5 rounded-2xl border bg-slate-50/50 focus:bg-white focus:ring-4 outline-none transition-all text-sm font-medium text-slate-800 ${
                    errors.phone
                      ? 'border-red-300 focus:ring-red-50'
                      : 'border-slate-100 focus:ring-blue-50'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Address <span className="text-slate-300 font-bold normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={address}
                  onChange={handleAddressChange}
                  onBlur={() => setErrors(prev => ({ ...prev, address: validateAddress(address) }))}
                  placeholder="Your home or office address"
                  rows={3}
                  maxLength={200}
                  className={`w-full px-5 py-3.5 rounded-2xl border bg-slate-50/50 focus:bg-white focus:ring-4 outline-none transition-all text-sm font-medium text-slate-800 resize-none ${
                    errors.address
                      ? 'border-red-300 focus:ring-red-50'
                      : 'border-slate-100 focus:ring-blue-50'
                  }`}
                />
                {errors.address
                  ? <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {errors.address}
                    </p>
                  : <p className={`text-[9px] ml-1 font-bold tracking-wide text-right ${address.trim().length > 180 ? 'text-amber-500' : 'text-slate-300'}`}>
                      {address.trim().length}/200
                    </p>
                }
              </div>
            </div>

            {/* ── Notification Preferences ── */}
            <NotificationPreferencesPanel userRole={user?.role} />

            {/* ── Submit feedback ── */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs font-bold text-red-600">{submitError}</p>
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs font-bold text-emerald-600">Profile saved successfully!</p>
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || hasErrors}
                className="flex-1 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(dashboardPath)}
                className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}
