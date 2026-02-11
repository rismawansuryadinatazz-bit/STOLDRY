
import React, { useState, useEffect } from 'react';
import { UserRole, UserSession, Building } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData';
import BuildingStock from './pages/BuildingStock';
import RepairData from './pages/RepairData';
import DisposalData from './pages/DisposalData';
import Planning from './pages/Planning';
import History from './pages/History';
import POReport from './pages/POReport';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';

const SESSION_TIMEOUT = 30 * 60 * 1000;

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('stokify_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('stokify_theme') as 'light' | 'dark') || 'light';
  });

  const [activeMenu, setActiveMenu] = useState<string>(() => {
    return localStorage.getItem('stokify_active_menu') || 'dashboard';
  });

  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('stokify_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (!session) return;
    let timeout: number;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        handleLogout();
        alert('Sesi habis karena tidak ada aktivitas.');
      }, SESSION_TIMEOUT);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      clearTimeout(timeout);
    };
  }, [session]);

  const handleLogin = (user: UserSession) => {
    setSession(user);
    localStorage.setItem('stokify_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('stokify_session');
    setActiveMenu('dashboard');
  };

  useEffect(() => {
    localStorage.setItem('stokify_active_menu', activeMenu);
  }, [activeMenu]);

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <Dashboard role={session.role} />;
      case 'master': return <MasterData role={session.role} />;
      case 'utama': return <BuildingStock building={Building.UTAMA} role={session.role} user={session} />;
      case 'singles': return <BuildingStock building={Building.SINGLES} role={session.role} user={session} />;
      case 'nugget': return <BuildingStock building={Building.NUGGET} role={session.role} user={session} />;
      case 'repair': return <RepairData role={session.role} />;
      case 'disposal': return <DisposalData role={session.role} />;
      case 'planning': return <Planning role={session.role} />;
      case 'history': return <History role={session.role} />;
      case 'po': return <POReport role={session.role} />;
      case 'settings': return <Profile session={session} onLogout={handleLogout} theme={theme} setTheme={setTheme} />;
      default: return <Dashboard role={session.role} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        role={session.role}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className={`text-3xl font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {activeMenu.replace(/-/g, ' ')}
            </h1>
            <div className="flex items-center gap-5">
              <div className="text-right hidden sm:block">
                <p className={`text-sm font-black uppercase tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{session.fullName}</p>
                <div className="flex items-center justify-end gap-1.5">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                   <p className={`text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{session.role}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveMenu('settings')}
                className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shadow-sm hover:scale-105 transition-all"
              >
                {session.fullName.charAt(0)}
              </button>
            </div>
          </header>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
