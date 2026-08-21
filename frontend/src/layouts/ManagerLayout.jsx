import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/Student/DashboardSidebar';
import DashboardHeader from '../components/Student/DashboardHeader';

export default function ManagerLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-transparent">
      {/* Ambient background glow — same blue theme used across the public site */}
      <div className="fixed top-20 right-[8%] w-96 h-96 bg-blue-300/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="fixed bottom-10 left-[6%] w-96 h-96 bg-indigo-300/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Top Header */}
      <DashboardHeader onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      <div className="flex flex-1 min-h-0">
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar — sliding overlay drawer on mobile, static column on desktop */}
        <div className={`fixed left-0 top-16 bottom-0 z-40 transition-transform duration-300 ease-out lg:static lg:top-0 lg:z-0 lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <DashboardSidebar onNavigate={() => setMobileSidebarOpen(false)} />
        </div>

        {/* Main Content Area — owns its own scroll region */}
        <main className="flex-grow min-h-0 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 overflow-y-auto overflow-x-hidden manager-scrollbar w-full">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
