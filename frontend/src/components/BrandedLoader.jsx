import React from 'react';

export default function BrandedLoader() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
      {/* Subtle light mode ambient highlights */}
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative flex items-center justify-center">
        {/* Glowing concentric spinner rings */}
        <div className="absolute w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <div className="absolute w-20 h-20 rounded-full border-4 border-indigo-500/10 border-b-indigo-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        
        {/* Core Zarni logo container */}
        <div className="w-14 h-14 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 z-10 animate-pulse">
          <span className="text-white font-black text-lg tracking-tight select-none">ZS</span>
        </div>
      </div>
      
      <p className="text-slate-800 text-xs font-black uppercase tracking-[0.25em] mt-6 animate-pulse">Zarni Skills Loading...</p>
    </div>
  );
}
