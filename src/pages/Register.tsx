import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, UserPlus, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nik.length < 16) return setError('NIK harus 16 digit');
    if (password.length < 6) return setError('Password minimal 6 karakter');
    if (password !== confirmPassword) {
      return setError('Password tidak cocok');
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik, nama, password }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/login');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sapphire flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-coquelicot/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-coquelicot/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden relative z-10">
        
        {/* Left Side: Branding & Info (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 to-sapphire text-white relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-12"
            >
              <div className="w-12 h-12 bg-coquelicot rounded-2xl flex items-center justify-center shadow-lg shadow-coquelicot/20">
                <span className="text-2xl font-black italic text-white">D</span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter">DamelKu</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-5xl font-bold leading-tight">
                Bergabung <br /> 
                <span className="text-coquelicot">Bersama Kami</span> <br />
                Sekarang.
              </h2>
              <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                Lengkapi data diri Anda dan mulai langkah pertama menuju karir profesional yang lebih baik bersama DamelKu.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-coquelicot/20 flex items-center justify-center text-coquelicot font-bold">1</div>
              <p className="text-sm font-medium">Registrasi Akun</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md opacity-50">
              <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center text-slate-400 font-bold">2</div>
              <p className="text-sm font-medium">Lengkapi Profil</p>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="p-8 lg:p-12 bg-slate-900 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8 lg:hidden flex flex-col items-center">
              <div className="w-14 h-14 bg-coquelicot rounded-2xl flex items-center justify-center shadow-xl mb-3">
                <span className="text-2xl font-black italic text-white">D</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tighter">DamelKu</h1>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white">Buat Akun Baru</h3>
              <p className="text-slate-400 mt-1">Daftarkan diri Anda untuk mulai melamar.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs font-bold border border-red-500/20 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  {error}
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">NIK (Username)</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-coquelicot transition-colors" />
                    <input
                      type="text"
                      value={nik}
                      maxLength={16}
                      onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-4 focus:ring-coquelicot/10 focus:border-coquelicot outline-none transition-all text-sm font-medium text-white placeholder:text-slate-700"
                      placeholder="16 digit NIK"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative group">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-coquelicot transition-colors" />
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-4 focus:ring-coquelicot/10 focus:border-coquelicot outline-none transition-all text-sm font-medium text-white placeholder:text-slate-700"
                      placeholder="Sesuai KTP"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-coquelicot transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-4 focus:ring-coquelicot/10 focus:border-coquelicot outline-none transition-all text-sm font-medium text-white placeholder:text-slate-700"
                    placeholder="Minimal 6 karakter"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Konfirmasi Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-coquelicot transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-4 focus:ring-coquelicot/10 focus:border-coquelicot outline-none transition-all text-sm font-medium text-white placeholder:text-slate-700"
                    placeholder="Ulangi password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-coquelicot hover:bg-coquelicot/90 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98] shadow-xl shadow-coquelicot/20 disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    DAFTAR SEKARANG
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="pt-4 text-center">
                <p className="text-slate-400 text-sm">
                  Sudah memiliki akun?{' '}
                  <Link to="/login" className="text-coquelicot font-black hover:text-white transition-colors">
                    Masuk Disini
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
