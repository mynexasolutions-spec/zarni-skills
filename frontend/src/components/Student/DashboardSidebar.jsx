import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Wallet, BarChart3, Award, Package, BookOpen, FileCheck2, Compass,
  Landmark, UserCheck, HeartHandshake, MessageCircle, GraduationCap, Briefcase, Settings,
  Users2, Zap, Tag, ClipboardList, Link2, Share2, Network, ShoppingBag, LogOut, UserCircle, Percent,
  ChevronRight, Sparkles, Crown, Trophy
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
        { label: 'Manager Dashboard', path: '/manager', icon: <BarChart3 className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'All Users (Teams)', path: '/manager/all-users', icon: <Network className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'My Earnings', path: '/manager/earnings', icon: <Wallet className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Team Leaderboard', path: '/manager/leaderboard', icon: <Trophy className="w-[15px] h-[15px]" strokeWidth={2} /> },
      ]
    }] : []),
    {
      title: 'My Dashboard',
      items: [
        { label: 'Dashboard', path: '/student', icon: <LayoutDashboard className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'My Earning', path: '/student/wallet', icon: <Wallet className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Leaderboard', path: '/student/leaderboard', icon: <BarChart3 className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'My Achievement', path: '/student/achievements', icon: <Award className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Trip Achievement', path: '/student/trip', icon: <Compass className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'My Course', path: '/student/courses', icon: <BookOpen className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Certificate', path: '/student/certificates', icon: <FileCheck2 className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'My Commissions', path: '/student/commissions', icon: <Percent className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'My Packages', path: '/student/packages', icon: <Package className="w-[15px] h-[15px]" strokeWidth={2} /> },
      ]
    },
    {
      title: 'Payout Details',
      items: [
        { label: 'Payout Details', path: '/student/wallet', icon: <Landmark className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'KYC Verification', path: '/student/kyc', icon: <UserCheck className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Nominee Details', path: '/student/nominee', icon: <HeartHandshake className="w-[15px] h-[15px]" strokeWidth={2} /> },
      ]
    },
    {
      title: 'Support System',
      items: [
        { label: 'Manager Support', path: '/student/support', icon: <MessageCircle className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Trainings', path: '/student/trainings', icon: <GraduationCap className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Freelancing', path: '/student/freelancing', icon: <Briefcase className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Community', path: '/student/community', icon: <Users2 className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Tools', path: '/student/tools', icon: <Settings className="w-[15px] h-[15px]" strokeWidth={2} /> },
      ]
    },
    {
      title: 'Marketing & Affiliate',
      items: [
        { label: 'Upgrade Panel', path: '/student/upgrade', icon: <Zap className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Affiliate Offers', path: '/student/offers', icon: <Tag className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Link Generator', path: '/student/link-generator', icon: <Link2 className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Registration Form', path: '/student/marketing', icon: <ClipboardList className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Your Team Network', path: '/student/my-team', icon: <Network className="w-[15px] h-[15px]" strokeWidth={2} /> },
        { label: 'Your Referrals', path: '/student/referrals', icon: <Share2 className="w-[15px] h-[15px]" strokeWidth={2} /> },
      ]
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabel = user?.role === 'manager' ? 'Manager' : user?.role === 'team_member' ? 'Team Member' : 'Student';

  let itemCounter = 0;

  return (
    <aside
      className="relative w-[280px] min-w-[280px] flex flex-col h-full border-r border-blue-100 rounded-r-[1.75rem] lg:rounded-none shadow-[12px_0_45px_rgba(37,99,235,0.22)] lg:shadow-[4px_0_24px_rgba(37,99,235,0.06)] z-20 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 60%, #f1f5f9 100%)' }}
    >
      {/* Accent edge glow — mobile drawer only */}
      <span className="lg:hidden absolute top-0 right-0 w-[3px] h-full bg-gradient-to-b from-blue-500 via-indigo-500 to-blue-600 shadow-[0_0_14px_rgba(37,99,235,0.6)]"></span>
      {/* Ambient Light Blur Orb */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* ── LIGHT THEME USER PROFILE HEADER CARD ───────────────────────────────────────── */}
      <Link
        to="/student/profile"
        className="relative flex-shrink-0 border-b border-blue-200/80 p-4 transition-all duration-300 hover:bg-blue-100/50 group/card overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0e7ff 100%)' }}
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl pointer-events-none transition-transform duration-700 group-hover/card:scale-125"></div>
        <span className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"></span>

        <div className="relative flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-300 via-blue-400 to-indigo-400 opacity-90 blur-[3px] animate-pulse"></div>
            <div className="relative w-[48px] h-[48px] rounded-full flex-shrink-0 overflow-hidden border-2 border-white bg-white flex items-center justify-center shadow-md shadow-blue-500/15">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-7 h-7 text-blue-600" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-sm"></span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-black text-sm text-slate-900 truncate">{user?.name || 'Student'}</p>
            <span className="inline-flex items-center gap-1.5 mt-1 text-[10px] text-white font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-0.5 rounded-full shadow-sm shadow-blue-500/20">
              {user?.role === 'manager' ? <Crown className="w-3 h-3 text-amber-300" /> : <Sparkles className="w-3 h-3 text-amber-300" />}
              {roleLabel}
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-blue-500/60 shrink-0 transition-transform duration-300 group-hover/card:translate-x-1 group-hover/card:text-blue-700" />
        </div>
      </Link>

      {/* ── NAVIGATION LIST ───────────────────────────────────────── */}
      <nav className="relative flex-1 overflow-y-auto py-3 px-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="mb-4 last:mb-1">
            <p className="flex items-center gap-2 px-3 pt-2 pb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="w-2.5 h-[3px] rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"></span>
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item, iIdx) => {
                const isActive = currentPath === item.path;
                const delay = itemCounter++ * 20;
                return (
                  <li key={iIdx} className="animate-fade-in-up" style={{ animationDelay: `${delay}ms`, animationDuration: '300ms' }}>
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                        isActive
                          ? 'text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-md shadow-blue-500/30'
                          : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70 hover:translate-x-1'
                      }`}
                    >
                      {/* Active Indicator Left Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]"></span>
                      )}

                      {/* Icon Tile */}
                      <span className="relative shrink-0">
                        <span
                          className={`relative flex items-center justify-center rounded-xl p-2 transition-all duration-200 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:scale-110'
                          }`}
                        >
                          {item.icon}
                        </span>
                      </span>

                      {/* Menu Title */}
                      <span className="flex-1 truncate tracking-wide">{item.label}</span>

                      {/* Active Indicator Dot */}
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0"></span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── BOTTOM ACTION FOOTER ───────────────────────────────────────── */}
      <div className="flex-shrink-0 p-3.5 border-t border-blue-100 bg-white/90 backdrop-blur-md flex flex-col gap-2">
        {/* Product Buy Button */}
        <button
          onClick={() => { navigate('/student/products'); onNavigate?.(); }}
          className="group relative overflow-hidden w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-[0_6px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.45)] hover:scale-[1.02] active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e3a8a 100%)' }}
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
          <ShoppingBag className="w-4 h-4 text-blue-200 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
          <span className="relative">Product Buy</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-rose-600 font-bold text-xs bg-rose-50/80 border border-rose-200/60 hover:bg-rose-100 hover:text-rose-700 transition-all"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}
