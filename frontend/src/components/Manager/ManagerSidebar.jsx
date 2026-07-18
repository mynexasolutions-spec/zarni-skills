import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Sparkles, LogOut, Briefcase, ExternalLink } from 'lucide-react';

export default function ManagerSidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/manager', icon: <LayoutDashboard className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    },
    {
      title: 'Network',
      items: [
        { label: 'My Team', path: '/manager/team', icon: <Users className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Commissions', path: '/manager/commissions', icon: <Sparkles className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-[280px] min-w-[280px] flex flex-col h-full border-r border-slate-200 shadow-[2px_0_8px_rgba(0,0,0,0.04)]" style={{ background: 'linear-gradient(180deg, #fff 0%, #fafafa 100%)' }}>

      {/* Manager card — gradient banner */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 60%, #7c3aed 100%)' }}>
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-violet-500/25 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative flex items-center gap-3 px-4 py-4">
          <div className="w-[42px] h-[42px] rounded-full flex-shrink-0 overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.3)] bg-white/10 border border-white/15 flex items-center justify-center">
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <Briefcase className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-white truncate">{user?.name}</p>
            <p className="text-[0.7rem] text-violet-200 font-bold uppercase tracking-wider">Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 no-scrollbar">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <p className="flex items-center gap-2 px-4 pt-3 pb-0.5 text-[0.65rem] font-extrabold uppercase tracking-widest text-slate-400">
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              {group.title}
            </p>
            <ul>
              {group.items.map((item, iIdx) => {
                const isActive = currentPath === item.path;
                return (
                  <li key={iIdx} className="mx-2">
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      className={`group relative flex items-center gap-2.5 px-3.5 py-2.5 my-0.5 rounded-[10px] text-[0.84rem] font-semibold transition-all duration-200 ${
                        isActive ? 'text-violet-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:translate-x-0.5'
                      }`}
                      style={isActive ? { background: 'linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)', boxShadow: 'inset 0 0 0 1px rgba(124,58,237,0.12)' } : undefined}
                    >
                      <span
                        className={`absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] rounded-r transition-all duration-200 ${isActive ? 'h-5 bg-violet-600' : 'h-0 bg-violet-600 group-hover:h-3.5'}`}
                      ></span>
                      <span
                        className="flex items-center justify-center rounded-[9px] p-[7px] flex-shrink-0 transition-all duration-200"
                        style={isActive
                          ? { background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff', boxShadow: '0 4px 10px rgba(124,58,237,0.35)' }
                          : { background: '#f3f4f6', color: 'inherit' }}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-3 border-t border-slate-100 bg-slate-50 flex flex-col gap-2">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-white font-bold text-[0.85rem] shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_16px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all"
          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
        >
          <ExternalLink className="w-4 h-4" />
          View Website
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-red-500 font-semibold text-[0.85rem] hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </aside>
  );
}
