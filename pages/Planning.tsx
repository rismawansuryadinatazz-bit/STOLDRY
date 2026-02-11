
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, Building, MasterItem } from '../types';

interface PlanEntry {
  id: string;
  itemId: string;
  building: Building;
  need: number;
  note: string;
}

const Planning: React.FC<{ role: UserRole }> = ({ role }) => {
  const [building, setBuilding] = useState(Building.SINGLES);
  const [plans, setPlans] = useState<PlanEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ itemId: '', need: '', note: '' });

  const masterItems: MasterItem[] = useMemo(() => {
    const saved = localStorage.getItem('stokify_master_items');
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Load plans from local storage on mount
  useEffect(() => {
    const savedPlans = localStorage.getItem('stokify_production_plans');
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans));
    }
  }, []);

  const filteredPlans = useMemo(() => {
    return plans.filter(p => p.building === building);
  }, [plans, building]);

  const handleSavePlans = () => {
    localStorage.setItem('stokify_production_plans', JSON.stringify(plans));
    alert('✅ Rencana kebutuhan berhasil disimpan ke sistem!');
  };

  const handleUpdateNeed = (id: string, val: string) => {
    if (val === '' || /^\d+$/.test(val)) {
      const numericVal = val === '' ? 0 : parseInt(val);
      const updated = plans.map(p => p.id === id ? { ...p, need: numericVal } : p);
      setPlans(updated);
    }
  };

  const handleAddPlan = () => {
    if (!newItem.itemId || !newItem.need) {
      alert('Pilih barang dan masukkan jumlah kebutuhan.');
      return;
    }
    
    const entry: PlanEntry = {
      id: Math.random().toString(36).substr(2, 9),
      itemId: newItem.itemId,
      building: building,
      need: parseInt(newItem.need) || 0,
      note: newItem.note
    };

    const newPlans = [...plans, entry];
    setPlans(newPlans);
    
    // Auto-save to prevent data loss
    localStorage.setItem('stokify_production_plans', JSON.stringify(newPlans));
    
    setNewItem({ itemId: '', need: '', note: '' });
    setShowAddModal(false);
  };

  const handleDeletePlan = (id: string) => {
    if (!window.confirm('Hapus item ini dari rencana kebutuhan?')) return;
    
    const updatedPlans = plans.filter(p => p.id !== id);
    setPlans(updatedPlans);
    
    // Langsung simpan perubahan ke localStorage agar tidak kembali saat refresh
    localStorage.setItem('stokify_production_plans', JSON.stringify(updatedPlans));
  };

  const getItemInfo = (id: string) => {
    return masterItems.find(i => i.id === id) || { name: 'Item Dihapus', size: '-' };
  };

  const canEdit = role !== UserRole.STAFF;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 rounded-3xl 3d-shadow flex flex-wrap justify-between items-center gap-4 dark:bg-slate-800/50">
         <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl gap-1 shadow-inner">
            <button 
              onClick={() => setBuilding(Building.SINGLES)}
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${building === Building.SINGLES ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              Gedung Singles
            </button>
            <button 
              onClick={() => setBuilding(Building.NUGGET)}
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${building === Building.NUGGET ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              Gedung Nugget
            </button>
         </div>
         <div className="flex gap-3">
            {canEdit && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2.5 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover-3d shadow-lg shadow-emerald-500/20"
              >
                + Tambah Barang
              </button>
            )}
            <button 
              onClick={handleSavePlans}
              className="px-8 py-2.5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover-3d shadow-lg shadow-indigo-500/20"
            >
              Simpan Rencana
            </button>
         </div>
      </div>

      <div className="glass-card rounded-[2.5rem] 3d-shadow overflow-hidden dark:bg-slate-800/50 border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-800">
              <tr className="text-left">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Barang</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kebutuhan Shift/Hr</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan</th>
                {canEdit && <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredPlans.length > 0 ? filteredPlans.map(p => {
                const info = getItemInfo(p.itemId);
                return (
                  <tr key={p.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/20 transition-colors">
                    <td className="p-6">
                      <p className="font-black text-slate-800 dark:text-slate-200">{info.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{info.size}</p>
                    </td>
                    <td className="p-6">
                      {canEdit ? (
                        <input 
                          type="text" 
                          inputMode="numeric"
                          className="w-28 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          value={p.need}
                          onChange={e => handleUpdateNeed(p.id, e.target.value)}
                        />
                      ) : <span className="font-black text-lg text-slate-700 dark:text-slate-300">{p.need}</span>}
                    </td>
                    <td className="p-6 text-slate-500 dark:text-slate-400 italic">"{p.note || '-'}"</td>
                    {canEdit && (
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => handleDeletePlan(p.id)}
                          className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
                          title="Hapus Item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.166L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              }) : (
                <tr><td colSpan={4} className="p-20 text-center text-slate-400 italic font-medium">Belum ada item direncanakan untuk {building}.<br/><span className="text-[10px] font-bold uppercase mt-2 block">Klik "Tambah Barang" untuk memulai</span></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-200 border border-white/10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Tambah ke Rencana</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
              </div>
              <div className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Pilih Master Barang</label>
                   <select 
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={newItem.itemId}
                      onChange={e => setNewItem({...newItem, itemId: e.target.value})}
                   >
                      <option value="">-- Pilih Barang --</option>
                      {masterItems.map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.size})</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Kebutuhan (Qty)</label>
                   <input 
                      type="text" 
                      inputMode="numeric"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none dark:text-white font-black text-xl placeholder-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="0"
                      value={newItem.need}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === '' || /^\d+$/.test(val)) setNewItem({...newItem, need: val});
                      }}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Catatan Tambahan</label>
                   <input 
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Contoh: Stok cadangan..."
                      value={newItem.note}
                      onChange={e => setNewItem({...newItem, note: e.target.value})}
                   />
                </div>
                <button 
                  onClick={handleAddPlan}
                  className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl mt-4 shadow-xl shadow-indigo-500/20 hover-3d uppercase text-xs tracking-widest"
                >
                  Tambahkan ke Tabel
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Planning;
