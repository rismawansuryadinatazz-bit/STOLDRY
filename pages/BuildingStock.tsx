
import React, { useState, useEffect, useMemo } from 'react';
import { Building, UserRole, TransactionType, Transaction, MasterItem, ItemType, UserSession } from '../types';

interface BuildingStockProps {
  building: Building;
  role: UserRole;
  user: UserSession;
}

const BuildingStock: React.FC<BuildingStockProps> = ({ building, role, user }) => {
  const [items, setItems] = useState<MasterItem[]>(() => {
    const saved = localStorage.getItem('stokify_master_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('stokify_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    itemId: '',
    type: building === Building.UTAMA ? TransactionType.MASUK : TransactionType.KEMBALI_UTAMA,
    customType: '',
    quantity: '',
    shift: 'Shift 1',
    reason: '',
    note: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // STRICT ACCESS CONTROL: Only Leaders/Admins see all. Staff only Utama.
  const isAccessDenied = role === UserRole.STAFF && building !== Building.UTAMA;

  useEffect(() => {
    setFormData({
      itemId: '',
      type: building === Building.UTAMA ? TransactionType.MASUK : TransactionType.KEMBALI_UTAMA,
      customType: '',
      quantity: '',
      shift: 'Shift 1',
      reason: '',
      note: ''
    });
  }, [building]);

  const calculateStock = (itemId: string, targetBuilding: Building) => {
    return transactions
      .filter(t => t.itemId === itemId && t.building === targetBuilding)
      .reduce((acc, t) => {
        if (t.type === TransactionType.MASUK || t.type === TransactionType.KEMBALI_UTAMA) return acc + t.quantity;
        return acc - t.quantity;
      }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAccessDenied || isSubmitting) return;
    
    const qty = parseInt(formData.quantity);
    if (!formData.itemId || isNaN(qty) || qty <= 0) {
      alert('⚠️ Mohon masukkan jumlah yang valid.');
      return;
    }

    const currentStock = calculateStock(formData.itemId, building);
    const isOutgoing = formData.type !== TransactionType.MASUK && formData.type !== TransactionType.KEMBALI_UTAMA;

    if (isOutgoing && (currentStock - qty < 0)) {
      alert(`⚠️ STOK TIDAK MENCUKUPI!\nStok saat ini: ${currentStock}`);
      return;
    }

    setIsSubmitting(true);

    const mainTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      building,
      itemId: formData.itemId,
      type: formData.type,
      quantity: qty,
      staffName: user.fullName,
      staffId: user.id,
      shift: formData.shift,
      reason: formData.reason,
      note: formData.note,
      status: (formData.type === TransactionType.REPAIR || formData.type === TransactionType.PEMUSNAHAN) ? 'PENDING' : undefined
    };

    let additionalTransactions: Transaction[] = [];
    if (building === Building.UTAMA) {
      if (formData.type === TransactionType.KELUAR_SINGLES) {
        additionalTransactions.push({
          ...mainTransaction, id: Math.random().toString(36).substr(2, 9),
          building: Building.SINGLES, type: TransactionType.MASUK,
          note: `Auto-Transfer dari Utama`
        });
      } else if (formData.type === TransactionType.KELUAR_NUGGET) {
        additionalTransactions.push({
          ...mainTransaction, id: Math.random().toString(36).substr(2, 9),
          building: Building.NUGGET, type: TransactionType.MASUK,
          note: `Auto-Transfer dari Utama`
        });
      }
    } else if (formData.type === TransactionType.KEMBALI_UTAMA) {
      additionalTransactions.push({
        ...mainTransaction, id: Math.random().toString(36).substr(2, 9),
        building: Building.UTAMA, type: TransactionType.MASUK,
        note: `Auto-Return dari ${building}`
      });
    }

    const allNew = [mainTransaction, ...additionalTransactions, ...transactions];
    setTransactions(allNew);
    localStorage.setItem('stokify_transactions', JSON.stringify(allNew));
    
    setIsSubmitting(false);
    setFormData({ ...formData, quantity: '', reason: '', note: '' });
    alert(`✅ Transaksi Berhasil!`);
  };

  const getTransactionOptions = () => {
    if (building === Building.UTAMA) {
      return [
        TransactionType.MASUK, TransactionType.KELUAR_SINGLES, 
        TransactionType.KELUAR_NUGGET, TransactionType.REPAIR, 
        TransactionType.PEMUSNAHAN, TransactionType.LAIN_LAIN
      ];
    }
    return [TransactionType.KEMBALI_UTAMA, TransactionType.REPAIR, TransactionType.PEMUSNAHAN];
  };

  if (isAccessDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-32 glass-card rounded-[4rem] text-center px-12 border-2 border-rose-500/10 animate-in zoom-in-95">
         <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-5xl mb-8">🚫</div>
         <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-4">Akses Terbatas</h2>
         <p className="text-slate-400 text-xs font-bold uppercase max-w-sm mx-auto leading-relaxed tracking-widest">
            Level akun <span className="text-rose-500 font-black">STAFF</span> hanya diizinkan untuk mengelola database di <span className="text-indigo-600 font-black">Gedung Utama</span>.
         </p>
         <div className="mt-12 flex flex-col gap-3">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Memerlukan Clearance</span>
            <div className="px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
               <span className="text-[10px] font-black text-indigo-500 uppercase">Admin / Leader Authority</span>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
      <div className="lg:col-span-5">
        <div className="glass-card p-10 rounded-[3rem] premium-shadow border border-white/40 dark:border-white/5">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-3">
              <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">✍️</span> 
              Form Transaksi
            </h3>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-widest">{building}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Pilih Master Item</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none dark:text-white font-bold cursor-pointer"
                  value={formData.itemId}
                  onChange={e => setFormData({...formData, itemId: e.target.value})}
                >
                  <option value="">-- SILAHKAN PILIH BARANG --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name} [{item.size}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Tipe Aktivitas</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none dark:text-white font-bold cursor-pointer"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                  >
                    {getTransactionOptions().map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Shift Kerja</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none dark:text-white font-bold cursor-pointer"
                    value={formData.shift}
                    onChange={e => setFormData({...formData, shift: e.target.value})}
                  >
                    <option>Shift 1</option>
                    <option>Shift 2</option>
                    <option>Shift 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Jumlah (Quantity)</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  className="w-full px-8 py-6 bg-indigo-50/30 dark:bg-indigo-900/20 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] outline-none dark:text-white font-black text-5xl placeholder-slate-300 text-center transition-all"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) setFormData({...formData, quantity: val});
                  }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Catatan / Alasan</label>
                <textarea 
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none dark:text-white font-medium min-h-[100px] resize-none"
                  placeholder="Opsional..."
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl ${
                isSubmitting ? 'bg-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20 active:scale-95'
              }`}
            >
              {isSubmitting ? 'Processing...' : 'Submit Transaksi'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="glass-card p-10 rounded-[3rem] premium-shadow border border-white/40 dark:border-white/5 min-h-full">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Inventory Control</h3>
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Live Updates</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-5 font-black text-slate-400 text-[9px] uppercase tracking-widest">Item Description</th>
                  <th className="pb-5 font-black text-slate-400 text-[9px] uppercase tracking-widest text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {items.map(item => {
                  const stock = calculateStock(item.id, building);
                  return (
                    <tr key={item.id} className="group hover:bg-indigo-50/10 transition-colors">
                      <td className="py-6">
                        <p className="font-black text-slate-800 dark:text-slate-200 text-sm">{item.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.size} • {item.unit}</p>
                      </td>
                      <td className="py-6 text-right">
                         <span className={`text-3xl font-black tracking-tighter ${stock < 50 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                            {stock}
                         </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingStock;
