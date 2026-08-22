import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, User, UserCircle, Pencil, LogOut, Landmark, UserCheck, UserCog, Zap, ShoppingBag, DollarSign, UserPlus, ArrowDown, Home, LayoutDashboard, BookOpen, Settings, Users, ExternalLink } from 'lucide-react';
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
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/student/notifications');
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

  const handleNotificationClick = async (notif) => {
    if (notif.is_read) return;
    setNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, is_read: true } : n)));
    try {
      await api.post(`/student/notifications/${notif.id}/read`);
    } catch (err) {
      console.error('Failed to mark notification read', err);
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
      className="h-16 flex-shrink-0 flex items-center gap-4 px-4 sm:px-6 sticky top-0 z-[60] animate-gradient-x"
      style={{
        background: isAdmin
          ? 'linear-gradient(115deg, #1c0b14 0%, #7f1d1d 30%, #dc2626 55%, #7f1d1d 80%, #1c0b14 100%)'
          : isManager
          ? 'linear-gradient(115deg, #1e1b4b 0%, #4c1d95 30%, #7c3aed 55%, #4c1d95 80%, #1e1b4b 100%)'
          : 'linear-gradient(115deg, #1e3a8a 0%, #1e40af 30%, #2563eb 55%, #1e40af 80%, #1e3a8a 100%)',
        boxShadow: isAdmin ? '0 2px 12px rgba(190, 18, 60, 0.25)' : isManager ? '0 2px 12px rgba(124, 58, 237, 0.25)' : '0 2px 12px rgba(30, 64, 175, 0.25)'
      }}
    >
      {/* Ambient texture */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
      <div className="absolute -top-10 right-24 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

      {/* Left: logo */}
      <div className="relative flex items-center gap-3 flex-shrink-0">
        {/* No plate behind the logo — it sits straight on the header gradient so
            the bar reads as one unbroken colour. The PNG is transparent and its
            artwork is dark blue, so it's knocked out to solid white to stay
            readable on the dark gradient (same treatment the footer uses). */}
        <Link
          to="/"
          className="relative flex items-center transition-transform hover:-translate-y-0.5"
        >
          <img
            src="/static/img/zarni-logo.png"
            alt="Zarni Skills"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            className="h-9 sm:h-10 w-auto object-contain brightness-0 invert"
          />
          <span className="hidden items-center font-black text-white text-sm">ZS</span>
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
      <div className="relative ml-auto flex items-center gap-3">

        {/* Nav pill */}
        <div className="hidden sm:flex items-center gap-0.5 bg-white/10 p-1 rounded-xl flex-shrink-0">
          {navLinks.map((link) => {
            const active = link.match(location.pathname);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] text-[0.82rem] font-semibold whitespace-nowrap transition-all ${
                  active ? `bg-white ${accent.text} shadow-[0_2px_8px_rgba(0,0,0,0.15)]` : 'text-white/85 hover:bg-white/15 hover:text-white'
                }`}
              >
                <link.icon className="w-[15px] h-[15px]" strokeWidth={2} />
                {link.label}
                {active && <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${accent.text.replace('text-', 'bg-')} animate-pulse`}></span>}
              </Link>
            );
          })}
        </div>

        {/* Notifications Bell Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
              className="group w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center relative transition-all hover:-translate-y-0.5"
            >
              <Bell className="w-5 h-5 text-white transition-transform duration-300 group-hover:-rotate-12" />
              {unreadCount > 0 && (
                <>
                  <span className={`absolute top-1 right-1 w-4 h-4 rounded-full animate-ping bg-red-400 border-2 ${accent.badgeBorder}`}></span>
                  <span className={`absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center border-2 ${accent.badgeBorder} text-white`}>
                    {unreadCount}
                  </span>
                </>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)}></div>
                <div className="fixed md:absolute top-16 md:top-auto left-4 md:left-auto right-4 md:right-0 mt-3.5 w-auto md:w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-800 animate-slide-down">
                  <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Notifications</span>
                    <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-blue-600 hover:underline">Mark all read</button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 ${!n.is_read ? 'bg-blue-50/30 cursor-pointer' : ''}`}
                      >
                        <div className="shrink-0 mt-0.5">{getNotifIcon(n.type)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                            {!n.is_read && <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                          </div>
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
            className="relative w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden transition-all hover:border-white/80 hover:-translate-y-0.5"
          >
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/15 flex items-center justify-center">
                <User className="w-[18px] h-[18px] text-white" />
              </div>
            )}
          </button>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-current shadow-[0_0_6px_rgba(52,211,153,0.8)] pointer-events-none" style={{ borderColor: isAdmin ? '#7f1d1d' : isManager ? '#4c1d95' : '#1e40af' }}></span>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-2.5 w-72 max-w-[calc(100vw-2rem)] bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-800 animate-slide-down">
                <div className="relative p-4 flex items-center gap-3 overflow-hidden" style={{ background: accent.dropdownBg, borderBottom: `1px solid ${accent.dropdownBorder}` }}>
                  <span className="absolute inset-0 animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"></span>
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-md bg-white flex items-center justify-center">
                      {user?.profile_image_url ? (
                        <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className={`w-5 h-5 ${accent.dropdownLabel}`} />
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-[0_0_4px_rgba(52,211,153,0.8)]"></span>
                  </div>
                  <div className="relative min-w-0">
                    <p className={`font-bold text-sm truncate ${accent.dropdownText}`}>{user?.name}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${accent.dropdownLabel}`}>
                      {isAdmin ? 'Administrator' : isManager ? 'Manager' : `${user?.role} Profile`}
                    </p>
                  </div>
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
                      {[
                        { label: 'My Profile', icon: UserCircle, path: '/student/profile', color: 'text-blue-600 bg-blue-50' },
                        { label: 'Edit Profile', icon: Pencil, path: '/student/profile', color: 'text-indigo-600 bg-indigo-50' },
                        { label: 'Edit KYC', icon: UserCheck, path: '/student/kyc', color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'My Course', icon: BookOpen, path: '/student/courses', color: 'text-amber-600 bg-amber-50' },
                        { label: 'Upgrade Panel', icon: Zap, path: '/student/upgrade', color: 'text-purple-600 bg-purple-50' },
                        ...(user?.role === 'manager' ? [{ label: 'Manager Panel', icon: UserCog, path: '/manager', color: 'text-violet-600 bg-violet-50' }] : []),
                        { label: 'Product Buy', icon: ShoppingBag, path: '/student/packages', color: 'text-rose-600 bg-rose-50' },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          to={item.path}
                          onClick={() => setDropdownOpen(false)}
                          className="group flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all hover:translate-x-0.5"
                        >
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${item.color}`}>
                            <item.icon className="w-3.5 h-3.5" />
                          </span>
                          {item.label}
                        </Link>
                      ))}
                    </>
                  )}
                </div>

                <div className="border-t border-slate-100 py-1 bg-slate-50/50">
                  <button
                    onClick={handleLogout}
                    className="group w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-all"
                  >
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-red-50 text-red-600 transition-transform duration-200 group-hover:scale-110">
                      <LogOut className="w-3.5 h-3.5" />
                    </span>
                    Logout Account
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
