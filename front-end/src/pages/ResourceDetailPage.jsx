import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, MapPin, Users, Box, Monitor, Info, 
  Calendar, CheckCircle2, AlertCircle, Clock, 
  ChevronRight, Layout, Sparkles, ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSidebarLayout from '../components/RoleSidebarLayout';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const ResourceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/resources/${id}`, {
          headers: { Authorization: 'Bearer ' + token },
          withCredentials: true
        });
        setResource(response.data);
      } catch (err) {
        console.error('Error fetching resource details:', err);
        setError('Failed to load resource details. It might have been removed or you don\'t have permission.');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  if (loading) {
    return (
      <RoleSidebarLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Identity...</p>
          </div>
        </div>
      </RoleSidebarLayout>
    );
  }

  if (error || !resource) {
    return (
      <RoleSidebarLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-xl">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-100">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Access Restricted</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">{error || 'Resource not found'}</p>
            <button onClick={() => navigate('/resources')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
              <ArrowLeft className="w-5 h-5" />
              Back to Discovery
            </button>
          </div>
        </div>
      </RoleSidebarLayout>
    );
  }

  const isAvailable = resource.status === 'Active';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <RoleSidebarLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <button onClick={() => navigate('/resources')} className="mb-10 flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-all font-bold group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:border-blue-200 group-hover:shadow-blue-500/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase tracking-widest">Back to Directory</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-12 xl:col-span-8 space-y-10">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12">
                <div className="w-full md:w-80 h-80 rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                  {resource.imageUrl ? (
                    <img src={resource.imageUrl} alt={resource.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20 bg-gradient-to-br from-slate-100 to-slate-200">
                      <Layout className="w-24 h-24" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col pt-4">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md",
                      resource.type === 'Room' ? "text-blue-600 bg-blue-50 border-blue-100" :
                      resource.type === 'Lab' ? "text-indigo-600 bg-indigo-50 border-indigo-100" :
                      "text-amber-600 bg-amber-50 border-amber-100"
                    )}>
                      {resource.type}
                    </div>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md",
                      isAvailable ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                    )}>
                      {isAvailable ? 'Instant Access' : 'Currently Reserved'}
                    </div>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">{resource.name}</h1>
                  
                  <div className="flex flex-wrap items-center gap-8 mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Building Center</p>
                        <p className="text-sm font-bold text-slate-700">{resource.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Max Occupancy</p>
                        <p className="text-sm font-bold text-slate-700">{resource.capacity} Seats</p>
                      </div>
                    </div>
                  </div>

                  {!isAdmin && (
                    <div className="mt-auto flex flex-wrap gap-4">
                      <button
                        disabled={!isAvailable}
                        onClick={() => navigate(`/bookings/create?resourceId=${resource.id ?? id}`)}
                        className="flex-1 py-4 px-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3"
                      >
                        <CalendarCheck className="w-5 h-5" />
                        {isAvailable ? 'Book This Resource' : 'Waitlist Access'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isAdmin && (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'overview', label: 'Overview', icon: Layout },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "px-8 py-6 text-sm font-bold flex items-center gap-3 border-b-2 transition-all shrink-0",
                        activeTab === tab.id ? "text-blue-600 border-blue-600 bg-blue-50/30" : "text-slate-400 border-transparent hover:text-slate-600"
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="p-10">
                  {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                      <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Resource Highlights</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                            <p className="font-black text-slate-900 text-sm uppercase tracking-widest">Verified Facility</p>
                          </div>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">This resource has been recently inspected by regional campus staff and meets all standard operating procedures for {resource.type} usage.</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            <p className="font-black text-slate-900 text-sm uppercase tracking-widest">Usage Rights</p>
                          </div>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">Standard 4-hour booking windows apply. Advanced recurring reservations require department head approval.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab !== 'overview' && (
                    <div className="py-12 text-center text-slate-400 italic font-medium animate-in fade-in">
                      Additional data for {activeTab} will be available in the next version update.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-12 xl:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                  <ShieldCheck className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">Resource Policy</h3>
                <p className="text-blue-100/70 text-sm font-medium leading-relaxed mb-8">All reservations must be made at least 24 hours in advance. Cancellation within 2 hours of arrival may impact your reliability score.</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-widest">RFID Access Enabled</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-widest">Power & High-Speed WiFi</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </RoleSidebarLayout>
  );
};

export default ResourceDetailPage;