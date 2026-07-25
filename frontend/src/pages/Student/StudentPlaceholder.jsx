import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Compass, HeartHandshake, HelpCircle, GraduationCap, Wrench, Users2, Megaphone, ArrowUpCircle, Tag, ArrowLeft, BookOpen, Sparkles, Hammer, Bell } from 'lucide-react';

const META = {
  achievements: {
    title: "My Achievements",
    desc: "Unlock rank badges, milestones, and reward bonuses as you complete courses and refer students.",
    icon: Award, grad: 'from-amber-400 to-orange-500',
    teasers: ['Rank badges & milestones', 'Referral reward bonuses', 'Progress tracking'],
  },
  certificates: {
    title: "My Certificates",
    desc: "Download verified completion certificates for your completed skill packages.",
    icon: Award, grad: 'from-emerald-400 to-teal-600',
    teasers: ['Verified completion certificates', 'Downloadable PDF copies', 'Shareable credentials'],
  },
  trip: {
    title: "Trip Achievements",
    desc: "Track your progress towards the next Zarni travel reward destination program.",
    icon: Compass, grad: 'from-sky-400 to-blue-600',
    teasers: ['Travel reward milestones', 'Destination unlock progress', 'Trip eligibility tracker'],
  },
  nominee: {
    title: "Nominee Details",
    desc: "Add nomination details for estate planning on your active affiliate account balances.",
    icon: HeartHandshake, grad: 'from-indigo-400 to-violet-600',
    teasers: ['Add & update nominee info', 'Secure account succession', 'Editable anytime'],
  },
  support: {
    title: "Support System",
    desc: "Create support tickets for questions regarding payouts, billing, or courses.",
    icon: HelpCircle, grad: 'from-blue-400 to-indigo-600',
    teasers: ['Raise & track support tickets', 'Payout & billing help', 'Direct course queries'],
  },
  trainings: {
    title: "Trainings & Webinars",
    desc: "Live weekly webinar details, onboarding walkthroughs, and recorded workshops.",
    icon: GraduationCap, grad: 'from-amber-400 to-amber-600',
    teasers: ['Weekly live webinars', 'Onboarding walkthroughs', 'Recorded workshop library'],
  },
  tools: {
    title: "Affiliate Tools",
    desc: "Access banners, swipe copy, and promotional assets for high-converting marketing campaigns.",
    icon: Wrench, grad: 'from-violet-400 to-indigo-600',
    teasers: ['Ready-made banners', 'Swipe copy & captions', 'Promotional asset packs'],
  },
  community: {
    title: "Community Rooms",
    desc: "Join active Telegram, Discord, and Facebook rooms with fellow learners once they're live.",
    icon: Users2, grad: 'from-emerald-400 to-green-600',
    teasers: ['Telegram & Discord rooms', 'Peer learning groups', 'Live community events'],
  },
  marketing: {
    title: "Marketing Panel",
    desc: "Lead capture sheets, referral tracker links, and custom banner layouts.",
    icon: Megaphone, grad: 'from-blue-400 to-primary',
    teasers: ['Lead capture sheets', 'Referral tracker links', 'Custom banner layouts'],
  },
  upgrade: {
    title: "Upgrade Package",
    desc: "Unlock premium courses, direct affiliate tiers, and private community rooms.",
    icon: ArrowUpCircle, grad: 'from-amber-400 to-orange-600',
    teasers: ['Premium course access', 'Higher affiliate tiers', 'Private community rooms'],
  },
  offers: {
    title: "Affiliate Offers",
    desc: "Promotional campaigns, course package discounts, and seasonal referral bonuses.",
    icon: Tag, grad: 'from-primary to-indigo-600',
    teasers: ['Seasonal promo campaigns', 'Package discount codes', 'Bonus referral offers'],
  },
  freelancing: {
    title: "Freelance Portal",
    desc: "Browse freelance gigs posted by the community and apply directly through the platform.",
    icon: Award, grad: 'from-teal-400 to-cyan-600',
    teasers: ['Community-posted gigs', 'Direct in-app applications', 'Skill-matched listings'],
  },
};

export default function StudentPlaceholder({ section }) {
  const navigate = useNavigate();
  const item = META[section] || {
    title: "Coming Soon",
    desc: "This section of your student hub is being built. Check back soon.",
    icon: Award, grad: 'from-primary to-indigo-600',
    teasers: [],
  };
  const Icon = item.icon;

  return (
    <div className="w-full space-y-6 sm:space-y-8 text-slate-800 animate-fade-in-up">
      <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-12 text-center shadow-sm border border-slate-100 bg-white animate-scale-in">

        {/* decorative layers */}
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px', maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)'
        }}></div>
        <div className={`absolute -top-20 -right-16 w-64 h-64 rounded-full bg-gradient-to-br ${item.grad} opacity-[0.12] blur-[90px] pointer-events-none animate-blob`}></div>
        <div className={`absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-gradient-to-br ${item.grad} opacity-[0.08] blur-[90px] pointer-events-none animate-blob`} style={{ animationDelay: '2.5s' }}></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-7">
            <span className="relative flex w-1.5 h-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-amber-500"></span>
            </span>
            <Hammer className="w-3 h-3" /> Under Construction · Coming Soon Feature
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className={`absolute -inset-2 rounded-3xl bg-gradient-to-br ${item.grad} opacity-25 blur-lg`}></div>
            <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${item.grad} flex items-center justify-center shadow-lg animate-float`}>
              <Icon className="w-9 h-9 text-white" strokeWidth={1.8} />
            </div>
            <span className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md ring-1 ring-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">{item.title}</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed mb-7">{item.desc}</p>

          {item.teasers?.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-9">
              {item.teasers.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600"
                >
                  <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${item.grad} shrink-0`}></span>
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">
            <Bell className="w-3 h-3" />
            We'll notify you the moment this goes live
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/student')}
              className="group relative overflow-hidden inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-lg"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent"></span>
              <ArrowLeft className="relative w-4 h-4" /> <span className="relative">Back to Dashboard</span>
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
