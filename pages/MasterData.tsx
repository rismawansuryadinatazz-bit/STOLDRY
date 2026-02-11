
import React, { useState, useEffect } from 'react';
import { UserRole, MasterItem, ItemType } from '../types';

const MasterData: React.FC<{ role: UserRole }> = ({ role }) => {
  const [items, setItems] = useState<MasterItem[]>(() => {
    const saved = localStorage.getItem('stokify_master_items');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Nasi Bungkus', size: 'Standar', unit: 'Pcs', type: ItemType.DISPOSABLE, addedAt: new Date().toISOString() },
      { id: '2', name: 'Nampan Saji', size: 'Large', unit: 'Pcs', type: ItemType.REUSABLE, addedAt: new Date().toISOString() },
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
  const [formData, setFormData] = useState({ name: '', size: '', unit: '', type: ItemType.DISPOSABLE });

  useEffect(() => {
    localStorage.setItem('stokify_master_items', JSON.stringify(items));
  }, [items]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', size: '', unit: '', type: ItemType.DISPOSABLE });
    setShowModal(true);
  };

  const handleOpenEdit = (item: MasterItem) => {
    setEditingItem(item);
    setFormData({ name: item.name, size: item.size, unit: item.unit, type: item.type });
    setShowModal(true);
  };

  const handleSaveItem = () => {
    if (!formData.name || !formData.size) return;
    
    if (editingItem) {
      const updatedItems = items.map(i => 
        i.id === editingItem.id ? { ...i, ...formData } : i
      );
      setItems(updatedItems);
      alert('Data barang berhasil diperbarui!');
    } else {
      const newItem: MasterItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        addedAt: new Date().toISOString()
      };
      setItems([newItem, ...items]);
      alert('Barang baru berhasil ditambahkan!');
    }
    
    setShowModal(false);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (!window.confirm(`Hapus permanen barang "${name}" dari Master Data?`)) return;
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.size.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const canEdit = role === UserRole.LEADER || role === UserRole.ADMIN;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Filters & Actions */}
      <div className="glass-card p-6 rounded-3xl premium-shadow flex flex-wrap gap-4 items-end justify-between dark:bg-slate-800/30 border border-white/20">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cari Barang</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
              <input 
                type="text" 
                placeholder="Nama atau Size..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Jenis Penggunaan</label>
            <select 
              className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl outline-none dark:text-white"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Semua Jenis</option>
              <option value={ItemType.DISPOSABLE}>{ItemType.DISPOSABLE}</option>
              <option value={ItemType.REUSABLE}>{ItemType.REUSABLE}</option>
            </select>
          </div>
          <button 
            onClick={() => {setSearchTerm(''); setFilterType('all');}}
            className="px-4 py-2 text-slate-500 font-semibold hover:text-indigo-600 uppercase text-[10px] tracking-widest"
          >
            Reset
          </button>
        </div>
        
        {canEdit && (
          <div className="flex gap-2">
            <button 
              onClick={handleOpenAdd}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest"
            >
              + Barang Baru
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-[2.5rem] premium-shadow overflow-hidden dark:bg-slate-800/30 border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-800">
              <tr className="text-left">
                <th className="p-6 font-black text-slate-400 text-[10px] uppercase tracking-widest">No</th>
                <th className="p-6 font-black text-slate-400 text-[10px] uppercase tracking-widest">Nama Barang</th>
                <th className="p-6 font-black text-slate-400 text-[10px] uppercase tracking-widest">Size</th>
                <th className="p-6 font-black text-slate-400 text-[10px] uppercase tracking-widest">Satuan</th>
                <th className="p-6 font-black text-slate-400 text-[10px] uppercase tracking-widest">Jenis</th>
                <th className="p-6 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-5 text-slate-400 font-bold text-xs">{idx + 1}</td>
                  <td className="px-6 py-5 font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{item.name}</td>
                  <td className="px-6 py-5 text-slate-600 dark:text-slate-400 font-bold">{item.size}</td>
                  <td className="px-6 py-5 text-slate-600 dark:text-slate-400 font-bold">{item.unit}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.type === ItemType.DISPOSABLE ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {canEdit ? (
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleOpenEdit(item)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500 rounded-lg transition-all" title="Edit">✏️</button>
                        <button onClick={() => handleDeleteItem(item.id, item.name)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-lg transition-all" title="Hapus">🗑️</button>
                      </div>
                    ) : (
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Data Tidak Ditemukan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-200 border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                {editingItem ? '🛠️ Edit Barang' : '📦 Tambah Barang'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Nama Barang</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: Sendok Plastik"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Size / Ukuran</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formData.size}
                    onChange={e => setFormData({...formData, size: e.target.value})}
                    placeholder="L / XL / Standard"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Satuan</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formData.unit}
                    placeholder="Pcs/Bks"
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Jenis Penggunaan</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as ItemType})}
                >
                  <option value={ItemType.DISPOSABLE}>{ItemType.DISPOSABLE}</option>
                  <option value={ItemType.REUSABLE}>{ItemType.REUSABLE}</option>
                </select>
              </div>
              <button 
                onClick={handleSaveItem}
                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl mt-4 shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest active:scale-95"
              >
                {editingItem ? 'Update Data' : 'Simpan Barang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
