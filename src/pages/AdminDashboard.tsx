import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'motion/react';

interface Stats {
  total: number;
  complete: number;
  incomplete: number;
  educationStats: { name: string; value: number }[];
}

const COLORS = ['#0F52BA', '#FF3800', '#1E293B', '#64748B', '#94A3B8', '#CBD5E1'];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-64">Memuat statistik...</div>;

  const cards = [
    { label: 'Total Pelamar', value: stats?.total, icon: Users, color: 'primary', trend: '+12%' },
    { label: 'Berkas Lengkap', value: stats?.complete, icon: CheckCircle, color: 'emerald', trend: '+5%' },
    { label: 'Belum Lengkap', value: stats?.incomplete, icon: XCircle, color: 'amber', trend: '-2%' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-white/60">Ringkasan data rekrutmen tenaga kerja desa.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <motion.div 
            key={card.label}
            whileHover={{ y: -4 }}
            className="bg-coquelicot p-6 rounded-2xl shadow-lg border border-white/10 text-white"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl bg-white/20 text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${card.trend.startsWith('+') ? 'text-emerald-300' : 'text-red-300'}`}>
                {card.trend}
                {card.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-white/70 text-sm font-medium">{card.label}</h3>
              <p className="text-3xl font-black text-white mt-1">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6">Distribusi Pendidikan</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.educationStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats?.educationStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6">Status Berkas</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Lengkap', value: stats?.complete },
                    { name: 'Tidak Lengkap', value: stats?.incomplete }
                  ]}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#0F52BA" />
                  <Cell fill="#FF3800" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-white">{stats?.total}</span>
              <span className="text-xs text-white/50 font-bold uppercase tracking-widest">Pelamar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
