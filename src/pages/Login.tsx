import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { User, Lock, ArrowRight } from 'lucide-react';

import { Link } from 'react-router-dom';

export default function Login() {
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik || !password) return setError('NIK dan Password wajib diisi');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-coquelicot/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-coquelicot/10 rounded-full blur-[120px] pointer-events-none" />
      
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
                Mulai Karir <br /> 
                <span className="text-coquelicot">Impian Anda</span> <br />
                Hari Ini.
              </h2>
              <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                Platform digital terintegrasi untuk mempermudah pendaftaran dan pengelolaan database calon tenaga kerja yang profesional.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-full bg-coquelicot/20 flex items-center justify-center text-coquelicot">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Terverifikasi & Aman</p>
              <p className="text-xs text-slate-300">Data Anda dilindungi dengan enkripsi standar industri.</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 lg:p-16 bg-slate-900 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-10 lg:hidden flex flex-col items-center">
              <div className="w-16 h-16 bg-coquelicot rounded-2xl flex items-center justify-center shadow-xl mb-4">
                <span className="text-3xl font-black italic text-white">D</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter">DamelKu</h1>
              <p className="text-slate-400 text-sm mt-1">Sistem Informasi Calon Tenaga Kerja</p>
            </div>

            <div className="mb-10 hidden lg:block">
              <h3 className="text-3xl font-bold text-white">Selamat Datang</h3>
              <p className="text-slate-400 mt-2">Silakan masuk ke akun Anda untuk melanjutkan.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-sm font-medium border border-red-500/20 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">NIK / Username</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-coquelicot transition-colors" />
                  <input
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-coquelicot/10 focus:border-coquelicot outline-none transition-all font-medium text-white placeholder:text-slate-600"
                    placeholder="Masukkan NIK Anda"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                  <a href="#" className="text-xs font-bold text-coquelicot hover:text-white">Lupa Password?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-coquelicot transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-coquelicot/10 focus:border-coquelicot outline-none transition-all font-medium text-white placeholder:text-slate-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-coquelicot hover:bg-coquelicot/90 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98] shadow-xl shadow-coquelicot/20 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    MASUK SEKARANG
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="pt-6 text-center">
                <p className="text-slate-400 text-sm">
                  Belum memiliki akun?{' '}
                  <Link to="/register" className="text-coquelicot font-black hover:text-white transition-colors">
                    Daftar Sekarang
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
