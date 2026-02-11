
import React, { useState, useMemo } from 'react';
import { UserRole, Building, Transaction, TransactionType, MasterItem } from '../types';

const DisposalData: React.FC<{ role: UserRole }> = ({ role }) => {
  const items: MasterItem[] = useMemo(() => {
    const saved = localStorage.getItem('stokify_master_items');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('stokify_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const disposalList = useMemo(() => {
    return transactions.filter(t => t.type === TransactionType.PEMUSNAHAN);
  }, [transactions]);

  const handleConfirm = (id: string) => {
    if (role === UserRole.STAFF) return;
    
    const updatedTransactions = transactions.map(t => 
      t.id === id ? { ...t, status: 'COMPLETED' as const } : t
    );
    
    setTransactions(updatedTransactions);
    localStorage.setItem('stokify_transactions', JSON.stringify(updatedTransactions));
    alert('Pemusnahan barang telah dikonfirmasi dan disetujui.');
  };

  const getItemName = (id: string) => {
    return items.find(i => i.id === id)?.name || 'Barang Dihapus';
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl 3d-shadow overflow-hidden dark:bg-slate-800/50">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50 border-b dark:bg-slate-900/30 dark:border-slate-700">
            <tr className="text-left">
              <th className="p-6 text-xs font-bold text-slate-400 uppercase">Detail Pemusnahan</th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase">Gedung</th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase">Alasan</th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase">Status</th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {disposalList.length > 0 ? disposalList.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-6">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{getItemName(item.itemId)}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Qty: {item.quantity}</p>
                  <p className="text-[10px] text-slate-400">Diajukan: {new Date(item.date).toLocaleDateString()}</p>
                </td>
                <td className="p-6 text-slate-600 dark:text-slate-400 font-medium">{item.building}</td>
                <td className="p-6 text-slate-500 italic dark:text-slate-500">"{item.reason || 'Tanpa alasan'}"</td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    item.status === 'COMPLETED' 
                      ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {item.status === 'COMPLETED' ? 'Sudah Dimusnahkan' : 'Menunggu Konfirmasi'}
                  </span>
                </td>
                <td className="p-6 text-center">
                  {role !== UserRole.STAFF && item.status !== 'COMPLETED' ? (
                    <button 
                      onClick={() => handleConfirm(item.id)}
                      className="px-6 py-3 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover-3d shadow-lg shadow-red-100"
                    >
                      Konfirmasi
                    </button>
                  ) : (
                    <div className="flex flex-col items-center">
                       <span className="text-slate-400 text-xl">📄</span>
                       <span className="text-[10px] font-bold text-slate-300">Bukti PDF</span>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-16 text-center text-slate-400 italic">Belum ada data pengajuan pemusnahan barang.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisposalData;
