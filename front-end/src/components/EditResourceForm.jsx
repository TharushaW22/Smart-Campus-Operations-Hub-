import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, CheckCircle2, AlertCircle,
  Save, X, ImagePlus
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const EditResourceForm = () => {
  const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Room',
    capacity: '',
    location: '',
    status: 'Active',
    imageUrl: ''
  });

  const [errors, setErrors] = useState({});
//State is well structured and clearly separates UI states, form data, and validation errors
  useEffect(() => {
    const fetchResource = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/resources/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }); // Fetch resource details from backend
        setFormData(response.data);
        if (response.data.imageUrl) {
          setImagePreview(response.data.imageUrl);
        }
        setLoading(false);
      } catch {
        setError('Failed to fetch resource details.');
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedImage(null);
      setImagePreview(formData.imageUrl || '');
      setErrors(prev => ({ ...prev, image: null }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSelectedImage(null);
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file.' }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setSelectedImage(null);
      setErrors(prev => ({ ...prev, image: 'Image must be 5MB or smaller.' }));
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, image: null }));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Resource name is required';
    if (!formData.capacity && formData.capacity !== 0) newErrors.capacity = 'Capacity is required';
    else if (isNaN(formData.capacity) || parseInt(formData.capacity) < 0) 
      newErrors.capacity = 'Capacity must be a non-negative number';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const resourcePayload = { ...formData };

      if (selectedImage) {
        const uploadData = new FormData();
        uploadData.append('image', selectedImage);

        const uploadResponse = await axios.post('http://localhost:8080/api/resources/upload-image', uploadData, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });

        resourcePayload.imageUrl = uploadResponse.data?.imageUrl || '';
      }

      await axios.put(`http://localhost:8080/api/resources/${id}`, resourcePayload, { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true 
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin/resources', { state: { flash: 'Resource updated successfully.' } }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update resource. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading resource details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50/50">
      <main className="min-h-screen w-full flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/resources')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Edit Resource</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
          <div className="w-full max-w-2xl">
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-4">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Resource updated successfully! Redirecting...</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 md:p-10 transition-all">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Resource Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={cn(
                      "w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-4 transition-all",
                      errors.name ? "border-red-300 focus:ring-red-500/10" : "border-gray-200 focus:ring-blue-500/10"
                    )}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1rem_center] bg-no-repeat"
                    >
                      <option value="Room">Room</option>
                      <option value="Lab">Lab</option>
                      <option value="Equipment">Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      className={cn(
                        "w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-4 transition-all",
                        errors.capacity ? "border-red-300 focus:ring-red-500/10" : "border-gray-200 focus:ring-blue-500/10"
                      )}
                    />
                    {errors.capacity && <p className="mt-1 text-xs text-red-600 font-medium">{errors.capacity}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={cn(
                      "w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-4 transition-all",
                      errors.location ? "border-red-300 focus:ring-red-500/10" : "border-gray-200 focus:ring-blue-500/10"
                    )}
                  />
                  {errors.location && <p className="mt-1 text-xs text-red-600 font-medium">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1rem_center] bg-no-repeat"
                  >
                    <option value="Active">Active</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Resource Image</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer">
                      <ImagePlus className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {selectedImage ? selectedImage.name : 'Change image (optional)'}
                      </span>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF, WEBP (max 5MB)</p>

                    {errors.image && <p className="text-xs text-red-600 font-medium">{errors.image}</p>}

                    {imagePreview && (
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
                        <img
                          src={imagePreview}
                          alt="Resource preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-3 right-3 p-2 bg-white/95 text-gray-700 rounded-lg shadow hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/resources')}
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Update Resource
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditResourceForm;
