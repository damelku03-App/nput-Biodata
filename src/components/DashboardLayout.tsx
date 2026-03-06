import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserCircle, 
  FileUp, 
  ClipboardList, 
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = user?.role === 'admin' ? [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard Admin' },
    { to: '/admin/applicants', icon: ClipboardList, label: 'Data Pelamar' },
    { to: '/admin/progress', icon: Activity, label: 'Progres Pelamar' },
  ] : [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/profile', icon: UserCircle, label: 'Data Diri' },
    { to: '/upload', icon: FileUp, label: 'Upload Berkas' },
    { to: '/status', icon: ClipboardList, label: 'Status Lamaran' },
  ];

  return (
    <div className="min-h-screen bg-sapphire flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/50 backdrop-blur-xl text-white border-r border-white/10">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-wider text-primary">DamelKu</h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest">{user?.role}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive ? 'bg-primary text-slate-900 shadow-lg font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-coquelicot text-white h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-lg">
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{user?.nama}</p>
              <p className="text-xs text-white/70">{user?.nik}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border-2 border-white/50 shadow-sm">
              {user?.nama?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-72 bg-[#1E293B] text-white z-50 md:hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary">DamelKu</h1>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      ${isActive ? 'bg-primary text-slate-900 font-bold' : 'text-slate-400'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
              <div className="p-4 border-t border-slate-700">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 w-full text-slate-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
