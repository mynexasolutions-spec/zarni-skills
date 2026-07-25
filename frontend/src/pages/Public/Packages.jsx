import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, PackageX, Sparkles, ArrowRight, Zap, Trophy, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import PackageCard from '../../components/Packages/PackageCard';
import Reveal from '../../components/Reveal';
import { useAuth } from '../../context/AuthContext';

export default function Packages() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [ownedIds, setOwnedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await api.get('/global-data');
        setPackages(response.data.packages || []);
        if (user) {
          const ownedRes = await api.get('/student/purchased-packages');
          setOwnedIds(ownedRes.data.purchased_package_ids || []);
        }
      } catch (err) {
        console.error('Error fetching packages catalog', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unlocking Package Catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 overflow-hidden relative -mt-24 pt-24 pb-24">

      {/* Background Animated Spheres */}
      <div className="absolute top-[8%] left-[10%] w-[600px] h-[600px] bg-blue-400/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute top-[40%] right-[5%] w-[550px] h-[550px] bg-indigo-400/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDelay: '2.5s' }}></div>

      {/* Floating Animated Particles */}
      <span className="absolute top-32 left-[14%] w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-float pointer-events-none z-0"></span>
      <span className="absolute top-1/2 right-[10%] w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-float-delayed pointer-events-none z-0"></span>
      <span className="absolute bottom-1/4 left-[8%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-float pointer-events-none z-0"></span>

      {/* Tech Mesh Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '36px 36px' }}>
      </div>

      {/* Hero Banner Section */}
      <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 flex items-center justify-center z-10">
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          
          <Reveal variant="scale-in" duration={600}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600 animate-spin-slow" strokeWidth={2.5} />
              {packages.length}+ High-Income Skill Bundles
            </div>
          </Reveal>

          <Reveal variant="fade-up" delay={150}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black text-slate-900 tracking-tight leading-[1.15] mb-4">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">Learning Path</span>
            </h1>
          </Reveal>

          <Reveal variant="fade-up" delay={250}>
            <p className="text-slate-600 text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
              Curated skill bundles engineered to accelerate your earning potential, freelance career, and practical expertise.
            </p>
          </Reveal>

          {/* Quick Value Ribbon */}
          <Reveal variant="fade-up" delay={350}>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs font-bold shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                Lifetime Access Included
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs font-bold shadow-sm">
                <Trophy className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
                Verified Certification
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs font-bold shadow-sm">
                <Zap className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                High Affiliate Earnings
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Packages Grid Section */}
      <section className="relative z-10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {packages.length > 0 && (
            <div className="mb-8 flex items-center justify-between">
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                Showing <span className="text-slate-900 font-black">{packages.length}</span> Curated Packages
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
              <Reveal key={pkg.id} variant="fade-up" delay={idx * 120}>
                <PackageCard pkg={pkg} index={idx} owned={ownedIds.includes(pkg.id)} />
              </Reveal>
            ))}
          </div>

          {packages.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-slate-200/90 max-w-lg mx-auto">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <PackageX className="h-10 w-10 text-slate-300" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Packages Found</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">We're updating our package catalog. Check back shortly!</p>
              <Link to="/" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest shadow-md shadow-blue-500/25">
                Go Back Home <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

