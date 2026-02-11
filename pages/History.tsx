
import React, { useState, useMemo } from 'react';
import { UserRole, Transaction, TransactionType, MasterItem } from '../types';

const History: React.FC<{ role: UserRole }> = ({ role }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const transactions: Transaction[] = useMemo(() => {
    const saved = localStorage.getItem('stokify_transactions');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const items: MasterItem[] = useMemo(() => {
    const saved = localStorage.getItem('stokify_master_items');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const resolveItemName = (id: string) => {
    const item = items.find(i => i.id === id);
    return item ? `${item.name} (${item.size})` : `ID: ${id}`;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const itemName = resolveItemName(t.itemId).toLowerCase();
      const staffName = t.staffName.toLowerCase();
      const query = searchTerm.toLowerCase();
      return itemName.includes(query) || staffName.includes(query);
    });
  }, [transactions, items, searchTerm]);

  return (
    <div className="space-y-6">
       <div className="glass-card p-6 rounded-3xl 3d-shadow flex flex-wrap gap-4 items-end dark:bg-slate-800/50">
          <div className="flex-1 min-w-[280px]">
             <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cari Riwayat</label>
             <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
                <input 
                  type="text" 
                  placeholder="Cari nama barang atau nama staf..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          <div className="flex gap-2">
             <button className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 transition-colors">Excel</button>
             {role !== UserRole.STAFF && (
               <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover-3d shadow-lg shadow-indigo-100 uppercase text-xs tracking-widest">PDF Report</button>
             )}
          </div>
       </div>

       <div className="glass-card rounded-3xl 3d-shadow overflow-hidden dark:bg-slate-800/50">
          <div className="overflow-x-auto">
             <table className="w-full text-sm">
                <thead className="bg-slate-50/50 dark:bg-slate-900/30 border-b dark:border-slate-700">
                   <tr className="text-left">
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gedung</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Barang</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Staf</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                   {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                     <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="p-6">
                           <p className="text-slate-600 dark:text-slate-400 font-bold">{new Date(t.date).toLocaleDateString('id-ID')}</p>
                           <p className="text-[10px] text-slate-400 font-medium">{new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </td>
                        <td className="p-6">
                           <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">
                              {t.building}
                           </span>
                        </td>
                        <td className="p-6">
                           <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                              t.type === TransactionType.MASUK ? 'bg-emerald-100 text-emerald-700' : 
                              t.type === TransactionType.REPAIR ? 'bg-amber-100 text-amber-700' :
                              t.type === TransactionType.PEMUSNAHAN ? 'bg-red-100 text-red-700' :
                              'bg-indigo-100 text-indigo-700'
                           }`}>
                              {t.type}
                           </span>
                        </td>
                        <td className="p-6">
                           <p className="font-bold text-slate-800 dark:text-slate-200">{resolveItemName(t.itemId)}</p>
                           {t.note && <p className="text-[10px] text-slate-400 italic">"{t.note}"</p>}
                        </td>
                        <td className="p-6 text-center">
                           <span className="font-black text-lg text-indigo-600 dark:text-indigo-400">{t.quantity}</span>
                        </td>
                        <td className="p-6 text-right">
                           <p className="font-black text-slate-800 dark:text-slate-200 uppercase text-xs">{t.staffName}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{t.shift}</p>
                        </td>
                     </tr>
                   )) : (
                     <tr>
                       <td colSpan={6} className="p-16 text-center text-slate-400 italic">Belum ada riwayat transaksi yang ditemukan.</td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

export default History;
