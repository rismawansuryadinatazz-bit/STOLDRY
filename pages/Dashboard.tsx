
import React, { useMemo } from 'react';
import { UserRole, MasterItem, Transaction, Building, TransactionType } from '../types';

interface PlanEntry {
  itemId: string;
  building: Building;
  need: number;
}

const Dashboard: React.FC<{ role: UserRole }> = ({ role }) => {
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

  const getGlobalStockCount = (itemId: string) => {
    const buildings = [Building.UTAMA, Building.SINGLES, Building.NUGGET];
    return buildings.reduce((total, b) => {
      const buildingStock = transactions
        .filter(t => t.itemId === itemId && t.building === b)
        .reduce((acc, t) => {
          if (t.type === TransactionType.MASUK || t.type === TransactionType.KEMBALI_UTAMA) return acc + t.quantity;
          return acc - t.quantity;
        }, 0);
      return total + buildingStock;
    }, 0);
  };

  const dashboardStats = useMemo(() => {
    let totalStok = 0;
    let aman = 0;
    let restok = 0;
    const criticalDays = 21;

    items.forEach(item => {
      const stock = getGlobalStockCount(item.id);
      totalStok += stock;

      const dailyNeed = plans
        .filter(p => p.itemId === item.id)
        .reduce((acc, p) => acc + p.need, 0);

      const stockLifeDays = dailyNeed > 0 ? stock / dailyNeed : 999;
      
      if (stockLifeDays > criticalDays) aman++;
      else restok++;
    });

    return [
      { label: 'Total Asset Inventory', value: totalStok.toLocaleString(), unit: 'PCS', icon: '💎', color: 'indigo' },
      { label: 'Inventory Status Safe', value: aman, unit: 'SKU', icon: '🛡️', color: 'emerald' },
      { label: 'Critical Attention', value: restok, unit: 'SKU', icon: '🚨', color: 'rose' }
    ];
  }, [items, transactions, plans]);

  return (
    <div className="space-y-10 animate-slide-up px-2">
      {/* 1. High-End Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {dashboardStats.map((stat, idx) => (
          <div key={idx} className="glass-card p-10 rounded-[3rem] hover-lift premium-shadow relative overflow-hidden group border border-white/20 dark:border-white/5">
            <div className={`absolute -top-12 -right-12 w-48 h-48 opacity-[0.03] rounded-full bg-${stat.color}-500 transition-transform group-hover:scale-125 duration-1000`}></div>
            <div className="relative z-10 flex flex-col gap-6">
              <div className={`w-16 h-16 rounded-[1.5rem] bg-${stat.color}-50 dark:bg-${stat.color}-900/10 flex items-center justify-center text-3xl shadow-sm border border-${stat.color}-100/50`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
                    {stat.value}
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.unit}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Main Monitoring Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Modern Table Area */}
        <div className="lg:col-span-8 glass-card rounded-[3.5rem] p-12 premium-shadow dark:bg-slate-800/20 border border-white/30 dark:border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
             <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">Monitoring Global</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Live system update • Enterprise Level</p>
             </div>
             <div className="px-6 py-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 flex items-center gap-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Real-time Connected</span>
             </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Inventory Description</th>
                  <th className="pb-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-center">Global Bal.</th>
                  <th className="pb-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-center">Endurance</th>
                  <th className="pb-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {items.length > 0 ? items.slice(0, 8).map((item) => {
                  const stock = getGlobalStockCount(item.id);
                  const dailyNeed = plans.filter(p => p.itemId === item.id).reduce((acc, p) => acc + p.need, 0);
                  const stockLife = dailyNeed > 0 ? Math.floor(stock / dailyNeed) : 999;
                  const isSafe = stockLife >= 21;
                  const isWarning = stockLife < 21 && stockLife >= 7;
                  const isCritical = stockLife < 7;
                  
                  return (
                    <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all">
                      <td className="py-7">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 dark:text-slate-100 text-base group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.name}</span>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{item.size} • {item.unit}</span>
                        </div>
                      </td>
                      <td className="py-7 text-center">
                         <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter leading-none">{stock}</span>
                      </td>
                      <td className="py-7 text-center">
                         <div className="flex flex-col items-center gap-2">
                            <span className={`font-black text-xs uppercase ${isSafe ? 'text-emerald-500' : isWarning ? 'text-amber-500' : 'text-rose-500'}`}>
                              {stockLife > 100 ? 'MAXIMAL' : `${stockLife} DAYS`}
                            </span>
                            <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full rounded-full transition-all duration-1000 ${isSafe ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'}`}
                                 style={{ width: `${Math.min(100, (stockLife / 30) * 100)}%` }}
                               ></div>
                            </div>
                         </div>
                      </td>
                      <td className="py-7 text-right">
                        <span className={`px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] inline-block ${
                          isSafe ? 'bg-emerald-50/50 text-emerald-600 dark:bg-emerald-900/10' : 
                          isWarning ? 'bg-amber-50/50 text-amber-600 dark:bg-amber-900/10' : 
                          'bg-rose-50/50 text-rose-600 dark:bg-rose-900/10 animate-pulse'
                        }`}>
                          {isSafe ? 'Secure' : isWarning ? 'Warning' : 'Critical'}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={4} className="py-32 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">Database initialized • No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Professional Sidebar Cards */}
        <div className="lg:col-span-4 space-y-10">
          <div className="glass-card rounded-[3rem] p-10 premium-shadow dark:bg-slate-800/20 border border-white/30 dark:border-white/5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tighter">Distribution Points</h3>
            <div className="space-y-5">
               {[Building.UTAMA, Building.SINGLES, Building.NUGGET].map(b => (
                 <div key={b} className="p-6 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/50 dark:border-slate-800 hover:scale-[1.03] transition-all cursor-pointer group">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility Unit</span>
                       <span className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-xs">🏬</span>
                    </div>
                    <h4 className="font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors uppercase text-xs tracking-wider mb-2">{b}</h4>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                       <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Active System</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="glass-card rounded-[3rem] p-10 bg-[#4f46e5] text-white premium-shadow relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <span className="text-7xl font-black">ST</span>
             </div>
             <div className="relative z-10">
                <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 leading-tight">Advanced PO Insights</h4>
                <p className="text-xs text-indigo-100 font-medium mb-10 leading-relaxed opacity-70">Analysis engine detected potential shortage for {items.filter(i => getGlobalStockCount(i.id) < 50).length} assets. Prompt action recommended.</p>
                <button className="w-full py-5 bg-white text-indigo-700 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-slate-50 active:scale-95 transition-all">
                  Generate PO Logic
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
