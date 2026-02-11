
import React, { useState, useMemo } from 'react';
import { UserRole, Building, MasterItem, Transaction, TransactionType, ItemType } from '../types';

interface PlanEntry {
  id: string;
  itemId: string;
  building: Building;
  need: number;
  note: string;
}

const POReport: React.FC<{ role: UserRole }> = ({ role }) => {
  const [duration, setDuration] = useState('3 Minggu');
  
  const items: MasterItem[] = useMemo(() => {
    const saved = localStorage.getItem('stokify_master_items');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const transactions: Transaction[] = useMemo(() => {
    const saved = localStorage.getItem('stokify_transactions');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const plans: PlanEntry[] = useMemo(() => {
    const saved = localStorage.getItem('stokify_production_plans');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const calculateUtamaStock = (itemId: string) => {
    return transactions
      .filter(t => t.itemId === itemId && t.building === Building.UTAMA)
      .reduce((acc, t) => {
        if (t.type === TransactionType.MASUK || t.type === TransactionType.KEMBALI_UTAMA) {
          return acc + t.quantity;
        }
        return acc - t.quantity;
      }, 0);
  };

  const getDays = (dur: string) => {
    switch (dur) {
      case '1 Minggu': return 7;
      case '2 Minggu': return 14;
      case '3 Minggu': return 21;
      case '1 Bulan': return 30;
      default: return 21;
    }
  };

  const reportData = useMemo(() => {
    const days = getDays(duration);
    const criticalThresholdDays = 21; // Peringatan 3 minggu sebelum habis

    return items.map(item => {
      // Ambil kebutuhan per hari dari total perencanaan Singles + Nugget
      const dailyPlannedNeed = plans
        .filter(p => p.itemId === item.id && (p.building === Building.SINGLES || p.building === Building.NUGGET))
        .reduce((acc, p) => acc + p.need, 0);

      const currentStock = calculateUtamaStock(item.id);
      
      // Batas Aman = 2x Kebutuhan Harian
      const safetyStock = dailyPlannedNeed * 2;
      
      // Kebutuhan operasional untuk durasi yang dipilih
      const operationalNeed = dailyPlannedNeed * days;
      
      // Rumus PO: (Kebutuhan Operasional + Batas Aman) - Stok Saat Ini
      let poQty = Math.max(0, (operationalNeed + safetyStock) - currentStock);

      // Status Peringatan 3 Minggu
      const stockLifeDays = dailyPlannedNeed > 0 ? currentStock / dailyPlannedNeed : 999;
      const isCritical = stockLifeDays < criticalThresholdDays && dailyPlannedNeed > 0;

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const targetStr = targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      return { 
        ...item, 
        dailyPlannedNeed, 
        currentStock, 
        safetyStock, 
        poQty, 
        targetStr, 
        isCritical,
        stockLifeDays: Math.floor(stockLifeDays)
      };
    }).filter(i => i.dailyPlannedNeed > 0 || i.currentStock > 0);
  }, [items, transactions, plans, duration]);

  const RenderTable = ({ data, title, icon }: { data: any[], title: string, icon: string }) => (
    <div className="glass-card rounded-[2rem] 3d-shadow overflow-hidden mb-8 dark:bg-slate-800/50 border border-white/20">
      <div className="p-6 bg-slate-50/80 border-b flex items-center justify-between dark:bg-slate-900/50 dark:border-slate-800">
        <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-3 uppercase text-xs tracking-widest">
          <span className="text-xl">{icon}</span> {title}
        </h4>
        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase tracking-widest">{data.length} Jenis Barang</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/30 border-b dark:bg-slate-900/30 dark:border-slate-800">
            <tr className="text-left">
              <th className="p-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Barang</th>
              <th className="p-5 font-black text-slate-400 uppercase text-[9px] tracking-widest text-center">Keb/Hr (Plan)</th>
              <th className="p-5 font-black text-slate-400 uppercase text-[9px] tracking-widest text-center">Stok Utama</th>
              <th className="p-5 font-black text-slate-400 uppercase text-[9px] tracking-widest text-center">Batas Aman (2x)</th>
              <th className="p-5 font-black text-indigo-600 dark:text-indigo-400 uppercase text-[9px] tracking-widest text-center">Target PO</th>
              <th className="p-5 font-black text-slate-400 uppercase text-[9px] tracking-widest text-right">Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {data.length > 0 ? data.map((item) => (
              <tr key={item.id} className={`hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors ${item.isCritical ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    {item.isCritical && <span className="animate-ping w-2 h-2 rounded-full bg-red-500" title="Kritis! Stok < 3 Minggu"></span>}
                    <div>
                      <p className="font-black text-slate-800 dark:text-slate-200">{item.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{item.size}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5 text-center font-bold text-slate-600 dark:text-slate-400">{item.dailyPlannedNeed}</td>
                <td className="p-5 text-center">
                  <span className={`font-black text-lg ${item.isCritical ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {item.currentStock}
                  </span>
                  {item.isCritical && <p className="text-[8px] font-black text-red-400 uppercase leading-none">Cukup {item.stockLifeDays} Hari</p>}
                </td>
                <td className="p-5 text-center text-slate-500 font-bold">{item.safetyStock}</td>
                <td className="p-5 text-center">
                  <div className={`inline-block px-4 py-1.5 rounded-xl font-black text-lg ${item.poQty > 0 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                    {item.poQty}
                  </div>
                </td>
                <td className="p-5 text-right">
                   <p className="font-black text-slate-700 dark:text-slate-300 text-xs">{item.targetStr}</p>
                   <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Estimasi Tiba</p>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="p-20 text-center text-slate-400 italic">Belum ada data perencanaan atau stok yang tercatat.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2rem] 3d-shadow flex flex-wrap justify-between items-center gap-6 dark:bg-slate-800/50 border border-white/20">
        <div className="flex gap-6 items-center">
           <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kebutuhan Selama:</label>
             <select 
               className="px-5 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-indigo-600 dark:text-indigo-400 outline-none focus:ring-2 focus:ring-indigo-500"
               value={duration}
               onChange={e => setDuration(e.target.value)}
             >
               <option>1 Minggu</option>
               <option>2 Minggu</option>
               <option>3 Minggu</option>
               <option>1 Bulan</option>
             </select>
           </div>
           <div className="h-12 w-px bg-slate-100 dark:bg-slate-800 hidden sm:block"></div>
           <div className="hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Peringatan</p>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                 <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Warning Stok &lt; 3 Minggu</span>
              </div>
           </div>
        </div>
        <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-2xl shadow-indigo-600/30 hover-3d transition-all active:scale-95 uppercase text-[10px] tracking-widest">
          📥 Download Laporan PO (PDF)
        </button>
      </div>

      <RenderTable 
        data={reportData.filter(i => i.type === ItemType.DISPOSABLE)} 
        title="Kebutuhan Barang Sekali Pakai" 
        icon="🥡" 
      />
      
      <RenderTable 
        data={reportData.filter(i => i.type === ItemType.REUSABLE)} 
        title="Kebutuhan Barang Reusable" 
        icon="🍽️" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-8 rounded-[2rem] dark:bg-slate-800/50 border border-white/20 hover-3d">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Total Item Perlu PO</p>
            <h3 className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
               {reportData.filter(i => i.poQty > 0).length} <span className="text-sm font-bold text-slate-400">SKU</span>
            </h3>
         </div>
         <div className="glass-card p-8 rounded-[2rem] bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 hover-3d">
            <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-2">Peringatan (3 Minggu)</p>
            <h3 className="text-4xl font-black text-red-600">
               {reportData.filter(i => i.isCritical).length} <span className="text-sm font-bold text-red-400">Items</span>
            </h3>
         </div>
         <div className="glass-card p-8 rounded-[2rem] bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 hover-3d">
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-2">Estimasi Kedatangan</p>
            <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
               {new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
               <span className="text-xs block font-bold text-emerald-500/60 mt-1 uppercase">Batch Pertama</span>
            </h3>
         </div>
      </div>
    </div>
  );
};

export default POReport;
