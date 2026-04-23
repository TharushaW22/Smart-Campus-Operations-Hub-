import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, MapPin, Users, Layout, ChevronRight, Info, ChevronLeft, Box, Monitor } from 'lucide-react';
import RoleSidebarLayout from '../components/RoleSidebarLayout';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const ResourceCard = ({ resource, navigate }) => {
  const isAvailable = resource.status === 'Active';
  const getTypeStyles = (type) => {
    switch(type) {
      case 'Room': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Lab': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Equipment': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };
  const getIcon = (type) => {
    switch(type) {
      case 'Room': return <Layout className='w-4 h-4' />;
      case 'Lab': return <Box className='w-4 h-4' />;
      case 'Equipment': return <Monitor className='w-4 h-4' />;
      default: return <Info className='w-4 h-4' />;
    }
  };
  return (
    <div className='group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden'>
      <div className='relative h-40 overflow-hidden bg-slate-100'>
        {resource.imageUrl ? <img src={resource.imageUrl} alt={resource.name} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' /> : <div className='w-full h-full flex items-center justify-center bg-slate-50'><div className='opacity-20 group-hover:scale-110 transition-transform'>{getIcon(resource.type)}</div></div>}
        <div className='absolute top-3 left-3 right-3 flex justify-between'>
          <div className={cn('px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md', getTypeStyles(resource.type))}><div className='flex items-center gap-1.5'>{getIcon(resource.type)}{resource.type}</div></div>
          <div className={cn('px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border', isAvailable ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20')}>{isAvailable ? 'Available' : 'Booked'}</div>
        </div>
      </div>
      <div className='p-5 flex-1 flex flex-col'>
        <div className='mb-3'><h3 className='text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1'>{resource.name}</h3><div className='flex items-center gap-1.5 text-slate-500 text-xs'><MapPin className='w-3.5 h-3.5' /><span className='truncate'>{resource.location}</span></div></div>
        <div className='grid grid-cols-2 gap-3 mb-5'><div className='bg-slate-50 rounded-xl p-2.5 border border-slate-100'><p className='text-[10px] text-slate-400 font-bold uppercase'>Capacity</p><p className='text-sm font-bold text-slate-700'>{resource.capacity}</p></div><div className='bg-slate-50 rounded-xl p-2.5 border border-slate-100'><p className='text-[10px] text-slate-400 font-bold uppercase'>Status</p><p className='text-sm font-bold text-slate-700'>Pristine</p></div></div>
        <div className='mt-auto flex items-center gap-2'>
          <button 
            onClick={() => navigate('/resources/' + resource.id)} 
            className='flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all'
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

const UserResourcePage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { page, size: 8, search: search || undefined, type: filterType !== 'All' ? filterType : undefined };
      const response = await axios.get('http://localhost:8080/api/user/resources', { params, headers: { Authorization: 'Bearer ' + token }, withCredentials: true });
      setResources(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) { console.error('Error fetching resources:', error); } finally { setLoading(false); }
  }, [page, search, filterType]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  return (
    <RoleSidebarLayout>
      <div className='flex flex-col min-w-0'>
        <header className='h-24 px-12 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-20'>
          <div><h1 className='text-2xl font-black text-slate-900 tracking-tight'>Available Resources</h1><p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Discover and Reserve Assets</p></div>
          <div className='flex items-center gap-6'><div className='flex items-center gap-2 p-1 bg-slate-100 rounded-xl'>{['All', 'Room', 'Lab', 'Equipment'].map((t) => (<button key={t} onClick={() => { setFilterType(t); setPage(0); }} className={cn('px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all', filterType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600')}>{t}</button>))}</div><div className='relative flex items-center group'><Search className='absolute left-4 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors' /><input type='text' placeholder='Quick search...' value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className='pl-12 pr-6 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 outline-none transition-all text-xs font-bold w-64' /></div></div>
        </header>
        <div className='flex-1 overflow-auto p-12'>
          {loading ? (<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>{[...Array(8)].map((_, i) => (<div key={i} className='h-80 bg-slate-50 rounded-2xl animate-pulse border border-slate-100' />))}</div>) : (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12'>{resources.length > 0 ? (resources.map((resource) => (<ResourceCard key={resource.id} resource={resource} navigate={navigate} />))) : (<div className='col-span-full py-32 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200'><div className='w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm'><Search className='w-8 h-8 text-slate-200' /></div><h3 className='text-xl font-black text-slate-900 mb-2'>No Matching Assets</h3><p className='text-slate-400 text-sm font-medium'>Try adjusting your search or filters to find what you need.</p></div>)}</div>
              {totalPages > 1 && (<div className='flex justify-center items-center gap-3'><button disabled={page === 0} onClick={() => setPage(p => p - 1)} className='p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all'><ChevronLeft className='w-5 h-5' /></button><div className='flex items-center gap-1.5'>{[...Array(totalPages)].map((_, i) => (<button key={i} onClick={() => { setPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={cn('w-10 h-10 rounded-xl font-bold text-xs transition-all', page === i ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-400 hover:bg-slate-50')}>{i + 1}</button>))}</div><button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} className='p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all'><ChevronRight className='w-5 h-5' /></button></div>)}
            </>
          )}
        </div>
      </div>
    </RoleSidebarLayout>
  );
};

export default UserResourcePage;
