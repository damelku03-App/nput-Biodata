import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  FileText,
  X,
  Activity,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Applicant {
  id: number;
  nik: string;
  nama: string;
  umur: number;
  pendidikan: string;
  no_hp: string;
  email: string;
  status_berkas: string;
  progress_stage: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  jurusan: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  agama: string;
  status_perkawinan: string;
  alamat_kampung: string;
  rt: string;
  rw: string;
}

const PROGRESS_STAGES = [
  'BELUM DIMULAI',
  'PSIKOTES',
  'WAWANCARA',
  'MCU',
  'REGISTRASI / POTO ID CARD'
];

export default function AdminProgress() {
  const { token } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filtered, setFiltered] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterProgress, setFilterProgress] = useState('ALL');
  const [editingProgress, setEditingProgress] = useState<Applicant | null>(null);

  const fetchApplicants = () => {
    setLoading(true);
    fetch('/api/admin/applicants', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setApplicants(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplicants();
  }, [token]);

  useEffect(() => {
    let result = applicants;
    if (search) {
      result = result.filter(a => 
        a.nama.toLowerCase().includes(search.toLowerCase()) || 
        a.nik.includes(search)
      );
    }
    if (filterProgress !== 'ALL') {
      result = result.filter(a => a.progress_stage === filterProgress);
    }
    setFiltered(result);
  }, [search, filterProgress, applicants]);

  const handleDelete = async (id: number) => {
    if (!confirm('PERINGATAN: Menghapus data pelamar akan menghapus seluruh biodata dan dokumen fisik secara permanen. Apakah Anda yakin?')) return;
    
    try {
      const res = await fetch(`/api/admin/applicants/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('Data pelamar berhasil dihapus.');
        fetchApplicants();
      } else {
        alert(`Gagal menghapus data: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mencoba menghapus data.');
    }
  };

  const handleUpdateProgress = async (id: number, newProgress: string) => {
    try {
      const res = await fetch(`/api/admin/applicants/${id}/progress`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ progress: newProgress })
      });
      if (res.ok) {
        fetchApplicants();
        setEditingProgress(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((a, index) => ({
      'NO': index + 1,
      'NIK': a.nik,
      'NAMA LENGKAP': a.nama.toUpperCase(),
      'TEMPAT LAHIR': (a.tempat_lahir || '').toUpperCase(),
      'TANGGAL LAHIR': a.tanggal_lahir || '-',
      'PROGRES LAMARAN': a.progress_stage || 'BELUM DIMULAI'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wscols = [
      { wch: 5 }, { wch: 20 }, { wch: 35 }, { wch: 20 }, { wch: 15 }, { wch: 30 }
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Progres Pelamar");
    
    const date = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    XLSX.writeFile(wb, `Progres_Pelamar_DamelKu_${date}.xlsx`);
  };

  const downloadPDF = (applicant: Applicant) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('LAPORAN PROGRES TAHAPAN SELEKSI PELAMAR', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('SISTEM INFORMASI CALON TENAGA KERJA (DamelKu)', 105, 27, { align: 'center' });
    
    doc.setLineWidth(0.8);
    doc.line(15, 32, 195, 32);

    const tableData = [
      ['NIK', applicant.nik],
      ['NAMA LENGKAP', applicant.nama.toUpperCase()],
      ['TEMPAT, TGL LAHIR', `${(applicant.tempat_lahir || '').toUpperCase()}, ${applicant.tanggal_lahir || '-'}`],
      ['PROGRES SAAT INI', applicant.progress_stage || 'BELUM DIMULAI'],
      ['STATUS BERKAS', applicant.status_berkas],
    ];

    autoTable(doc, {
      startY: 40,
      margin: { left: 15, right: 15 },
      body: tableData,
      theme: 'grid',
      bodyStyles: { fontSize: 10, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Dicetak melalui DamelKu pada: ${new Date().toLocaleString('id-ID')}`, 15, finalY);

    doc.rect(10, 10, 190, 277);
    doc.save(`Progres_${applicant.nik}.pdf`);
  };

  if (loading) return <div className="flex items-center justify-center h-64">Memuat data progres...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Progres Pelamar</h1>
          <p className="text-white/60">Pantau dan update tahapan seleksi setiap pelamar.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-secondary text-slate-900 font-bold rounded-xl shadow-sm transition-all"
        >
          <Download className="w-4 h-4" /> Export Excel
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/10 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
          <input 
            type="text"
            placeholder="Cari Nama atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-white placeholder:text-white/30"
          />
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <Activity className="w-4 h-4 text-white/40" />
          <select 
            value={filterProgress}
            onChange={(e) => setFilterProgress(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-white cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">Semua Tahapan</option>
            {PROGRESS_STAGES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-widest">NIK</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-widest">Nama Lengkap</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-widest">Tempat, Tgl Lahir</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-widest">Status Progres</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((applicant) => (
                <tr key={applicant.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-bold text-white/80">{applicant.nik}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {applicant.nama.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-white">{applicant.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white/60">
                      {applicant.tempat_lahir}, {applicant.tanggal_lahir}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      applicant.progress_stage === 'REGISTRASI / POTO ID CARD' 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : applicant.progress_stage === 'BELUM DIMULAI'
                        ? 'bg-white/10 text-white/40'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      <Activity className="w-3 h-3" />
                      {applicant.progress_stage || 'BELUM DIMULAI'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingProgress(applicant)}
                        title="Update Progres"
                        className="p-2 text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => downloadPDF(applicant)}
                        title="Download PDF"
                        className="p-2 text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(applicant.id)}
                        title="Hapus Data"
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-white/40">Data tidak ditemukan.</div>
        )}
      </div>

      <AnimatePresence>
        {editingProgress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/10"
            >
              <div className="bg-coquelicot p-6 text-white flex items-center justify-between">
                <h2 className="text-xl font-bold">Update Progres Seleksi</h2>
                <button onClick={() => setEditingProgress(null)}><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 space-y-4 bg-sapphire">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Pelamar</p>
                  <p className="font-bold text-white">{editingProgress.nama}</p>
                  <p className="text-sm text-white/50">{editingProgress.nik}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Pilih Tahapan Progres</label>
                  <div className="grid grid-cols-1 gap-2">
                    {PROGRESS_STAGES.map((stage) => (
                      <button
                        key={stage}
                        onClick={() => handleUpdateProgress(editingProgress.id, stage)}
                        className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${
                          editingProgress.progress_stage === stage
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
