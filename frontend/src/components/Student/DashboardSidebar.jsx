import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Wallet, BarChart3, Award, Package, BookOpen, FileCheck2, Compass,
  Landmark, UserCheck, HeartHandshake, MessageCircle, GraduationCap, Briefcase, Settings,
  Users2, Zap, Tag, ClipboardList, Link2, Share2, Network, ShoppingBag, LogOut, UserCircle, Percent
} from 'lucide-react';

export default function DashboardSidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  const isManager = user?.role === 'manager';

  const menuGroups = [
    ...(isManager ? [{
      title: 'Manager Panel',
      items: [
        { label: 'Manager Dashboard', path: '/manager', icon: <BarChart3 className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    }] : []),
    {
      title: 'My Dashboard',
      items: [
        { label: 'Dashboard', path: '/student', icon: <LayoutDashboard className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'My Earning', path: '/student/wallet', icon: <Wallet className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'My Commissions', path: '/student/commissions', icon: <Percent className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Leaderboard', path: '/student/leaderboard', icon: <BarChart3 className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'My Achievement', path: '/student/achievements', icon: <Award className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'My Packages', path: '/student/packages', icon: <Package className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'My Courses', path: '/student/courses', icon: <BookOpen className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Certificate', path: '/student/certificates', icon: <FileCheck2 className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Trip Achievement', path: '/student/trip', icon: <Compass className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    },
    {
      title: 'Payout Details',
      items: [
        { label: 'Payout Details', path: '/student/wallet', icon: <Landmark className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'KYC', path: '/student/kyc', icon: <UserCheck className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Nominee Details', path: '/student/nominee', icon: <HeartHandshake className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    },
    {
      title: 'Support System',
      items: [
        { label: 'Manager', path: '/student/support', icon: <MessageCircle className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Trainings', path: '/student/trainings', icon: <GraduationCap className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Freelancing', path: '/student/freelancing', icon: <Briefcase className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Tools', path: '/student/tools', icon: <Settings className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Community', path: '/student/community', icon: <Users2 className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { label: 'Upgrade Panel', path: '/student/upgrade', icon: <Zap className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Aflate Offers', path: '/student/offers', icon: <Tag className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Registration Form', path: '/register', icon: <ClipboardList className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Link Generator', path: '/student/link-generator', icon: <Link2 className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Your Referral', path: '/student/referrals', icon: <Share2 className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'My Team Network', path: '/student/my-team', icon: <Network className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-[280px] min-w-[280px] flex flex-col h-full border-r border-slate-200 shadow-[2px_0_8px_rgba(0,0,0,0.04)]" style={{ background: 'linear-gradient(180deg, #fff 0%, #fafafa 100%)' }}>

      {/* User card — gradient banner */}
      <Link
        to="/student/profile"
        className="relative flex-shrink-0 overflow-hidden group/card"
        style={{ background: 'linear-gradient(135deg, #0f1f4d 0%, #1e3a8a 60%, #2563eb 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-blue-400/25 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative flex items-center gap-3 px-4 py-4">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-amber-300 via-blue-300 to-indigo-300 opacity-70 blur-[3px]"></div>
            <div className="relative w-[42px] h-[42px] rounded-full flex-shrink-0 overflow-hidden border border-white/30 bg-white/10 flex items-center justify-center">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-white truncate">{user?.name}</p>
            <p className="text-[0.7rem] text-blue-200 font-bold uppercase tracking-wider">
              {user?.role === 'manager' ? 'Manager' : user?.role === 'team_member' ? 'Team Member' : 'Student'}
            </p>
          </div>
        </div>
      </Link>

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
                        isActive ? 'text-blue-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:translate-x-0.5'
                      }`}
                      style={isActive ? { background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', boxShadow: 'inset 0 0 0 1px rgba(37,99,235,0.12)' } : undefined}
                    >
                      <span
                        className={`absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] rounded-r transition-all duration-200 ${isActive ? 'h-5 bg-blue-600' : 'h-0 bg-blue-600 group-hover:h-3.5'}`}
                      ></span>
                      <span
                        className="flex items-center justify-center rounded-[9px] p-[7px] flex-shrink-0 transition-all duration-200"
                        style={isActive
                          ? { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', boxShadow: '0 4px 10px rgba(37,99,235,0.35)' }
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
        <button
          onClick={() => { navigate('/student/packages'); onNavigate?.(); }}
          className="flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-white font-bold text-[0.85rem] shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
        >
          <ShoppingBag className="w-4 h-4" />
          Buy Package
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-red-500 font-semibold text-[0.85rem] hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
