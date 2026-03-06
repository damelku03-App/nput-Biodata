import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  FileSearch, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface StatusData {
  status_berkas: string;
  nama: string;
  documents: {
    ijazah: string | null;
    kk: string | null;
    ktp: string | null;
    skck: string | null;
    pas_foto: string | null;
    npwp: string | null;
    surat_kuning: string | null;
    lamaran: string | null;
  };
}

export default function ApplicationStatus() {
  const { token } = useAuth();
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setData({
        status_berkas: data.documents.status_berkas,
        nama: data.nama,
        documents: data.documents
      }))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-64">Memuat status...</div>;

  const allFilesUploaded = data?.documents && 
    data.documents.ijazah && 
    data.documents.kk && 
    data.documents.ktp && 
    data.documents.skck && 
    data.documents.pas_foto && 
    data.documents.npwp && 
    data.documents.surat_kuning && 
    data.documents.lamaran;

  const isVerified = data?.status_berkas === 'LENGKAP';

  const steps = [
    { id: 1, label: 'Registrasi Akun', status: 'completed', desc: 'Akun Anda telah berhasil dibuat.' },
    { id: 2, label: 'Pengisian Data Diri', status: data?.nama ? 'completed' : 'pending', desc: 'Melengkapi informasi identitas dan alamat.' },
    { id: 3, label: 'Upload Berkas', status: allFilesUploaded ? 'completed' : 'pending', desc: 'Mengunggah dokumen persyaratan wajib.' },
    { id: 4, label: 'Verifikasi Admin', status: isVerified ? 'completed' : 'pending', desc: 'Pengecekan keaslian dokumen oleh petugas.' },
    { id: 5, label: 'Selesai', status: isVerified ? 'completed' : 'pending', desc: 'Data Anda masuk ke database tenaga kerja.' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Status Lamaran</h1>
        <p className="text-white/60">Lacak progres pendaftaran Anda secara real-time.</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/10">
        <div className="relative space-y-12">
          {/* Vertical Line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-white/5 -z-0" />

          {steps.map((step, idx) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative flex items-start gap-6"
            >
              <div className={`
                relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                ${step.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-white/5 border-2 border-white/10 text-white/40'}
              `}>
                {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{step.id}</span>}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold ${step.status === 'completed' ? 'text-white' : 'text-white/40'}`}>
                    {step.label}
                  </h3>
                  {step.status === 'completed' && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">Berhasil</span>
                  )}
                </div>
                <p className="text-sm text-white/50 mt-1">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-coquelicot p-6 rounded-2xl text-white flex items-center gap-4 shadow-lg">
        <div className="p-3 bg-white/20 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-white">Keamanan Data Terjamin</h4>
          <p className="text-xs text-white/80 mt-1 font-medium">Seluruh data dan dokumen yang Anda unggah dilindungi dengan enkripsi standar industri.</p>
        </div>
      </div>
    </div>
  );
}
