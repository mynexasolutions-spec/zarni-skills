import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { GraduationCap, Search } from 'lucide-react';
import api from '../../utils/api';
import CourseCard from '../../components/Courses/CourseCard';

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [packages, setPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedPkg, setSelectedPkg] = useState(searchParams.get('package_id') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoursesData = async () => {
      setLoading(true);
      try {
        const query = searchParams.get('q') || '';
        const pkgId = searchParams.get('package_id') || '';

        const response = await api.get('/courses', {
          params: { q: query, package_id: pkgId }
        });
        setCourses(response.data.courses || []);
        setPackages(response.data.packages || []);
      } catch (err) {
        console.error('Error fetching courses list', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoursesData();
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedPkg) params.package_id = selectedPkg;
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedPkg('');
    setSearchParams({});
  };

  const query = searchParams.get('q');

  return (
    <div className="min-h-screen text-slate-800 overflow-hidden relative">

      {/* Page Banner */}
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
            <GraduationCap className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
            {courses.length}+ Courses Available
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 tracking-tight leading-[1.1]">
            Explore Our <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">Master</span> Courses
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed max-w-xl mx-auto mt-4">
            Master high-demand skills with our expert-led video courses, built for real career and income results.
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="py-6 bg-white border-b border-slate-100 sticky top-[84px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-stretch gap-3">

            {/* Search Box */}
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Search skills, e.g. Sales, Ads, Design..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition font-medium"
              />
            </div>

            {/* Package Dropdown */}
            <div className="lg:w-64">
              <select
                value={selectedPkg}
                onChange={(e) => setSelectedPkg(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50/60 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition font-medium cursor-pointer"
              >
                <option value="">All Packages</option>
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button type="submit" className="group relative flex-grow lg:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 uppercase tracking-wider overflow-hidden">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                Apply
              </button>
              {(searchParams.get('q') || searchParams.get('package_id')) && (
                <button type="button" onClick={handleReset} className="bg-slate-100 hover:bg-slate-200 text-slate-500 px-5 py-3 rounded-xl font-bold text-sm transition-all uppercase tracking-wider">
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          {query ? (
            <div className="mb-10 flex items-center gap-2 flex-wrap">
              <p className="text-slate-500 font-medium">Search results for:</p>
              <span className="bg-primary/10 text-primary px-4 py-1 rounded-full font-bold">"{query}"</span>
              <span className="text-slate-400 text-sm font-medium">({courses.length} found)</span>
            </div>
          ) : courses.length > 0 && (
            <div className="mb-10">
              <p className="text-slate-500 font-medium">Showing <span className="text-slate-900 font-bold">{courses.length}</span> course{courses.length !== 1 ? 's' : ''}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="rounded-3xl bg-white border border-slate-100 overflow-hidden animate-pulse">
                  <div className="aspect-video bg-slate-200"></div>
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="h-2.5 w-24 bg-slate-100 rounded-full"></div>
                    <div className="h-4 w-3/4 bg-slate-200 rounded-full"></div>
                    <div className="h-4 w-1/2 bg-slate-200 rounded-full"></div>
                    <div className="h-10 w-full bg-slate-100 rounded-xl mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {courses.map((course, idx) => (
                <CourseCard key={course.id} course={course} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-slate-300" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No Courses Found</h3>
              <p className="text-slate-500">We couldn't find any courses matching your search query. Try something else!</p>
              <Link to="/courses" className="inline-block mt-8 bg-gradient-to-r from-primary to-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20">
                Browse All Courses
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
