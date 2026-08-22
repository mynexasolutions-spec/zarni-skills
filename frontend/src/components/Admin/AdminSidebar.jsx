import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCog, Briefcase, Share2, Layers, BookOpen,
  CreditCard, Landmark, Sparkles, Wallet, FileText, Settings, LogOut, ShieldCheck, ExternalLink,
  GalleryHorizontal, GraduationCap, Tag, Rocket, Award, Crown, FileBadge, Users2,
  ClipboardList, ArrowUpCircle, Link2, Package as PackageIcon, Target, MessageSquare
} from 'lucide-react';

export default function AdminSidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    },
    {
      title: 'People',
      items: [
        { label: 'Users', path: '/admin/users', icon: <Users className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Managers', path: '/admin/managers', icon: <UserCog className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Team Members', path: '/admin/team-members', icon: <Briefcase className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'All Referrals', path: '/admin/referrals', icon: <Share2 className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Registration Details', path: '/admin/registration-details', icon: <ClipboardList className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    },
    {
      title: 'Catalog',
      items: [
        { label: 'Packages', path: '/admin/packages', icon: <Layers className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Package Upgrade', path: '/admin/package-upgrades', icon: <ArrowUpCircle className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Courses', path: '/admin/courses', icon: <BookOpen className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Instructors', path: '/admin/instructors', icon: <GraduationCap className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Course Link', path: '/admin/course-links', icon: <Link2 className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Products', path: '/admin/products', icon: <PackageIcon className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Home Customization', path: '/admin/home-customization', icon: <GalleryHorizontal className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Community Links', path: '/admin/community-links', icon: <Users2 className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Trainings', path: '/admin/trainings', icon: <GraduationCap className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Masterclass Funnel', path: '/admin/masterclass-funnel', icon: <Rocket className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Masterclass Registrations', path: '/admin/masterclass-registrations', icon: <GraduationCap className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Achievements', path: '/admin/achievements', icon: <Award className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Certificate Template', path: '/admin/certificate-template', icon: <FileBadge className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    },
    {
      title: 'Finance',
      items: [
        { label: 'Orders', path: '/admin/orders', icon: <CreditCard className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Withdrawals', path: '/admin/withdrawals', icon: <Landmark className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Commissions', path: '/admin/commissions', icon: <Sparkles className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Wallet Ledger', path: '/admin/wallet-details', icon: <Wallet className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Coupons', path: '/admin/coupons', icon: <Tag className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    },
    {
      title: 'Earnings',
      items: [
        { label: 'Manager Earning', path: '/admin/manager-earnings', icon: <Crown className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Users Earning', path: '/admin/users-earnings', icon: <Users className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    },
    {
      title: 'Compliance',
      items: [
        { label: 'Manager Requests', path: '/admin/manager-requests', icon: <UserCog className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'KYC Verification', path: '/admin/kyc', icon: <FileText className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Payout Request', path: '/admin/withdrawals', icon: <Landmark className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Achievement Requests', path: '/admin/achievement-requests', icon: <Award className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Freelance Applications', path: '/admin/freelance-applications', icon: <Briefcase className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'Connect Form', path: '/admin/connect-form', icon: <MessageSquare className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
        { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-[15px] h-[15px]" strokeWidth={1.8} /> },
      ]
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  let itemCounter = 0;

  return (
    <aside className="relative w-[280px] min-w-[280px] flex flex-col h-full border-r border-slate-200 shadow-[2px_0_16px_rgba(15,23,42,0.05)]" style={{ background: 'linear-gradient(180deg, #fff 0%, #fafbff 100%)' }}>

      {/* Admin card — gradient banner */}
      <div className="relative flex-shrink-0 overflow-hidden group/card" style={{ background: 'linear-gradient(135deg, #1c0b14 0%, #7f1d1d 60%, #dc2626 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '18px 18px'
        }}></div>
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-red-500/25 rounded-full blur-2xl pointer-events-none transition-transform duration-700 group-hover/card:scale-125"></div>
        <span className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

        <div className="relative flex items-center gap-3 px-4 py-4">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-amber-300 via-red-300 to-rose-300 opacity-70 blur-[3px] animate-pulse"></div>
            <div className="relative w-[44px] h-[44px] rounded-full flex-shrink-0 overflow-hidden border-2 border-white/40 bg-white/10 flex items-center justify-center shadow-lg">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-white" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1c0b14] shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-white truncate">{user?.name}</p>
            <span className="inline-flex items-center gap-1 mt-0.5 text-[0.65rem] text-red-200 font-bold uppercase tracking-wider bg-white/10 border border-white/10 px-2 py-0.5 rounded-full">
              <Crown className="w-2.5 h-2.5 text-amber-300" /> Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 no-scrollbar">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <p className="flex items-center gap-2 px-4 pt-3.5 pb-1 text-[0.65rem] font-extrabold uppercase tracking-widest text-slate-400">
              <span className="w-3 h-[3px] rounded-full bg-gradient-to-r from-red-400 to-rose-500"></span>
              {group.title}
            </p>
            <ul>
              {group.items.map((item, iIdx) => {
                const isActive = currentPath === item.path;
                const delay = itemCounter++ * 25;
                return (
                  <li key={iIdx} className="mx-2 animate-fade-in-up" style={{ animationDelay: `${delay}ms`, animationDuration: '350ms' }}>
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      className={`group relative flex items-center gap-2.5 px-3.5 py-2.5 my-0.5 rounded-[10px] text-[0.84rem] font-semibold transition-all duration-200 ${
                        isActive ? 'text-red-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:translate-x-0.5'
                      }`}
                      style={isActive ? { background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)', boxShadow: 'inset 0 0 0 1px rgba(220,38,38,0.15), 0 2px 8px -2px rgba(220,38,38,0.15)' } : undefined}
                    >
                      <span
                        className={`absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] rounded-r transition-all duration-200 ${isActive ? 'h-5 bg-gradient-to-b from-red-400 to-rose-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]' : 'h-0 bg-red-600 group-hover:h-3.5'}`}
                      ></span>
                      <span
                        className={`flex items-center justify-center rounded-[9px] p-[7px] flex-shrink-0 transition-all duration-200 ${!isActive ? 'group-hover:scale-110 group-hover:bg-red-50 group-hover:text-red-600' : ''}`}
                        style={isActive
                          ? { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', boxShadow: '0 4px 12px rgba(220,38,38,0.4)' }
                          : { background: '#f3f4f6', color: 'inherit' }}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-3 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm flex flex-col gap-2">
        <Link
          to="/"
          className="group relative overflow-hidden flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-white font-bold text-[0.85rem] shadow-[0_4px_14px_rgba(220,38,38,0.35)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.5)] hover:-translate-y-0.5 transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
          <ExternalLink className="w-4 h-4 relative" />
          <span className="relative">View Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-red-500 font-semibold text-[0.85rem] hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </aside>
  );
}
