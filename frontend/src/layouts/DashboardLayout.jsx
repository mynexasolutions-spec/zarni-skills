import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/Student/DashboardSidebar';
import DashboardHeader from '../components/Student/DashboardHeader';

export default function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Ambient background glow — subtle, sits behind all dashboard pages */}
      <div className="fixed top-20 right-[8%] w-96 h-96 bg-primary/[0.04] rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 left-[6%] w-96 h-96 bg-indigo-400/[0.04] rounded-full blur-[140px] pointer-events-none -z-10"></div>

      {/* Top Dashboard Header */}
      <DashboardHeader onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      <div className="flex flex-1 min-h-0">
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar — overlay drawer on mobile, static column on desktop */}
        <div className={`${mobileSidebarOpen ? 'fixed left-0 top-16 bottom-0 z-40' : 'hidden'} lg:block`}>
          <DashboardSidebar onNavigate={() => setMobileSidebarOpen(false)} />
        </div>

        {/* Main Content Area — owns its own scroll region */}
        <main className="flex-grow min-h-0 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 overflow-y-auto overflow-x-hidden student-scrollbar w-full">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
