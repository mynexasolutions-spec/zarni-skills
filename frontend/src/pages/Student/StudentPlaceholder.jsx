import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Compass, HeartHandshake, HelpCircle, GraduationCap, Wrench, Users2, Megaphone, ArrowUpCircle, Tag, Clock, ArrowLeft, BookOpen } from 'lucide-react';

const META = {
  achievements: {
    title: "My Achievements",
    desc: "Unlock rank badges, milestones, and reward bonuses as you complete courses and refer students.",
    icon: Award, grad: 'from-amber-400 to-orange-500',
  },
  certificates: {
    title: "My Certificates",
    desc: "Download verified completion certificates for your completed skill packages.",
    icon: Award, grad: 'from-emerald-400 to-teal-600',
  },
  trip: {
    title: "Trip Achievements",
    desc: "Track your progress towards the next Zarni travel reward destination program.",
    icon: Compass, grad: 'from-sky-400 to-blue-600',
  },
  nominee: {
    title: "Nominee Details",
    desc: "Add nomination details for estate planning on your active affiliate account balances.",
    icon: HeartHandshake, grad: 'from-indigo-400 to-violet-600',
  },
  support: {
    title: "Support System",
    desc: "Create support tickets for questions regarding payouts, billing, or courses.",
    icon: HelpCircle, grad: 'from-blue-400 to-indigo-600',
  },
  trainings: {
    title: "Trainings & Webinars",
    desc: "Live weekly webinar details, onboarding walkthroughs, and recorded workshops.",
    icon: GraduationCap, grad: 'from-amber-400 to-amber-600',
  },
  tools: {
    title: "Affiliate Tools",
    desc: "Access banners, swipe copy, and promotional assets for high-converting marketing campaigns.",
    icon: Wrench, grad: 'from-violet-400 to-indigo-600',
  },
  community: {
    title: "Community Rooms",
    desc: "Join active Telegram, Discord, and Facebook rooms with fellow learners once they're live.",
    icon: Users2, grad: 'from-emerald-400 to-green-600',
  },
  marketing: {
    title: "Marketing Panel",
    desc: "Lead capture sheets, referral tracker links, and custom banner layouts.",
    icon: Megaphone, grad: 'from-blue-400 to-primary',
  },
  upgrade: {
    title: "Upgrade Package",
    desc: "Unlock premium courses, direct affiliate tiers, and private community rooms.",
    icon: ArrowUpCircle, grad: 'from-amber-400 to-orange-600',
  },
  offers: {
    title: "Affiliate Offers",
    desc: "Promotional campaigns, course package discounts, and seasonal referral bonuses.",
    icon: Tag, grad: 'from-primary to-indigo-600',
  },
  freelancing: {
    title: "Freelance Portal",
    desc: "Browse freelance gigs posted by the community and apply directly through the platform.",
    icon: Award, grad: 'from-teal-400 to-cyan-600',
  },
};

export default function StudentPlaceholder({ section }) {
  const navigate = useNavigate();
  const item = META[section] || {
    title: "Coming Soon",
    desc: "This section of your student hub is being built. Check back soon.",
    icon: Award, grad: 'from-primary to-indigo-600',
  };
  const Icon = item.icon;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-slate-800">
      <div className="relative overflow-hidden bg-white border border-slate-100 rounded-[2rem] p-8 sm:p-12 text-center shadow-sm">
        {/* decorative glow */}
        <div className={`absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br ${item.grad} opacity-[0.08] blur-2xl pointer-events-none`}></div>
        <div className={`absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-gradient-to-br ${item.grad} opacity-[0.06] blur-2xl pointer-events-none`}></div>

        <div className="relative z-10">
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.grad} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            <Icon className="w-9 h-9 text-white" strokeWidth={1.8} />
          </div>

          <h2 className="text-2xl font-black mb-3">{item.title}</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed mb-7">{item.desc}</p>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200 mb-8">
            <Clock className="w-3 h-3" /> Coming Soon
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/student')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/student/courses')}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 hover:border-primary hover:text-primary rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
            >
              <BookOpen className="w-4 h-4" /> Browse Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
