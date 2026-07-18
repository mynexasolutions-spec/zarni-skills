import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, PackageX } from 'lucide-react';
import api from '../../utils/api';
import PackageCard from '../../components/Packages/PackageCard';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await api.get('/global-data');
        setPackages(response.data.packages || []);
      } catch (err) {
        console.error('Error fetching packages catalog', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 overflow-hidden relative">

      {/* Hero Banner */}
      <section className="relative py-20 md:py-28 flex items-center justify-center overflow-hidden -mt-24 pt-44"
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% 0%, #eef6ff 0%, #f8faff 60%, #f8faff 100%)'
        }}>
        <div className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(43,128,240,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(43,128,240,0.05) 1px, transparent 1px)',
            backgroundSize: '44px 44px'
          }}>
        </div>
        <div className="absolute -top-16 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
        <div className="absolute -top-16 right-1/4 w-72 h-72 bg-indigo-300/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <div className="relative z-10 text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            <Package className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
            {packages.length}+ Premium Packages
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 tracking-tight leading-[1.1]">
            Choose Your <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">Learning Path</span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto mt-4">
            Curated skill bundles designed to accelerate your earning potential and career growth.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          {packages.length > 0 && (
            <div className="mb-10">
              <p className="text-slate-500 font-medium">Showing <span className="text-slate-900 font-bold">{packages.length}</span> package{packages.length !== 1 ? 's' : ''}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-12 pt-4">
            {packages.map((pkg, idx) => (
              <PackageCard key={pkg.id} pkg={pkg} index={idx} />
            ))}
          </div>

          {packages.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <PackageX className="h-10 w-10 text-slate-300" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No Packages Found</h3>
              <p className="text-slate-500 mb-6">We're currently updating our catalog. Please check back later!</p>
              <Link to="/" className="inline-block bg-gradient-to-r from-primary to-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20">
                Go Back Home
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
