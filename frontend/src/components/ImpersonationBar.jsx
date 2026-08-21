import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Sticky bar shown only while an admin is signed in as another user, so it's
 * always obvious whose account is on screen and there's a one-click way back.
 */
export default function ImpersonationBar() {
  const { impersonating, user, stopImpersonating } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  if (!impersonating) return null;

  const handleReturn = async () => {
    setLeaving(true);
    try {
      const res = await stopImpersonating();
      if (res.success) {
        navigate('/admin/users');
      } else {
        alert(res.message || 'Could not return to your admin account.');
        navigate('/login');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not return to your admin account.');
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="sticky top-0 z-[200] bg-amber-500 text-slate-900 px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-bold shadow-md">
      <span className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0" strokeWidth={2.5} />
        You are viewing as <strong className="font-black">{user?.name || 'this user'}</strong>
        <span className="hidden sm:inline">— signed in by {impersonating.admin_name}</span>
      </span>
      <button
        onClick={handleReturn}
        disabled={leaving}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-60"
      >
        {leaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
        Return to Admin
      </button>
    </div>
  );
}
