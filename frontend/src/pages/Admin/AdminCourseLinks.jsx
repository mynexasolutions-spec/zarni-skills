import React, { useEffect, useState } from 'react';
import { Link2, Copy, Check, BookOpen } from 'lucide-react';
import api from '../../utils/api';

export default function AdminCourseLinks() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/course-links');
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyLink = (course) => {
    const fullLink = `${window.location.origin}${course.link_path}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedId(course.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="text-slate-800 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 shrink-0">
          <Link2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black">Course Link</h2>
          <p className="text-xs text-slate-400">Shareable signup links pre-filtered to a specific course.</p>
        </div>
      </div>

      <div className="space-y-3">
        {courses.map((c, idx) => {
          const fullLink = `${window.location.origin}${c.link_path}`;
          return (
            <div key={c.id} className="group bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all animate-fade-in-up flex items-center gap-4" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
              <span className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 truncate">{c.title}</p>
                <p className="text-xs text-slate-400 truncate">{fullLink}</p>
              </div>
              <button
                onClick={() => copyLink(c)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  copiedId === c.id ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                {copiedId === c.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === c.id ? 'Copied' : 'Copy'}
              </button>
            </div>
          );
        })}
        {courses.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
            No courses found. Add courses from the Courses page first.
          </div>
        )}
      </div>
    </div>
  );
}
