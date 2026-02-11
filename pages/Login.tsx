
import React, { useState, useEffect } from 'react';
import { UserRole, UserSession, UserAccount } from '../types';

interface LoginProps {
  onLogin: (user: UserSession) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUsers = localStorage.getItem('stokify_users');
    if (!savedUsers || JSON.parse(savedUsers).length === 0) {
      const defaultAdmin: UserAccount = {
        id: 'ADMIN',
        fullName: 'SURYA ADMIN',
        password: 'ADMIN123',
        role: UserRole.LEADER,
        assignedBuilding: undefined
      };
      localStorage.setItem('stokify_users', JSON.stringify([defaultAdmin]));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const savedUsers: UserAccount[] = JSON.parse(localStorage.getItem('stokify_users') || '[]');
      const user = savedUsers.find(u => u.id.toUpperCase() === userId.toUpperCase() && u.password === password);

      if (user) {
        onLogin({
          id: user.id,
          fullName: user.fullName,
          role: user.role,
          assignedBuilding: user.assignedBuilding,
          lastLogin: new Date().toISOString()
        });
      } else {
        setError('Kredensial tidak valid. Silakan hubungi Administrasi.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="glass-card bg-white/[0.02] border-white/[0.05] rounded-[3rem] p-12 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-slide-up backdrop-blur-2xl">
          <div className="text-center mb-14">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-[2rem] mx-auto mb-8 flex items-center justify-center text-4xl shadow-2xl text-white font-black rotate-3">
              ST
            </div>
            <h1 className="text-4xl font-black text-white tracking-[-0.05em] uppercase leading-none mb-3">STOLDRY V.1</h1>
            <p className="text-indigo-400 text-[10px] font-black tracking-[0.4em] uppercase">BY SURYA</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Credential ID</label>
              <input
                type="text"
                autoComplete="username"
                className="w-full px-7 py-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
                placeholder="Masukkan ID Anda"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Secure Keyphrase</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full px-7 py-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-all font-bold pr-16 text-sm tracking-widest"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-xl opacity-40 hover:opacity-100 transition-opacity"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-6 rounded-2xl font-black text-white text-[11px] uppercase tracking-[0.3em] transition-all shadow-2xl ${
                isLoading ? 'bg-indigo-900 opacity-50' : 'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]'
              }`}
            >
              {isLoading ? 'Verifying...' : 'Authorize Access'}
            </button>
          </form>
        </div>
        <p className="text-center mt-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] opacity-40">SURYADINATA 2026</p>
      </div>
    </div>
  );
};

export default Login;
