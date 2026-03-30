import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, FileText, BarChart3, ShieldAlert, Award, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    const base = [{ name: 'Dashboard', path: '/dashboard', icon: Home }];
    
    if (user?.role === 'EMPLOYEE') {
      return [...base, { name: 'Submit Complaint', path: '/submit-complaint', icon: FileText }];
    }
    if (user?.role === 'ETHICS_MEMBER') {
      return [...base, { name: 'Leaderboard', path: '/leaderboard', icon: Award }];
    }
    if (user?.role === 'ADMIN') {
      return [
        ...base, 
        { name: 'Leaderboard', path: '/leaderboard', icon: Award },
        { name: 'Alerts', path: '/alerts', icon: ShieldAlert }
      ];
    }
    return base;
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.nav 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 glass border-r border-white/10 flex flex-col justify-between"
      >
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SafeVoice
            </h1>
            <p className="text-xs text-slate-400 mt-1">Anonymous Reporting Platform</p>
          </div>
          <div className="px-4 space-y-2 mt-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(124,58,237,0.2)]' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2 rounded-xl bg-white/5">
            <UserCircle size={20} className="text-secondary" />
            <div className="truncate text-sm font-medium">
              {user?.email}
              <div className="text-xs text-slate-400">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-8">
        {/* Decorative background blurs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
