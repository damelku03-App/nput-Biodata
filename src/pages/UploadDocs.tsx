import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

interface DocStatus {
  ijazah: string | null;
  kk: string | null; // Used for Paklaring
  ktp: string | null;
  skck: string | null;
  pas_foto: string | null;
  npwp: string | null;
  surat_kuning: string | null;
  lamaran: string | null;
  status_berkas: string;
}

export default function UploadDocs() {
  const { token } = useAuth();
  const [docs, setDocs] = useState<DocStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchDocs = () => {
    fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setDocs(data.documents))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocs();
  }, [token]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        fetchDocs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Memuat berkas...</div>;

  const docTypes = [
    { id: 'ijazah', label: 'Ijazah Terakhir', icon: FileText, format: 'PDF/JPG' },
    { id: 'ktp', label: 'KTP (Kartu Tanda Penduduk)', icon: ImageIcon, format: 'JPG/PNG' },
    { id: 'kk', label: 'Paklaring (Surat Pengalaman Kerja)', icon: FileText, format: 'PDF/JPG' },
    { id: 'skck', label: 'SKCK Aktif', icon: FileText, format: 'JPG/PDF' },
    { id: 'pas_foto', label: 'Pas Foto 4x6', icon: ImageIcon, format: 'JPG' },
    { id: 'npwp', label: 'NPWP', icon: FileText, format: 'PDF/JPG' },
    { id: 'surat_kuning', label: 'Kartu Pencari Kerja (AK-1)', icon: FileText, format: 'PDF/JPG' },
    { id: 'lamaran', label: 'Surat Lamaran Kerja', icon: FileText, format: 'PDF/JPG' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Berkas</h1>
        <p className="text-white/60">Unggah dokumen pendukung untuk verifikasi administrasi.</p>
      </div>

      <div className="bg-primary/20 border border-primary/30 p-4 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
        <div className="text-sm text-white">
          <p className="font-bold">Informasi Penting:</p>
          <ul className="list-disc ml-4 mt-1 space-y-1 text-white/80">
            <li>Pastikan dokumen terbaca dengan jelas (tidak buram).</li>
            <li>Maksimal ukuran file adalah 2MB per dokumen.</li>
            <li>Status akan berubah menjadi <strong>LENGKAP</strong> jika semua berkas wajib telah diunggah.</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {docTypes.map((doc) => {
          const isUploaded = !!(docs as any)?.[doc.id];
          const isUploading = uploading === doc.id;

          return (
            <motion.div 
              key={doc.id}
              whileHover={{ y: -2 }}
              className={`bg-white/10 backdrop-blur-xl p-6 rounded-2xl border transition-all ${isUploaded ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${isUploaded ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/20'}`}>
                  <doc.icon className="w-6 h-6" />
                </div>
                {isUploaded && (
                  <div className="flex items-center gap-1 text-emerald-300 text-xs font-bold bg-emerald-500/20 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> TERUNGGAH
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-white">{doc.label}</h3>
              <p className="text-xs text-white/40 mt-1">Format: {doc.format}</p>

              <div className="mt-6">
                <label className={`
                  relative flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer
                  ${isUploaded 
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20' 
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-primary hover:bg-primary/10'}
                `}>
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  <span className="text-sm font-bold">
                    {isUploading ? 'Mengunggah...' : isUploaded ? 'Ganti Berkas' : 'Pilih Berkas'}
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => handleUpload(e, doc.id)}
                    disabled={!!uploading}
                  />
                </label>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
