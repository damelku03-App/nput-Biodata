import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight,
  AlertCircle,
  FileUp,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface ProfileData {
  nama: string;
  umur: number;
  pendidikan: string;
  documents: {
    status_berkas: string;
    ijazah: string;
    kk: string;
    ktp: string;
    skck: string;
    pas_foto: string;
  };
}

export default function UserDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-64">Memuat data...</div>;

  const isComplete = data?.documents?.status_berkas === 'LENGKAP';
  const isWaiting = data?.documents?.status_berkas === 'MENUNGGU VERIFIKASI';
  const missingDocs = [];
  if (data?.documents) {
    if (!data.documents.ijazah) missingDocs.push('Ijazah');
    if (!data.documents.ktp) missingDocs.push('KTP');
    if (!data.documents.kk) missingDocs.push('Paklaring');
    if (!data.documents.skck) missingDocs.push('SKCK');
    if (!data.documents.pas_foto) missingDocs.push('Pas Foto');
    if (!(data.documents as any).npwp) missingDocs.push('NPWP');
    if (!(data.documents as any).surat_kuning) missingDocs.push('Kartu Pencari Kerja');
    if (!(data.documents as any).lamaran) missingDocs.push('Surat Lamaran');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Selamat Datang, {data?.nama}!</h1>
          <p className="text-white/60">Pantau status pendaftaran Anda di sini.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/10">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-white/80">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="md:col-span-2 bg-coquelicot p-6 rounded-2xl shadow-xl border border-white/10 flex flex-col justify-between text-white"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">Status Kelengkapan Berkas</p>
              <h2 className={`text-3xl font-black mt-2 ${isComplete ? 'text-emerald-300' : isWaiting ? 'text-white' : 'text-amber-300'}`}>
                {data?.documents?.status_berkas || 'TIDAK LENGKAP'}
              </h2>
            </div>
            <div className={`p-3 rounded-2xl ${isComplete ? 'bg-emerald-500/20 text-emerald-300' : isWaiting ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-300'}`}>
              {isComplete ? <CheckCircle2 className="w-8 h-8" /> : isWaiting ? <Clock className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>
          </div>
          
          <div className="mt-6">
            {isWaiting ? (
              <p className="text-sm text-white font-bold">
                Berkas Anda telah lengkap dan sedang dalam proses verifikasi oleh admin. Mohon tunggu.
              </p>
            ) : !isComplete ? (
              <div className="space-y-3">
                <p className="text-sm text-white/80">Anda masih memiliki berkas yang belum diunggah:</p>
                <div className="flex flex-wrap gap-2">
                  {missingDocs.map(doc => (
                    <span key={doc} className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full">
                      {doc}
                    </span>
                  ))}
                </div>
                <Link 
                  to="/upload" 
                  className="inline-flex items-center gap-2 text-white font-black text-sm hover:gap-3 transition-all mt-2"
                >
                  Lengkapi Sekarang <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-emerald-300 font-medium">
                Semua berkas wajib telah terverifikasi sistem. Data Anda siap diproses oleh admin.
              </p>
            )}
          </div>
        </motion.div>

        {/* Profile Summary */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/10 text-white"
        >
          <p className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Ringkasan Profil</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white/50 text-sm">Umur</span>
              <span className="font-bold text-white">{data?.umur || '-'} Tahun</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white/50 text-sm">Pendidikan</span>
              <span className="font-bold text-white">{data?.pendidikan || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-white/50 text-sm">Status</span>
              <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-black rounded uppercase">Aktif</span>
            </div>
          </div>
          <Link 
            to="/profile" 
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-sm border border-white/10"
          >
            Edit Profil
          </Link>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Form Data Diri', icon: FileText, to: '/profile', color: 'primary' },
          { label: 'Upload Berkas', icon: FileUp, to: '/upload', color: 'secondary' },
          { label: 'Status Lamaran', icon: ClipboardList, to: '/status', color: 'primary' },
          { label: 'Bantuan', icon: AlertCircle, to: '#', color: 'slate' },
        ].map((item) => (
          <Link 
            key={item.label}
            to={item.to}
            className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 text-center group"
          >
            <div className={`p-3 rounded-xl ${item.color === 'primary' ? 'bg-primary/20 text-primary' : item.color === 'secondary' ? 'bg-secondary/20 text-secondary' : `bg-slate-500/20 text-slate-300`} group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-white/90">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
