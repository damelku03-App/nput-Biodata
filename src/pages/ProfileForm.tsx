import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Save, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ProfileForm() {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    nama: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    no_hp: '',
    email: '',
    jenis_kelamin: '',
    agama: '',
    status_perkawinan: '',
    pendidikan: '',
    jurusan: '',
    alamat_kampung: '',
    rt: '',
    rw: '',
    desa: '',
    kecamatan: '',
    kabupaten: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [kabupatens, setKabupatens] = useState<{ id: string, name: string }[]>([]);
  const [kecamatans, setKecamatans] = useState<{ id: string, name: string }[]>([]);
  const [desas, setDesas] = useState<{ id: string, name: string }[]>([]);

  const [selectedKab, setSelectedKab] = useState('');
  const [selectedKec, setSelectedKec] = useState('');

  useEffect(() => {
    // Fetch profile
    fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(async (data) => {
        const { documents, ...profile } = data;
        setFormData(prev => ({ ...prev, ...profile }));

        // If data exists, try to find IDs to populate dropdowns
        if (profile.kabupaten) {
          const kabRes = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/regencies/32.json');
          const kabs = await kabRes.json();
          setKabupatens(kabs);
          const foundKab = kabs.find((k: any) => k.name === profile.kabupaten);
          if (foundKab) {
            setSelectedKab(foundKab.id);
            if (profile.kecamatan) {
              const kecRes = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${foundKab.id}.json`);
              const kecs = await kecRes.json();
              setKecamatans(kecs);
              const foundKec = kecs.find((k: any) => k.name === profile.kecamatan);
              if (foundKec) {
                setSelectedKec(foundKec.id);
                const desaRes = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${foundKec.id}.json`);
                const ds = await desaRes.json();
                setDesas(ds);
              }
            }
          }
        } else {
          // Just fetch kabs if no profile data
          const kabRes = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/regencies/32.json');
          const kabs = await kabRes.json();
          setKabupatens(kabs);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Fetch Kecamatans when Kabupaten changes
  useEffect(() => {
    if (selectedKab) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedKab}.json`)
        .then(res => res.json())
        .then(data => setKecamatans(data));
      setDesas([]);
    }
  }, [selectedKab]);

  // Fetch Desas when Kecamatan changes
  useEffect(() => {
    if (selectedKec) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedKec}.json`)
        .then(res => res.json())
        .then(data => setDesas(data));
    }
  }, [selectedKec]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
      } else {
        setMessage({ type: 'error', text: 'Gagal memperbarui profil' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Kesalahan koneksi' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="flex items-center justify-center h-64">Memuat formulir...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Form Data Diri</h1>
          <p className="text-white/60">Lengkapi data identitas Anda dengan benar.</p>
        </div>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
        >
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identitas Section */}
        <section className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/10 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-white/90">Data Identitas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">Tempat Lahir</label>
                <input
                  type="text"
                  name="tempat_lahir"
                  value={formData.tempat_lahir}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">No HP (WhatsApp)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="tel"
                  name="no_hp"
                  value={formData.no_hp}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Alamat Section */}
        <section className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/10 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-white/90">Data Alamat</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Kampung / Dusun / Jalan</label>
              <input
                type="text"
                name="alamat_kampung"
                value={formData.alamat_kampung}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">RT</label>
                <input
                  type="text"
                  name="rt"
                  value={formData.rt}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">RW</label>
                <input
                  type="text"
                  name="rw"
                  value={formData.rw}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Kabupaten / Kota</label>
              <select
                name="kabupaten"
                value={formData.kabupaten}
                onChange={(e) => {
                  const kab = kabupatens.find(k => k.name === e.target.value);
                  setSelectedKab(kab?.id || '');
                  setFormData({ ...formData, kabupaten: e.target.value, kecamatan: '', desa: '' });
                }}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
              >
                <option value="" className="bg-slate-900">Pilih Kabupaten</option>
                {kabupatens.map(kab => (
                  <option key={kab.id} value={kab.name} className="bg-slate-900">{kab.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Kecamatan</label>
              <select
                name="kecamatan"
                value={formData.kecamatan}
                onChange={(e) => {
                  const kec = kecamatans.find(k => k.name === e.target.value);
                  setSelectedKec(kec?.id || '');
                  setFormData({ ...formData, kecamatan: e.target.value, desa: '' });
                }}
                disabled={!selectedKab}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all disabled:opacity-50 text-white"
              >
                <option value="" className="bg-slate-900">Pilih Kecamatan</option>
                {kecamatans.map(kec => (
                  <option key={kec.id} value={kec.name} className="bg-slate-900">{kec.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Desa / Kelurahan</label>
              <select
                name="desa"
                value={formData.desa}
                onChange={handleChange}
                disabled={!selectedKec}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all disabled:opacity-50 text-white"
              >
                <option value="" className="bg-slate-900">Pilih Desa</option>
                {desas.map(desa => (
                  <option key={desa.id} value={desa.name} className="bg-slate-900">{desa.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Data Pribadi & Pendidikan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/10 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-white/90">Data Pribadi</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">Jenis Kelamin</label>
                <select 
                  name="jenis_kelamin" 
                  value={formData.jenis_kelamin} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                >
                  <option value="" className="bg-slate-900">Pilih</option>
                  <option value="Laki-laki" className="bg-slate-900">Laki-laki</option>
                  <option value="Perempuan" className="bg-slate-900">Perempuan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">Agama</label>
                <select 
                  name="agama" 
                  value={formData.agama} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                >
                  <option value="" className="bg-slate-900">Pilih</option>
                  <option value="Islam" className="bg-slate-900">Islam</option>
                  <option value="Kristen" className="bg-slate-900">Kristen</option>
                  <option value="Katolik" className="bg-slate-900">Katolik</option>
                  <option value="Hindu" className="bg-slate-900">Hindu</option>
                  <option value="Buddha" className="bg-slate-900">Buddha</option>
                  <option value="Konghucu" className="bg-slate-900">Konghucu</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">Status Perkawinan</label>
                <select 
                  name="status_perkawinan" 
                  value={formData.status_perkawinan} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                >
                  <option value="" className="bg-slate-900">Pilih</option>
                  <option value="Belum Kawin" className="bg-slate-900">Belum Kawin</option>
                  <option value="Kawin" className="bg-slate-900">Kawin</option>
                  <option value="Cerai Hidup" className="bg-slate-900">Cerai Hidup</option>
                  <option value="Cerai Mati" className="bg-slate-900">Cerai Mati</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/10 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-white/90">Data Pendidikan</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">Pendidikan Terakhir</label>
                <select 
                  name="pendidikan" 
                  value={formData.pendidikan} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                >
                  <option value="" className="bg-slate-900">Pilih</option>
                  <option value="SD" className="bg-slate-900">SD</option>
                  <option value="SMP" className="bg-slate-900">SMP</option>
                  <option value="SMA" className="bg-slate-900">SMA</option>
                  <option value="SMK" className="bg-slate-900">SMK</option>
                  <option value="D3" className="bg-slate-900">D3</option>
                  <option value="S1" className="bg-slate-900">S1</option>
                  <option value="S2" className="bg-slate-900">S2</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">Jurusan</label>
                <input
                  type="text"
                  name="jurusan"
                  value={formData.jurusan}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                  placeholder="Contoh: IPA / Akuntansi"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-secondary text-slate-900 font-black rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Menyimpan...' : 'SIMPAN DATA'}
          </button>
        </div>
      </form>
    </div>
  );
}
