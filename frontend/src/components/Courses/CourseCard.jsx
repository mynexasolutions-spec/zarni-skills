import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BadgeCheck, Heart, Clock, List, ArrowRight } from 'lucide-react';

export default function CourseCard({ course, index = 0 }) {
  const coursePrices = (course.packages || [])
    .filter(p => p.is_active)
    .map(p => p.price);
  const minPrice = coursePrices.length ? Math.min(...coursePrices) : null;

  return (
    <div className="group relative flex flex-col h-full" style={{ transitionDelay: `${(index % 4) * 0.1}s` }}>
      <div className="relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] group-hover:shadow-[0_24px_60px_-12px_rgba(43,128,240,0.2)] group-hover:-translate-y-1.5 transition-[transform,box-shadow] duration-500 z-10">

        {/* Thumbnail */}
        <div className="aspect-video relative overflow-hidden shrink-0 bg-gradient-to-br from-primary/10 to-indigo-100/50">
          {course.thumbnail_display_url ? (
            <img src={course.thumbnail_display_url} alt={course.title}
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-primary/40" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          <div className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase tracking-widest shadow-sm">
            {course.level || 'All Levels'}
          </div>
          {course.certificate && (
            <div className="absolute top-3.5 right-3.5 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg" title="Certificate on completion">
              <BadgeCheck className="w-4 h-4" strokeWidth={2.5} />
            </div>
          )}
          {minPrice !== null && (
            <div className="absolute bottom-3.5 left-3.5 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
              From ₹{Number(minPrice).toLocaleString()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Heart className="w-3 h-3 shrink-0" strokeWidth={2.5} />
              {course.language || 'Hindi'}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Clock className="w-3 h-3 shrink-0" strokeWidth={2.5} />
              {course.course_duration || 'Lifetime'}
            </span>
            {course.lesson_count > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <List className="w-3 h-3 shrink-0" strokeWidth={2.5} />
                  {course.lesson_count} lesson{course.lesson_count !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>

          <h3 className="text-lg font-heading font-black text-slate-900 mb-4 tracking-tight leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {course.title}
          </h3>

          <div className="mt-auto">
            <Link to={`/courses/${course.id}`}
              className="group/btn relative w-full bg-slate-50 border-2 border-slate-100 hover:border-primary hover:bg-primary/5 text-slate-700 hover:text-primary py-3 px-5 rounded-xl font-black text-xs inline-flex items-center justify-center gap-2 text-center transition-colors duration-300 uppercase tracking-widest">
              View Curriculum
              <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5" strokeWidth={3} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
