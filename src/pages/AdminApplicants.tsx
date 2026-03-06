import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Filter,
  MoreVertical,
  FileText,
  X,
  AlertCircle
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
  ijazah?: string;
  kk?: string;
  ktp?: string;
  surat_kuning?: string;
  npwp?: string;
  skck?: string;
  lamaran?: string;
  pas_foto?: string;
}

export default function AdminApplicants() {
  const { token } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filtered, setFiltered] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);
  const [verifyingApplicant, setVerifyingApplicant] = useState<Applicant | null>(null);

  const fetchApplicants = () => {
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
    if (filterStatus !== 'ALL') {
      result = result.filter(a => a.status_berkas === filterStatus);
    }
    setFiltered(result);
  }, [search, filterStatus, applicants]);

  const handleDelete = async (id: number) => {
    if (!confirm('PERINGATAN: Menghapus data pelamar akan menghapus seluruh biodata dan dokumen fisik yang telah diunggah secara permanen. Apakah Anda yakin?')) return;
    
    try {
      const res = await fetch(`/api/admin/applicants/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('Data pelamar berhasil dihapus secara permanen.');
        fetchApplicants();
      } else {
        alert(`Gagal menghapus data: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mencoba menghapus data.');
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/applicants/${id}/verify`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchApplicants();
        setVerifyingApplicant(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = () => {
    // Map data to Indonesian headers for a professional look
    const exportData = filtered.map((a, index) => ({
      'NO': index + 1,
      'NIK': a.nik,
      'NAMA LENGKAP': a.nama.toUpperCase(),
      'JENIS KELAMIN': a.jenis_kelamin || '-',
      'TEMPAT LAHIR': (a.tempat_lahir || '').toUpperCase(),
      'TANGGAL LAHIR': a.tanggal_lahir || '-',
      'USIA': a.umur ? `${a.umur} Tahun` : '-',
      'AGAMA': a.agama || '-',
      'STATUS KAWIN': a.status_perkawinan || '-',
      'PENDIDIKAN': a.pendidikan || '-',
      'JURUSAN': (a.jurusan || '').toUpperCase(),
      'NO HP / WA': a.no_hp || '-',
      'EMAIL': a.email || '-',
      'ALAMAT': a.alamat_kampung || '-',
      'RT/RW': `${a.rt || '00'}/${a.rw || '00'}`,
      'DESA': (a.desa || '').toUpperCase(),
      'KECAMATAN': (a.kecamatan || '').toUpperCase(),
      'KABUPATEN': (a.kabupaten || '').toUpperCase(),
      'STATUS VERIFIKASI': a.status_berkas
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths for a professional layout
    const wscols = [
      { wch: 5 },  // NO
      { wch: 20 }, // NIK
      { wch: 30 }, // NAMA
      { wch: 15 }, // JK
      { wch: 20 }, // TEMPAT LAHIR
      { wch: 15 }, // TANGGAL LAHIR
      { wch: 10 }, // USIA
      { wch: 12 }, // AGAMA
      { wch: 15 }, // STATUS KAWIN
      { wch: 12 }, // PENDIDIKAN
      { wch: 25 }, // JURUSAN
      { wch: 18 }, // NO HP
      { wch: 25 }, // EMAIL
      { wch: 35 }, // ALAMAT
      { wch: 10 }, // RT/RW
      { wch: 20 }, // DESA
      { wch: 20 }, // KECAMATAN
      { wch: 20 }, // KABUPATEN
      { wch: 20 }, // STATUS
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Pelamar");
    
    // Generate filename with current date
    const date = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    XLSX.writeFile(wb, `Data_Pelamar_DamelKu_${date}.xlsx`);
  };

  const downloadPDF = (applicant: Applicant) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // --- Header / Title ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('(BIODATA LENGKAP PELAMAR HASIL VERIFIKASI AKHIR)', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('SISTEM INFORMASI CALON TENAGA KERJA (DamelKu)', 105, 27, { align: 'center' });
    
    // Double line for header
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.line(15, 32, 195, 32);
    doc.setLineWidth(0.2);
    doc.line(15, 33, 195, 33);

    // --- Data Table ---
    const tableData = [
      ['NOMOR INDUK KEPENDUDUKAN (NIK)', applicant.nik],
      ['NAMA LENGKAP PELAMAR', applicant.nama.toUpperCase()],
      ['TEMPAT, TANGGAL LAHIR', `${(applicant.tempat_lahir || '').toUpperCase()}, ${applicant.tanggal_lahir || '-'}`],
      ['USIA / UMUR SAAT INI', `${applicant.umur || '-'} TAHUN`],
      ['JENIS KELAMIN', (applicant.jenis_kelamin || '-').toUpperCase()],
      ['AGAMA', (applicant.agama || '-').toUpperCase()],
      ['STATUS PERKAWINAN', (applicant.status_perkawinan || '-').toUpperCase()],
      ['PENDIDIKAN TERAKHIR', (applicant.pendidikan || '-').toUpperCase()],
      ['JURUSAN / PROGRAM STUDI', (applicant.jurusan || '-').toUpperCase()],
      ['NOMOR TELEPON / WHATSAPP', applicant.no_hp || '-'],
      ['ALAMAT EMAIL AKTIF', applicant.email || '-'],
      ['ALAMAT DOMISILI LENGKAP', `${(applicant.alamat_kampung || '').toUpperCase()}, RT ${(applicant.rt || '')}/RW ${(applicant.rw || '')}`],
      ['DESA / KELURAHAN', (applicant.desa || '-').toUpperCase()],
      ['KECAMATAN', (applicant.kecamatan || '-').toUpperCase()],
      ['KABUPATEN / KOTA', (applicant.kabupaten || '-').toUpperCase()],
      ['STATUS VERIFIKASI BERKAS', applicant.status_berkas],
    ];

    autoTable(doc, {
      startY: 40,
      margin: { left: 15, right: 15 },
      head: [['KATEGORI DATA', 'KETERANGAN / INFORMASI']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [44, 62, 80], 
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 3
      },
      bodyStyles: { 
        fontSize: 9, 
        cellPadding: 4,
        textColor: [0, 0, 0]
      },
      columnStyles: { 
        0: { fontStyle: 'bold', cellWidth: 65, fillColor: [245, 245, 245] },
        1: { cellWidth: 'auto' }
      },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        font: 'helvetica'
      }
    });

    // --- Footer ---
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Dicetak melalui DamelKu pada: ${new Date().toLocaleString('id-ID')}`, 15, finalY);

    // --- Page Border ---
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    doc.rect(10, 10, 190, 277);

    doc.save(`Biodata_Lengkap_${applicant.nik}.pdf`);
  };

  if (loading) return <div className="flex items-center justify-center h-64">Memuat data pelamar...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Pelamar</h1>
          <p className="text-white/60">Kelola dan verifikasi berkas pendaftaran pelamar.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-secondary text-slate-900 font-bold rounded-xl shadow-sm transition-all"
        >
          <Download className="w-4 h-4" /> Export Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/10 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari Nama atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white placeholder:text-white/30"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium text-white"
          >
            <option value="ALL" className="bg-slate-900">Semua Status</option>
            <option value="LENGKAP" className="bg-slate-900">Lengkap</option>
            <option value="TIDAK LENGKAP" className="bg-slate-900">Tidak Lengkap</option>
          </select>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:bg-white/10">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Pelamar</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Info Personal</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Pendidikan</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Status Berkas</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((applicant) => (
                <tr key={applicant.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {applicant.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{applicant.nama}</p>
                        <p className="text-xs text-white/50">{applicant.nik}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-white/80">{applicant.umur} Tahun</p>
                    <p className="text-xs text-white/50">{applicant.desa || 'Desa belum diisi'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white">{applicant.pendidikan}</p>
                    <p className="text-xs text-white/50">{applicant.jurusan || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => setVerifyingApplicant(applicant)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 ${
                        applicant.status_berkas === 'LENGKAP' 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : applicant.status_berkas === 'MENUNGGU VERIFIKASI'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {applicant.status_berkas === 'LENGKAP' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {applicant.status_berkas}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setVerifyingApplicant(applicant)}
                        title="Verifikasi Dokumen"
                        className="p-2 text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => downloadPDF(applicant)}
                        title="Download PDF Laporan"
                        className="p-2 text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingApplicant(applicant)}
                        title="Edit Data"
                        className="p-2 text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
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
          <div className="p-12 text-center">
            <div className="inline-flex p-4 rounded-full bg-white/5 text-white/20 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-white/40 font-medium">Tidak ada data pelamar ditemukan.</p>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {verifyingApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10"
            >
              <div className="bg-coquelicot p-6 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Verifikasi Dokumen Pelamar</h2>
                  <p className="text-white/70 text-sm font-medium">{verifyingApplicant.nama} - {verifyingApplicant.nik}</p>
                </div>
                <button onClick={() => setVerifyingApplicant(null)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 bg-sapphire">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Document List */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-white border-b border-white/10 pb-2">Daftar Dokumen Unggahan</h3>
                    {[
                      { id: 'ijazah', label: 'Ijazah Terakhir' },
                      { id: 'ktp', label: 'KTP' },
                      { id: 'kk', label: 'Paklaring' },
                      { id: 'skck', label: 'SKCK' },
                      { id: 'pas_foto', label: 'Pas Foto' },
                      { id: 'npwp', label: 'NPWP' },
                      { id: 'surat_kuning', label: 'Kartu Pencari Kerja' },
                      { id: 'lamaran', label: 'Surat Lamaran' },
                    ].map((doc) => {
                      const fileName = (verifyingApplicant as any)[doc.id];
                      return (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                          <div>
                            <p className="text-sm font-bold text-white/90">{doc.label}</p>
                            <p className="text-xs text-white/40">{fileName ? 'Terunggah' : 'Belum Ada'}</p>
                          </div>
                          {fileName && (
                            <a 
                              href={`/uploads/${fileName}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-secondary transition-all"
                            >
                              Lihat Dokumen
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Verification Action */}
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-white mb-4">Hasil Verifikasi Petugas</h3>
                      <p className="text-sm text-white/60 mb-6">
                        Silakan periksa keaslian dan kelengkapan setiap dokumen di samping. Setelah dipastikan valid, tentukan status akhir berkas pelamar.
                      </p>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => handleUpdateStatus(verifyingApplicant.id, 'LENGKAP')}
                          className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${
                            verifyingApplicant.status_berkas === 'LENGKAP'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                            : 'bg-white/10 border-2 border-primary text-primary hover:bg-primary/10'
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />
                          TANDAI SEBAGAI LENGKAP
                        </button>
                        
                        <button 
                          onClick={() => handleUpdateStatus(verifyingApplicant.id, 'TIDAK LENGKAP')}
                          className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${
                            verifyingApplicant.status_berkas === 'TIDAK LENGKAP'
                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/50'
                            : 'bg-white/10 border-2 border-secondary text-secondary hover:bg-secondary/10'
                          }`}
                        >
                          <XCircle className="w-5 h-5" />
                          TANDAI TIDAK LENGKAP
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                      <p className="text-xs text-white/80 leading-relaxed">
                        <strong>Catatan:</strong> Status ini akan langsung muncul di halaman dashboard pelamar. Pastikan semua dokumen telah sesuai dengan persyaratan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal (Simplified) */}
      <AnimatePresence>
        {editingApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-[#1E293B] p-6 text-white flex items-center justify-between">
                <h2 className="text-xl font-bold">Edit Data Pelamar</h2>
                <button onClick={() => setEditingApplicant(null)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label>
                    <input 
                      type="text" 
                      defaultValue={editingApplicant.nama}
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">NIK</label>
                    <input 
                      type="text" 
                      defaultValue={editingApplicant.nik}
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 border rounded-xl outline-none cursor-not-allowed"
                    />
                  </div>
                  {/* Add more fields as needed */}
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <button 
                    onClick={() => setEditingApplicant(null)}
                    className="px-6 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => {
                      alert('Fitur simpan perubahan sedang dikembangkan');
                      setEditingApplicant(null);
                    }}
                    className="px-6 py-2 bg-primary text-slate-900 font-bold rounded-xl"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


