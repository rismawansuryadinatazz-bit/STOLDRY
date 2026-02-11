
import React, { useState, useEffect } from 'react';
import { UserSession, PasswordRequest, UserAccount, UserRole, Building } from '../types';

interface ProfileProps {
  session: UserSession;
  onLogout: () => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}

const Profile: React.FC<ProfileProps> = ({ session, onLogout, theme, setTheme }) => {
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PasswordRequest[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('stokify_last_sync'));
  
  const [userFormData, setUserFormData] = useState({ id: '', fullName: '', password: '', role: UserRole.STAFF });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const savedReqs = JSON.parse(localStorage.getItem('stokify_password_requests') || '[]');
    setPendingRequests(savedReqs.filter((r: PasswordRequest) => r.status === 'PENDING'));
    
    const savedUsers = JSON.parse(localStorage.getItem('stokify_users') || '[]');
    setUsers(savedUsers);
  }, []);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.id || !userFormData.fullName || !userFormData.password) {
      alert('Mohon lengkapi semua data form!');
      return;
    }

    const currentUsers: UserAccount[] = JSON.parse(localStorage.getItem('stokify_users') || '[]');
    let updatedUsers: UserAccount[];

    if (isEditMode) {
      updatedUsers = currentUsers.map(u => u.id === userFormData.id ? { ...userFormData } : u);
      alert(`Data ${userFormData.fullName} berhasil diperbarui!`);
    } else {
      if (currentUsers.find(u => u.id.toUpperCase() === userFormData.id.toUpperCase())) {
        alert('ID Pengguna sudah terdaftar!');
        return;
      }
      updatedUsers = [...currentUsers, { ...userFormData, id: userFormData.id.toUpperCase() }];
      alert(`Akun baru untuk ${userFormData.fullName} berhasil dibuat!`);
    }

    localStorage.setItem('stokify_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    handleCancelEdit();
  };

  const handleEditClick = (user: UserAccount) => {
    setUserFormData({ ...user });
    setIsEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setUserFormData({ id: '', fullName: '', password: '', role: UserRole.STAFF });
    setIsEditMode(false);
  };

  const handleDeleteUser = (id: string) => {
    if (id === 'ADMIN') return alert('Akun SUPER ADMIN tidak dapat dihapus!');
    if (id === session.id) return alert('Anda tidak dapat menghapus akun Anda sendiri!');
    if (!window.confirm(`Hapus permanen akses untuk ID: ${id}?`)) return;

    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    localStorage.setItem('stokify_users', JSON.stringify(updated));

    // Jika user yang dihapus sedang diedit, bersihkan form
    if (isEditMode && userFormData.id === id) {
      handleCancelEdit();
    }
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem('stokify_last_sync', now);
      setIsSyncing(false);
      alert('✅ Sinkronisasi Berhasil!');
    }, 1500);
  };

  const handleRequestPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || !confirmPass) {
      setMessage({ text: 'Mohon isi semua field!', type: 'error' });
      return;
    }
    if (newPass !== confirmPass) {
      setMessage({ text: 'Password tidak cocok!', type: 'error' });
      return;
    }

    const request: PasswordRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: session.id,
      fullName: session.fullName,
      newPassword: newPass,
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    const currentRequests: PasswordRequest[] = JSON.parse(localStorage.getItem('stokify_password_requests') || '[]');
    const updated = [...currentRequests, request];
    localStorage.setItem('stokify_password_requests', JSON.stringify(updated));
    
    setNewPass('');
    setConfirmPass('');
    setMessage({ text: 'Permintaan diajukan ke Leader.', type: 'success' });
    
    if (session.role === UserRole.LEADER) {
      setPendingRequests(updated.filter(r => r.status === 'PENDING'));
    }
  };

  const handleApprove = (reqId: string) => {
    if (session.role !== UserRole.LEADER) return;
    const reqs: PasswordRequest[] = JSON.parse(localStorage.getItem('stokify_password_requests') || '[]');
    const allUsers: UserAccount[] = JSON.parse(localStorage.getItem('stokify_users') || '[]');
    const target = reqs.find(r => r.id === reqId);
    if (!target) return;
    const updatedUsers = allUsers.map(u => u.id === target.userId ? { ...u, password: target.newPassword } : u);
    localStorage.setItem('stokify_users', JSON.stringify(updatedUsers));
    const updatedReqs = reqs.map(r => r.id === reqId ? { ...r, status: 'APPROVED' as const } : r);
    localStorage.setItem('stokify_password_requests', JSON.stringify(updatedReqs));
    setPendingRequests(updatedReqs.filter(r => r.status === 'PENDING'));
    alert('Password diperbarui!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-slide-up pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card rounded-[3rem] p-10 dark:bg-slate-800/30 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
             <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] mx-auto mb-6 flex items-center justify-center text-4xl font-black text-white shadow-2xl">
                {session.fullName.charAt(0)}
             </div>
             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{session.fullName}</h2>
             <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-3 inline-block">
                {session.role}
             </span>
             <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-left space-y-4">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Login ID</span><span className="font-bold text-slate-700 dark:text-slate-200">{session.id}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Last Login</span><span className="font-bold text-slate-700 dark:text-slate-200">{new Date(session.lastLogin).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
             </div>
          </div>

          <div className="glass-card rounded-[3rem] p-8 dark:bg-slate-800/30">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">🔄 Cloud Bridge</h3>
            <div className="space-y-4">
               <button 
                 onClick={handleSyncNow}
                 disabled={isSyncing}
                 className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all ${isSyncing ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
               >
                 {isSyncing ? 'Syncing...' : 'Sync Spreadsheet'}
               </button>
               {lastSync && <p className="text-[9px] text-center text-slate-400 font-bold uppercase">Last Sync: {new Date(lastSync).toLocaleString()}</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
           {(session.role === UserRole.LEADER || session.role === UserRole.ADMIN) && (
             <div className="glass-card rounded-[3.5rem] p-10 dark:bg-slate-800/30 border border-white/20">
               <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                   {isEditMode ? '🛠️ Edit Data Pegawai' : '👥 Manajemen Akses'}
                 </h3>
                 {isEditMode && <button onClick={handleCancelEdit} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Batal Edit</button>}
               </div>
               
               <form onSubmit={handleSaveUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                 <div className="lg:col-span-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 block">ID Pegawai</label>
                   <input disabled={isEditMode} type="text" placeholder="ID" className="w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 font-bold uppercase text-xs" value={userFormData.id} onChange={e => setUserFormData({...userFormData, id: e.target.value})} />
                 </div>
                 <div className="lg:col-span-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 block">Nama Lengkap</label>
                   <input type="text" placeholder="Nama" className="w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 font-bold text-xs" value={userFormData.fullName} onChange={e => setUserFormData({...userFormData, fullName: e.target.value})} />
                 </div>
                 <div className="lg:col-span-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 block">Level Akses</label>
                   <select className="w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 font-bold text-xs" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})}>
                      <option value={UserRole.STAFF}>STAFF</option>
                      <option value={UserRole.ADMIN}>ADMIN</option>
                      <option value={UserRole.LEADER}>LEADER</option>
                   </select>
                 </div>
                 <div className="lg:col-span-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 block">Password</label>
                   <input type="text" placeholder="Pass" className="w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 font-bold text-xs" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} />
                 </div>
                 <div className="lg:col-span-1 flex items-end">
                   <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-black text-[10px] uppercase rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none">
                     {isEditMode ? 'Update' : 'Simpan'}
                   </button>
                 </div>
               </form>

               <div className="overflow-x-auto custom-scrollbar">
                 <table className="w-full">
                   <thead>
                     <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                       <th className="pb-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">ID</th>
                       <th className="pb-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">Nama Lengkap</th>
                       <th className="pb-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">Role</th>
                       <th className="pb-5 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">Tindakan</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                     {users.map(u => (
                       <tr key={u.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all">
                         <td className="py-6 font-black text-indigo-600 uppercase text-xs">{u.id}</td>
                         <td className="py-6 font-bold text-slate-700 dark:text-slate-200 text-xs">{u.fullName}</td>
                         <td className="py-6">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                               u.role === UserRole.LEADER ? 'bg-indigo-100 text-indigo-700' : 
                               u.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                               {u.role}
                            </span>
                         </td>
                         <td className="py-6 text-right space-x-4">
                            <button onClick={() => handleEditClick(u)} className="text-indigo-500 font-black uppercase text-[10px] hover:underline">Edit</button>
                            <button onClick={() => handleDeleteUser(u.id)} className="text-rose-500 font-black uppercase text-[10px] hover:underline">Hapus</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass-card rounded-[3rem] p-10 dark:bg-slate-800/30">
            <h3 className="text-sm font-black uppercase mb-8 flex items-center gap-2">🛡️ Keamanan Akun</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-6 leading-relaxed">Permintaan ubah password akan diteruskan ke Leader untuk otorisasi sebelum dapat digunakan.</p>
            <form onSubmit={handleRequestPassword} className="space-y-4">
              <input type="password" placeholder="Password Baru" className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={newPass} onChange={e => setNewPass(e.target.value)} />
              <input type="password" placeholder="Konfirmasi Password" className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
              {message && <div className={`p-4 rounded-xl text-[10px] font-black uppercase text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{message.text}</div>}
              <button type="submit" className="w-full py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 dark:shadow-none transition-transform active:scale-95">Ajukan Perubahan</button>
            </form>
         </div>

         <div className="glass-card rounded-[3rem] p-10 dark:bg-slate-800/30">
            <h3 className="text-sm font-black uppercase mb-8 flex items-center gap-2">📥 Antrian Approval</h3>
            {session.role === UserRole.LEADER ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {pendingRequests.map(r => (
                  <div key={r.id} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-800 flex justify-between items-center group hover:border-indigo-500 transition-all">
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{r.fullName}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(r.requestedAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleApprove(r.id)} className="px-5 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-100 transition-all">Approve</button>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <div className="text-center py-20 opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Tidak Ada Permintaan</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 opacity-30 text-center">
                 <div className="text-5xl mb-4">🚫</div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">Akses Terbatas<br/>Memerlukan Otoritas LEADER</p>
              </div>
            )}
         </div>
      </div>

      <div className="text-center pt-20 border-t border-slate-100 dark:border-slate-800 opacity-40">
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">SYSTEM STOLDRY CORE V.1.0 • SURYADINATA 2026</p>
      </div>
    </div>
  );
};

export default Profile;
