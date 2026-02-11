
import React, { useState, useMemo } from 'react';
import { UserRole, Building, Transaction, TransactionType, MasterItem } from '../types';

const RepairData: React.FC<{ role: UserRole }> = ({ role }) => {
  const [filterGedung, setFilterGedung] = useState('Semua');
  
  const items: MasterItem[] = useMemo(() => {
    const saved = localStorage.getItem('stokify_master_items');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('stokify_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const repairList = useMemo(() => {
    return transactions.filter(t => t.type === TransactionType.REPAIR);
  }, [transactions]);

  const handleUpdateStatus = (id: string) => {
    if (role === UserRole.STAFF) return;
    
    const updatedTransactions = [...transactions];
    const index = updatedTransactions.findIndex(t => t.id === id);
    
    if (index !== -1) {
      const originalRepair = updatedTransactions[index];
      
      // 1. Update status transaksi repair asli
      updatedTransactions[index] = { ...originalRepair, status: 'COMPLETED' };

      // 2. Buat transaksi MASUK otomatis untuk mengembalikan stok ke gedung asal
      const recoveryTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        building: originalRepair.building,
        itemId: originalRepair.itemId,
        type: TransactionType.MASUK,
        quantity: originalRepair.quantity,
        staffName: 'System (Leader Approved)',
        staffId: 'SYSTEM',
        shift: 'Auto',
        note: `Pemulihan Repair dari ID: ${id.substr(0, 5)}`
      };

      const finalData = [recoveryTransaction, ...updatedTransactions];
      setTransactions(finalData);
      localStorage.setItem('stokify_transactions', JSON.stringify(finalData));
      alert(`Repair Selesai! Stok ${originalRepair.quantity} Pcs telah dikembalikan ke ${originalRepair.building}.`);
    }
  };

  const getItemName = (id: string) => {
    return items.find(i => i.id === id)?.name || 'Barang Dihapus';
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl 3d-shadow flex gap-4 dark:bg-slate-800/50">
        {['Semua', Building.UTAMA, Building.SINGLES, Building.NUGGET].map(b => (
          <button 
            key={b}
            onClick={() => setFilterGedung(b)}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${filterGedung === b ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400'}`}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-3xl 3d-shadow overflow-hidden dark:bg-slate-800/50">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50 border-b dark:bg-slate-900/30 dark:border-slate-700">
            <tr className="text-left">
              <th className="p-6 text-xs font-bold text-slate-400 uppercase">Barang & Keluhan</th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase">Asal</th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase text-center">Jumlah</th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase">Status</th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {repairList.filter(i => filterGedung === 'Semua' || i.building === filterGedung).length > 0 ? (
              repairList.filter(i => filterGedung === 'Semua' || i.building === filterGedung).map(item => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-6">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{getItemName(item.itemId)}</p>
                    <p className="text-[10px] text-slate-400 italic">"{item.reason || 'Tanpa catatan'}"</p>
                  </td>
                  <td className="p-6 text-slate-600 dark:text-slate-400 font-medium">{item.building}</td>
                  <td className="p-6 text-center font-black text-indigo-600 dark:text-indigo-400">{item.quantity}</td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                      item.status === 'COMPLETED' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 animate-pulse'
                    }`}>
                      {item.status === 'COMPLETED' ? 'Sudah Selesai' : 'Dalam Perbaikan'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    {role !== UserRole.STAFF && item.status !== 'COMPLETED' ? (
                      <button 
                        onClick={() => handleUpdateStatus(item.id)}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover-3d shadow-lg shadow-indigo-100"
                      >
                        Konfirmasi Selesai
                      </button>
                    ) : (
                      <span className="text-slate-300 font-bold text-xs">✓ Selesai</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="p-12 text-center text-slate-400 italic">Tidak ada data repair untuk filter ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RepairData;
