
import React from 'react';
import { UserRole } from '../types';
import { COPYRIGHT } from '../constants';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  role: UserRole;
  onLogout: () => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, setActiveMenu, isSidebarOpen, setSidebarOpen, role, onLogout, theme, setTheme }) => {
  const isDark = theme === 'dark';

  const categories = [
    {
      label: 'Ringkasan',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: '📊' }]
    },
    {
      label: 'Inventory',
      items: [
        { id: 'master', label: 'Master Data', icon: '📦' },
        { id: 'utama', label: 'Gedung Utama', icon: '🏬' },
        { id: 'singles', label: 'Gedung Singles', icon: '🏪' },
        { id: 'nugget', label: 'Gedung Nugget', icon: '🏩' },
      ]
    },
    {
      label: 'Operasional',
      items: [
        { id: 'repair', label: 'Data Repair', icon: '🔧' },
        { id: 'disposal', label: 'Pemusnahan', icon: '🗑️' },
        { id: 'planning', label: 'Perencanaan', icon: '📅' },
      ]
    },
    {
      label: 'Sistem',
      items: [
        { id: 'history', label: 'Riwayat', icon: '📜' },
        { id: 'po', label: 'Laporan PO', icon: '📑' },
        { id: 'settings', label: 'Pengaturan', icon: '⚙️' },
      ]
    }
  ];

  return (
    <aside className={`h-screen transition-all duration-500 z-50 flex flex-col border-r ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'} ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
      <div className={`p-8 flex items-center justify-between ${isSidebarOpen ? '' : 'justify-center'}`}>
        <div className="flex items-center gap-4 overflow-hidden" onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ cursor: 'pointer' }}>
          <div className="min-w-[48px] h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl shadow-xl shadow-indigo-600/30 font-black">
            ST
          </div>
          {isSidebarOpen && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
               <span className={`font-black text-xl tracking-tighter whitespace-nowrap uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>STOLDRY V.1</span>
               <div className="flex items-center gap-1.5 mt-[-2px]">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                  <p className="text-[9px] font-black text-indigo-500 tracking-[0.2em] uppercase">BY SURYA</p>
               </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            {isSidebarOpen ? (
              <p className={`text-[9px] uppercase font-black px-4 py-2 tracking-[0.2em] opacity-40 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {cat.label}
              </p>
            ) : <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-4" />}
            
            {cat.items.map(item => {
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : `${isDark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`
                  } ${!isSidebarOpen && 'justify-center'}`}
                >
                  <span className={`text-xl transition-transform duration-300 ${!isActive && 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>{item.icon}</span>
                  {isSidebarOpen && <span className="font-bold text-[12px] whitespace-nowrap uppercase tracking-wider">{item.label}</span>}
                  {!isSidebarOpen && isActive && <div className="absolute right-0 w-1 h-8 bg-white rounded-l-full"></div>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={`p-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-50'} space-y-2`}>
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} px-2 mb-4`}>
           {isSidebarOpen && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Display Mode</span>}
           <button 
             onClick={() => setTheme(isDark ? 'light' : 'dark')}
             className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-indigo-600'}`}
             title={isDark ? 'Switch to Light' : 'Switch to Dark'}
           >
             {isDark ? '☀️' : '🌙'}
           </button>
        </div>
        
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all ${!isSidebarOpen && 'justify-center'}`}
        >
          <span className="text-xl">🚪</span>
          {isSidebarOpen && <span className="font-black text-[11px] uppercase tracking-widest">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
