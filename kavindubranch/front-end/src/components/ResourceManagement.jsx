import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit2, Trash2, 
  ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2,
  LayoutDashboard, School, Calendar, Ticket, LogOut, Menu, X,
  Building2, Activity, AlertTriangle, AlertCircle, CheckCircle2,
  MapPin, Users, Box, Monitor, Sparkles, Zap, Settings, Bell, Info
} from 'lucide-react';

const cn = (...inputs) => inputs.filter(Boolean).join(' ');

// eslint-disable-next-line no-unused-vars
const SummaryCard = ({ title, value, icon: SummaryIcon, colorClass, loading, trend }) => (
  <div className="group bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col gap-6 transition-all hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1">
    <div className="flex justify-between items-start">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", colorClass)}>
        <SummaryIcon className="w-7 h-7" />
      </div>
      {trend && (
        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      {loading ? (
        <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-xl" />
      ) : (
        <h3 className="text-4xl font-black text-slate-900 tracking-tight">{value}</h3>
      )}
    </div>
  </div>
);

const ResourceManagement = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [summary, setSummary] = useState({ totalResources: 0, activeResources: 0, outOfServiceResources: 0 });
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [success, setSuccess] = useState(null);

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/resources/summary', { 
        headers: { 'Authorization': `Bearer ${token}` },
        withCredentials: true 
      });
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setTimeout(() => setSummaryLoading(false), 400);
    }
  };

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        page,
        size: 8,
        search: search || undefined,
        type: filters.type || undefined,
        status: filters.status || undefined,
      };
      
      const response = await axios.get('http://localhost:8080/api/resources', { 
        params,
        headers: { 'Authorization': `Bearer ${token}` },
        withCredentials: true 
      });
      setResources(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchResources();
    fetchSummary();
  }, [fetchResources]);

  const handleDelete = async () => {
    if (!resourceToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/resources/${resourceToDelete.id}`, { 
        headers: { 'Authorization': `Bearer ${token}` },
        withCredentials: true 
      });
      setSuccess('Resource purged successfully');
      fetchResources();
      fetchSummary();
      setTimeout(() => { setResourceToDelete(null); setSuccess(null); }, 2000);
    } catch {
      console.error('Failed to delete resource');
    } finally {
      setIsDeleting(false);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Analytics', id: 'dashboard' },
    { icon: School, label: 'Inventory', id: 'resources', active: true },
    { icon: Calendar, label: 'Schedule', id: 'bookings' },
    { icon: Ticket, label: 'Support', id: 'tickets' },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <aside className={cn(
        "bg-slate-50 border-r border-slate-100 transition-all duration-500 ease-in-out flex flex-col z-[110]",
        isSidebarOpen ? "w-[280px]" : "w-24"
      )}>
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col leading-none">
              <span className="font-black text-slate-900 text-lg">Admin<span className="text-blue-600">Hub</span></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">v2.0 Elite</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300",
                item.active 
                  ? "bg-white text-blue-600 shadow-sm border border-slate-100 font-bold scale-[1.02]" 
                  : "text-slate-400 hover:text-slate-900 hover:bg-white"
              )}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              {isSidebarOpen && <span className="text-sm tracking-tight">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm group">
            <LogOut className="w-6 h-6 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-24 px-12 flex items-center justify-between sticky top-0 z-[100] bg-white border-b border-slate-50">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 shadow-sm"
            >
              {isSidebarOpen ? <X className="w-5 h-5 text-slate-400" /> : <Menu className="w-5 h-5 text-slate-400" />}
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Resource Infrastructure</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Asset Management Control</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden xl:flex items-center gap-2 pr-6 border-r border-slate-100">
              <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={() => navigate('/admin/resources/add')}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-[1.5rem] flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-200 text-sm font-black tracking-tight"
            >
              <Plus className="w-5 h-5" />
              Register Asset
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SummaryCard 
              title="Global Inventory" 
              value={summary.totalResources}
              icon={Box}
              colorClass="bg-blue-600 text-white"
              loading={summaryLoading}
              trend="+2.4% MoM"
            />
            <SummaryCard 
              title="Active Capacity" 
              value={summary.activeResources}
              icon={Activity}
              colorClass="bg-emerald-500 text-white"
              loading={summaryLoading}
              trend="94% Utilization"
            />
            <SummaryCard 
              title="Offline Assets" 
              value={summary.outOfServiceResources}
              icon={AlertTriangle}
              colorClass="bg-rose-500 text-white"
              loading={summaryLoading}
            />
          </div>

          <div className="space-y-8">
            <div className="flex flex-col xl:flex-row gap-6 items-center">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors w-6 h-6" />
                <input
                  type="text"
                  placeholder="Filter by asset name, location or serial..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 outline-none transition-all text-sm font-bold placeholder:text-slate-300"
                />
              </div>
              <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto no-scrollbar pb-2 xl:pb-0">
                {['All', 'Room', 'Lab', 'Equipment'].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setFilters(f => ({ ...f, type: t === 'All' ? '' : t })); setPage(0); }}
                    className={cn(
                      "px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all",
                      (filters.type === t || (t === 'All' && !filters.type)) 
                        ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" 
                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Identity</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Location Hub</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Capacity</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Operational Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[...Array(6)].map((_, j) => (
                          <td key={j} className="px-8 py-6"><div className="h-6 bg-slate-50 rounded-lg w-full"></div></td>
                        ))}
                      </tr>
                    ))
                  ) : resources.length > 0 ? (
                    resources.map((resource) => (
                      <tr key={resource.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-50 group-hover:scale-110 transition-transform">
                              {resource.type === 'Room' && <LayoutDashboard className="w-5 h-5 text-blue-600" />}
                              {resource.type === 'Lab' && <Box className="w-5 h-5 text-indigo-600" />}
                              {resource.type === 'Equipment' && <Monitor className="w-5 h-5 text-amber-600" />}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 tracking-tight">{resource.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 leading-none mt-1">ID: {String(resource.id).padStart(5, '0')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                            resource.type === 'Room' ? "bg-blue-50 text-blue-700" : 
                            resource.type === 'Lab' ? "bg-indigo-50 text-indigo-700" : 
                            "bg-amber-50 text-amber-700"
                          )}>
                            {resource.type}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-4 h-4 text-slate-300" />
                            <span className="text-sm font-bold">{resource.location}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                            <Users className="w-4 h-4 text-slate-300" />
                            {resource.capacity}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                            resource.status === 'Active' 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          )}>
                            <div className={cn("w-2 h-2 rounded-full animate-pulse", resource.status === 'Active' ? "bg-emerald-500" : "bg-rose-500")} />
                            {resource.status}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => navigate(`/admin/resources/edit/${resource.id}`)}
                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 hover:shadow-sm"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setResourceToDelete(resource)}
                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 hover:shadow-sm"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                            <Search className="w-10 h-10 text-slate-200" />
                          </div>
                          <p className="text-slate-400 font-bold">No infrastructure matching these parameters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Page {page + 1} of {totalPages || 1}
              </p>
              <div className="flex gap-3">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="p-3 rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all font-black text-xs uppercase tracking-widest bg-white shadow-sm flex items-center gap-2 group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Previous
                </button>
                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="p-3 rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all font-black text-xs uppercase tracking-widest bg-white shadow-sm flex items-center gap-2 group"
                >
                  Next
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {resourceToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setResourceToDelete(null)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-500" />
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-8">
                <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Purge Asset?</h3>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              Relocating asset <span className="font-black text-slate-900">#{resourceToDelete.name}</span> to archives. This operation cannot be reversed.
            </p>
            <div className="flex gap-4">
                <button 
                  onClick={() => setResourceToDelete(null)}
                  className="flex-1 py-5 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  Abort Action
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Purge'}
                </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed bottom-12 right-12 z-[210] flex items-center gap-4 bg-emerald-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-300" />
          </div>
          <span className="font-black uppercase tracking-widest text-[11px]">{success}</span>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;
