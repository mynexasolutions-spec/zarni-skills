import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, User, LogOut, Landmark, UserCheck, HeartHandshake, DollarSign, UserPlus, ArrowDown, Home, LayoutDashboard, BookOpen, Settings, Users, ExternalLink } from 'lucide-react';
import api from '../../utils/api';

export default function DashboardHeader({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const isAdmin = location.pathname.startsWith('/admin');
  const isManager = location.pathname.startsWith('/manager');
  const isStudentArea = !isAdmin && !isManager;

  useEffect(() => {
    if (!isStudentArea || !user) return;
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/student/dashboard');
        setNotifications(response.data.notifications || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, [user, isStudentArea]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await api.post('/student/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'commission':
        return <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><DollarSign className="w-4 h-4" /></div>;
      case 'referral':
        return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><UserPlus className="w-4 h-4" /></div>;
      case 'withdrawal':
        return <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><ArrowDown className="w-4 h-4" /></div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Bell className="w-4 h-4" /></div>;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navLinks = isAdmin
    ? [
        { label: 'Website', path: '/', icon: Home, match: (p) => p === '/' },
        { label: 'Admin', path: '/admin', icon: LayoutDashboard, match: (p) => p === '/admin' },
        { label: 'Users', path: '/admin/users', icon: Users, match: (p) => p.startsWith('/admin/users') },
      ]
    : isManager
    ? [
        { label: 'Website', path: '/', icon: Home, match: (p) => p === '/' },
        { label: 'Dashboard', path: '/manager', icon: LayoutDashboard, match: (p) => p === '/manager' },
        { label: 'My Team', path: '/manager/team', icon: Users, match: (p) => p.startsWith('/manager/team') },
      ]
    : [
        { label: 'Home', path: '/', icon: Home, match: (p) => p === '/' },
        { label: 'Dashboard', path: '/student', icon: LayoutDashboard, match: (p) => p === '/student' },
        { label: 'Courses', path: '/student/courses', icon: BookOpen, match: (p) => p.startsWith('/student/courses') },
      ];

  const accent = isAdmin
    ? { text: 'text-red-800', badgeBorder: 'border-red-800', dropdownBg: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)', dropdownBorder: '#fecaca', dropdownText: 'text-red-900', dropdownLabel: 'text-red-600', hoverText: 'hover:text-red-600' }
    : isManager
    ? { text: 'text-violet-800', badgeBorder: 'border-violet-800', dropdownBg: 'linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)', dropdownBorder: '#ddd6fe', dropdownText: 'text-violet-900', dropdownLabel: 'text-violet-600', hoverText: 'hover:text-violet-600' }
    : { text: 'text-blue-800', badgeBorder: 'border-blue-700', dropdownBg: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', dropdownBorder: '#dbeafe', dropdownText: 'text-blue-900', dropdownLabel: 'text-blue-600', hoverText: 'hover:text-blue-600' };

  return (
    <header
      className="h-16 flex-shrink-0 flex items-center gap-4 px-4 sm:px-6 sticky top-0 z-[60]"
      style={{
        background: isAdmin
          ? 'linear-gradient(135deg, #1c0b14 0%, #7f1d1d 50%, #dc2626 100%)'
          : isManager
          ? 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)'
          : 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
        boxShadow: isAdmin ? '0 2px 12px rgba(190, 18, 60, 0.25)' : isManager ? '0 2px 12px rgba(124, 58, 237, 0.25)' : '0 2px 12px rgba(30, 64, 175, 0.25)'
      }}
    >
      {/* Left: logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          to="/"
          className="flex items-center bg-white px-3 py-1.5 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5"
        >
          <img
            src="/static/img/zarni-logo.png"
            alt="Zarni Skills"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            className="h-7 sm:h-8 w-auto object-contain"
          />
          <span className="hidden items-center font-black text-primary text-sm">ZS</span>
        </Link>
        {isAdmin && (
          <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-white/80">
            Admin Panel
          </span>
        )}
        {isManager && (
          <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-white/80">
            Manager Hub
          </span>
        )}
      </div>

      {/* Right: nav pill + icons */}
      <div className="ml-auto flex items-center gap-3">

        {/* Nav pill */}
        <div className="hidden sm:flex items-center gap-0.5 bg-white/10 p-1 rounded-xl flex-shrink-0">
          {navLinks.map((link) => {
            const active = link.match(location.pathname);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] text-[0.82rem] font-semibold whitespace-nowrap transition-all ${
                  active ? `bg-white ${accent.text} shadow-[0_2px_8px_rgba(0,0,0,0.15)]` : 'text-white/85 hover:bg-white/15 hover:text-white'
                }`}
              >
                <link.icon className="w-[15px] h-[15px]" strokeWidth={2} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Notifications Bell Dropdown */}
        {isStudentArea && (
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center relative transition-all hover:-translate-y-0.5"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className={`absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center border-2 ${accent.badgeBorder} text-white`}>
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)}></div>
                <div className="absolute right-0 mt-3.5 w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-800 animate-slide-down">
                  <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Notifications</span>
                    <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-blue-600 hover:underline">Mark all read</button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 ${!n.is_read ? 'bg-blue-50/30' : ''}`}>
                        <div className="shrink-0 mt-0.5">{getNotifIcon(n.type)}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-slate-400 font-medium block mt-1.5">{n.created_at}</span>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No notifications yet</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Profile trigger */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
            className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden transition-all hover:border-white/80"
          >
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/15 flex items-center justify-center">
                <User className="w-[18px] h-[18px] text-white" />
              </div>
            )}
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-2.5 w-64 max-w-[calc(100vw-2rem)] bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-800 animate-slide-down">
                <div className="p-4" style={{ background: accent.dropdownBg, borderBottom: `1px solid ${accent.dropdownBorder}` }}>
                  <p className={`font-bold text-sm truncate ${accent.dropdownText}`}>{user?.name}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${accent.dropdownLabel}`}>
                    {isAdmin ? 'Administrator' : isManager ? 'Manager' : `${user?.role} Profile`}
                  </p>
                </div>

                <div className="py-2">
                  {isAdmin ? (
                    <>
                      <Link
                        to="/admin/settings"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 ${accent.hoverText} transition`}
                      >
                        <Settings className="w-4 h-4" /> Platform Settings
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 ${accent.hoverText} transition`}
                      >
                        <ExternalLink className="w-4 h-4" /> View Website
                      </Link>
                    </>
                  ) : isManager ? (
                    <>
                      <Link
                        to="/manager/team"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 ${accent.hoverText} transition`}
                      >
                        <Users className="w-4 h-4" /> My Team
                      </Link>
                      <Link
                        to="/manager/commissions"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 ${accent.hoverText} transition`}
                      >
                        <Landmark className="w-4 h-4" /> Commissions
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 ${accent.hoverText} transition`}
                      >
                        <ExternalLink className="w-4 h-4" /> View Website
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/student/profile"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 ${accent.hoverText} transition`}
                      >
                        <User className="w-4 h-4" /> Edit Profile
                      </Link>
                      <Link
                        to="/student/wallet"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 ${accent.hoverText} transition`}
                      >
                        <Landmark className="w-4 h-4" /> Payout Details
                      </Link>
                      <Link
                        to="/student/kyc"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 ${accent.hoverText} transition`}
                      >
                        <UserCheck className="w-4 h-4" /> Verification (KYC)
                      </Link>
                      <Link
                        to="/student/nominee"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 ${accent.hoverText} transition`}
                      >
                        <HeartHandshake className="w-4 h-4" /> Nominee Info
                      </Link>
                    </>
                  )}
                </div>

                <div className="border-t border-slate-100 py-1 bg-slate-50/50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" /> Logout Account
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Hamburger — mobile sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all flex-shrink-0"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      </div>
    </header>
  );
}
