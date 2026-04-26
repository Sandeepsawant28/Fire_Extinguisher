import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { Flame, Plus, Download, Search, Edit2, Trash2, CheckCircle2, AlertTriangle, ChevronDown, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [extinguishers, setExtinguishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState('All Floors');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    serial_id: '',
    type: 'ABC (DRY POWDER)',
    floor: 'Ground Floor',
    wing: '',
    location_detail: '',
    last_refilled: '',
    due_date: ''
  });

  useEffect(() => {
    fetchExtinguishers();
  }, [floorFilter, statusFilter]);

  const fetchExtinguishers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (floorFilter !== 'All Floors') params.floor = floorFilter;
      if (statusFilter !== 'All Status') params.status = statusFilter;
      
      const response = await axios.get(`${API_URL}/extinguishers`, { params });
      setExtinguishers(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${API_URL}/extinguishers/${editingItem.id}`, formData);
      } else {
        await axios.post(`${API_URL}/extinguishers`, formData);
      }
      setIsModalOpen(false);
      fetchExtinguishers();
      resetForm();
    } catch (error) {
      alert('Error saving data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`${API_URL}/extinguishers/${id}`);
        fetchExtinguishers();
      } catch (error) {
        alert('Error deleting');
      }
    }
  };

  const handleRefill = async (id) => {
    try {
      await axios.patch(`${API_URL}/extinguishers/${id}/refill`);
      fetchExtinguishers();
    } catch (error) {
      alert('Error updating refill');
    }
  };

  const handleExport = () => {
    const csv = Papa.unparse(extinguishers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `unifire_registry_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFormData({
      serial_id: '',
      type: 'ABC (DRY POWDER)',
      floor: 'Ground Floor',
      wing: '',
      location_detail: '',
      last_refilled: '',
      due_date: ''
    });
    setEditingItem(null);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      serial_id: item.serial_id,
      type: item.type,
      floor: item.floor,
      wing: item.wing,
      location_detail: item.location_detail,
      last_refilled: item.last_refilled,
      due_date: item.due_date
    });
    setIsModalOpen(true);
  };

  const stats = {
    total: extinguishers.length,
    upToDate: extinguishers.filter(e => e.status === 'UP TO DATE').length,
    dueSoon: extinguishers.filter(e => e.status.includes('DUE')).length,
    overdue: extinguishers.filter(e => e.status === 'OVERDUE').length
  };

  const filteredData = extinguishers.filter(item => 
    item.serial_id.toLowerCase().includes(search.toLowerCase()) ||
    item.location_detail.toLowerCase().includes(search.toLowerCase()) ||
    item.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-3 sm:p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-8 mb-8 sm:mb-12">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-600 rounded-xl sm:rounded-2xl flex-shrink-0 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <Flame className="text-white w-7 h-7 sm:w-10 sm:h-10" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-6xl font-black tracking-tighter uppercase italic leading-none text-white selection:bg-red-500">
              UNIFIRE REGISTRY
            </h1>
            <p className="text-white/40 text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] mt-1 sm:mt-3 font-black uppercase">
              DON BOSCO COLLEGE OF ENGINEERING, FATORDA, GOA
            </p>
          </div>
        </div>
        <div className="w-full lg:w-auto bg-red-600 rounded-lg sm:rounded-xl px-6 sm:px-8 py-2 sm:py-4 text-center shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          <div className="text-2xl sm:text-4xl font-black text-white italic leading-none">{stats.total}</div>
          <div className="text-[8px] font-black text-white uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1">Units Tracked</div>
        </div>
      </header>

      {/* Alert Banner */}
      {(stats.overdue > 0 || stats.dueSoon > 0) && (
        <div className="bg-red-950/10 border border-red-500/10 rounded-xl p-3 mb-6 sm:mb-10 flex items-center gap-3 text-red-500/60 text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-relaxed">
          <AlertTriangle size={12} className="text-red-500/80 flex-shrink-0" />
          <span>{stats.overdue} OVERDUE • {stats.dueSoon} DUE SOON</span>
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-10">
        <div className="stat-card border-l-2 border-l-red-600 p-3 sm:p-4">
          <div className="text-white/40 text-[8px] uppercase font-black tracking-widest">Total</div>
          <div className="text-3xl sm:text-5xl font-black italic text-red-500 my-0.5 sm:my-1">{stats.total}</div>
          <div className="text-white/40 text-[9px] font-bold">registered</div>
        </div>
        <div className="stat-card border-l-2 border-l-green-500 p-3 sm:p-4">
          <div className="text-white/40 text-[8px] uppercase font-black tracking-widest">Safe</div>
          <div className="text-3xl sm:text-5xl font-black italic text-green-500 my-0.5 sm:my-1">{stats.upToDate}</div>
          <div className="text-white/40 text-[9px] font-bold">up to date</div>
        </div>
        <div className="stat-card border-l-2 border-l-yellow-500 p-3 sm:p-4">
          <div className="text-white/40 text-[8px] uppercase font-black tracking-widest">Soon</div>
          <div className="text-3xl sm:text-5xl font-black italic text-yellow-500 my-0.5 sm:my-1">{stats.dueSoon}</div>
          <div className="text-white/40 text-[9px] font-bold">due 3 mo</div>
        </div>
        <div className="stat-card border-l-2 border-l-red-500/30 p-3 sm:p-4">
          <div className="text-white/40 text-[8px] uppercase font-black tracking-widest">Late</div>
          <div className="text-3xl sm:text-5xl font-black italic text-red-400 my-0.5 sm:my-1">{stats.overdue}</div>
          <div className="text-white/40 text-[9px] font-bold">overdue</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input 
            type="text" 
            placeholder="Search ID, location, type..."
            className="w-full bg-[#121212] border border-white/5 rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 transition-all placeholder:text-white/10 font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 sm:flex-none">
            <select 
              className="w-full bg-[#121212] border border-white/5 rounded-lg px-6 py-3 text-[10px] font-black uppercase tracking-widest appearance-none min-w-[140px] outline-none cursor-pointer hover:border-white/10 transition-all"
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
            >
              <option>All Floors</option>
              <option>Basement</option>
              <option>Ground Floor</option>
              <option>Floor 1</option>
              <option>Floor 2</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
          </div>
          <div className="relative flex-1 sm:flex-none">
            <select 
              className="w-full bg-[#121212] border border-white/5 rounded-lg px-6 py-3 text-[10px] font-black uppercase tracking-widest appearance-none min-w-[140px] outline-none cursor-pointer hover:border-white/10 transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Overdue</option>
              <option>Due This Month</option>
              <option>Due ~3 Mo</option>
              <option>Up To Date</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
          </div>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex-1 sm:flex-none btn-primary justify-center">
            <Plus size={16} strokeWidth={4} />
            Add Unit
          </button>
          <button onClick={handleExport} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:bg-white/5 transition-all">
            <Download size={14} />
            CSV
          </button>
        </div>
      </div>

      {/* Table View (Hidden on Mobile) */}
      <div className="hidden lg:block bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#151515]">
          <h2 className="text-2xl font-black italic uppercase flex items-center gap-3 text-red-600">
            <Flame size={24} fill="currentColor" />
            Registry
          </h2>
          <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
            {filteredData.length} records
          </span>
        </div>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#1a1a1a]">
                <th className="table-header w-12 text-center">#</th>
                <th className="table-header">ID / Serial</th>
                <th className="table-header">Type</th>
                <th className="table-header">Floor</th>
                <th className="table-header">Wing / Near</th>
                <th className="table-header">Refilled</th>
                <th className="table-header">Due Date</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="p-20 text-center animate-pulse text-white/20 font-black uppercase tracking-widest">Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="9" className="p-20 text-center text-white/10 font-black uppercase tracking-widest">No records found</td></tr>
              ) : filteredData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="table-cell text-center text-white/10 font-mono font-bold">{idx + 1}</td>
                  <td className="table-cell font-mono font-black text-white">{item.serial_id}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      item.type.includes('DCP') ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      item.type.includes('ABC') ? 'bg-blue-500/10 text-blue-400 border-blue-400/20' :
                      item.type.includes('CO2') ? 'bg-purple-500/10 text-purple-400 border-purple-400/20' :
                      'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="table-cell text-white/40 font-bold">{item.floor}</td>
                  <td className="table-cell">
                    <div className="text-white/80 font-black uppercase tracking-tight text-xs">{item.wing}</div>
                    <div className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-1">{item.location_detail}</div>
                  </td>
                  <td className="table-cell font-mono font-black text-white/60 text-xs">{item.last_refilled}</td>
                  <td className="table-cell font-mono font-black text-red-600/80 text-xs">{item.due_date}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      item.status === 'OVERDUE' ? 'badge-overdue' :
                      item.status === 'UP TO DATE' ? 'badge-uptodate' :
                      'badge-duesoon'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleRefill(item.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/5 text-green-500 border border-green-500/20 text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all group/btn">
                        <CheckCircle2 size={12} className="group-hover/btn:scale-110 transition-transform" />
                        <span>Refilled</span>
                      </button>
                      <button onClick={() => openEditModal(item)} className="action-btn bg-blue-500/5 text-blue-400 border border-blue-400/20 hover:bg-blue-500 hover:text-white">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="action-btn bg-red-500/5 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (Visible only on Mobile) */}
      <div className="lg:hidden space-y-4">
        <div className="flex justify-between items-center px-2 mb-4">
          <h2 className="text-lg font-black italic uppercase text-red-600">Unit Registry</h2>
          <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">{filteredData.length} units</span>
        </div>
        {loading ? (
           <div className="p-10 text-center animate-pulse text-white/20 font-black uppercase text-xs">Loading...</div>
        ) : filteredData.length === 0 ? (
           <div className="p-10 text-center text-white/10 font-black uppercase text-xs">No records found</div>
        ) : filteredData.map((item) => (
          <div key={item.id} className="bg-[#121212] border border-white/5 rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white font-black text-lg tracking-tight">{item.serial_id}</div>
                <div className="text-[10px] text-white/40 font-bold uppercase mt-1">{item.floor} • {item.wing}</div>
              </div>
              <span className={`badge ${
                item.status === 'OVERDUE' ? 'badge-overdue' :
                item.status === 'UP TO DATE' ? 'badge-uptodate' :
                'badge-duesoon'
              }`}>
                {item.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
              <div>
                <div className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">Type</div>
                <div className="text-[10px] text-white/80 font-bold uppercase">{item.type}</div>
              </div>
              <div>
                <div className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">Location</div>
                <div className="text-[10px] text-white/80 font-bold uppercase line-clamp-1">{item.location_detail}</div>
              </div>
              <div>
                <div className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">Last Refill</div>
                <div className="text-[10px] text-white/60 font-mono font-bold">{item.last_refilled}</div>
              </div>
              <div>
                <div className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">Due Date</div>
                <div className="text-[10px] text-red-500/80 font-mono font-bold">{item.due_date}</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => handleRefill(item.id)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-green-500/5 text-green-500 border border-green-500/20 text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">
                <CheckCircle2 size={12} />
                Refilled
              </button>
              <button onClick={() => openEditModal(item)} className="p-3 rounded-lg bg-blue-500/5 text-blue-400 border border-blue-400/20 hover:bg-blue-500 hover:text-white transition-all">
                <Edit2 size={12} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-3 rounded-lg bg-red-500/5 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#151515]">
              <h3 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
                <Plus className="text-red-600" size={20} />
                {editingItem ? 'Edit Unit' : 'Add Unit'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Serial ID</label>
                <input 
                  required
                  placeholder="e.g. FE-BF-001"
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-all font-bold text-white placeholder:text-white/5"
                  value={formData.serial_id}
                  onChange={e => setFormData({...formData, serial_id: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Type</label>
                <div className="relative">
                  <select 
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-all font-bold text-white appearance-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option>ABC (DRY POWDER)</option>
                    <option>DCP (DRY CHEMICAL)</option>
                    <option>CO2</option>
                    <option>FOAM</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Floor</label>
                <div className="relative">
                  <select 
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-all font-bold text-white appearance-none"
                    value={formData.floor}
                    onChange={e => setFormData({...formData, floor: e.target.value})}
                  >
                    <option>Basement</option>
                    <option>Ground Floor</option>
                    <option>Floor 1</option>
                    <option>Floor 2</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Wing</label>
                <input 
                  placeholder="e.g. West Side"
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-all font-bold text-white placeholder:text-white/5"
                  value={formData.wing}
                  onChange={e => setFormData({...formData, wing: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Location Detail</label>
                <input 
                  placeholder="e.g. Near CNC Centre"
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-all font-bold text-white placeholder:text-white/5"
                  value={formData.location_detail}
                  onChange={e => setFormData({...formData, location_detail: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Last Refilled</label>
                <input 
                  type="date"
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-all font-bold text-white color-scheme-dark"
                  value={formData.last_refilled}
                  onChange={e => setFormData({...formData, last_refilled: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Due Date</label>
                <input 
                  type="date"
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-all font-bold text-white color-scheme-dark"
                  value={formData.due_date}
                  onChange={e => setFormData({...formData, due_date: e.target.value})}
                />
              </div>
              <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4 mt-4">
                <button type="submit" className="flex-1 bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-500 transition-all shadow-xl order-1 sm:order-2">
                  {editingItem ? 'Save Changes' : 'Register Unit'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 text-white/40 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all order-2 sm:order-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
