import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ticketService from '../services/ticketService'

export default function NewIncidentPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [images, setImages] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.target)
    const data = {
      resourceLocation: formData.get('resourceLocation'),
      category: formData.get('category'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      preferredContactDetails: formData.get('preferredContactDetails'),
      images: images
    }

    try {
      await ticketService.createTicket(data)
      navigate('/dashboard/user')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3)
    setImages(files)
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 px-8 py-10 text-white">
            <h1 className="text-3xl font-bold">Report Incident</h1>
            <p className="text-slate-400 mt-2">Provide details about the maintenance issue or incident.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Resource / Location</label>
                <input
                  required
                  name="resourceLocation"
                  placeholder="e.g. Room 402, Projector A"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-hidden bg-slate-50/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Category</label>
                <select
                  required
                  name="category"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-hidden bg-slate-50/50"
                >
                  <option value="">Select category</option>
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="FURNITURE">Furniture</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Priority</label>
                <select
                  required
                  name="priority"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-hidden bg-slate-50/50"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Preferred Contact</label>
                <input
                  required
                  name="preferredContactDetails"
                  placeholder="Email or Phone"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-hidden bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Description</label>
              <textarea
                required
                name="description"
                rows={4}
                placeholder="Describe the issue in detail..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-hidden bg-slate-50/50 resize-none"
              ></textarea>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 ml-1">Attachments (Up to 3)</label>
              <div className="flex flex-wrap gap-4">
                <label className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                  <svg className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-2 group-hover:text-blue-500">Upload</span>
                </label>
                
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="w-32 h-32 rounded-2xl overflow-hidden border border-slate-100 relative group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-white text-xs font-bold">Image {idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${
                loading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200/50 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Incident Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
