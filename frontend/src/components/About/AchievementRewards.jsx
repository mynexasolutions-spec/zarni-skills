import React from 'react';
import { Link } from 'react-router-dom';
import {
  Gift, TrendingUp, Trophy, Lock, Medal, Target, Sparkles, ArrowRight,
} from 'lucide-react';

const INTRO_FEATURES = [
  { title: 'Achieve', desc: 'Set your income goals and keep growing.', Icon: Gift },
  { title: 'Unlock', desc: 'Reach milestones and unlock exciting rewards.', Icon: TrendingUp },
  { title: 'Enjoy', desc: 'Get premium gifts that inspire and motivate you.', Icon: Trophy },
];

const MILESTONES = [
  { label: 'Mic & Tripod', img: '/static/img/reward-tripod.png' },
  { label: 'Smart Watch', img: '/static/img/reward-smartwatch.png' },
  { label: 'Smartphone', img: '/static/img/reward-phone.png', popular: true },
  { label: 'Laptop', img: '/static/img/reward-laptop.png' },
  { label: 'Office Chair', img: '/static/img/reward-chair.png' },
];

const PERKS = [
  { title: 'No Time Limit', desc: 'Achieve at your own pace.', Icon: Medal },
  { title: 'Set Goals', desc: 'Push your limits and grow more.', Icon: Target },
  { title: 'Get Rewarded', desc: 'Unlock premium gifts and more.', Icon: Gift },
  { title: 'Stay Motivated', desc: 'More income, more rewards.', Icon: TrendingUp },
];

export default function AchievementRewards() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-blue-50/40">

      {/* Background artwork (same as Support System section) */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-70" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>

      {/* Ambient glows */}
      <div className="absolute -top-10 -left-16 w-[420px] h-[420px] bg-blue-300/15 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-0 -right-16 w-[420px] h-[420px] bg-indigo-300/15 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* TOP: heading + photo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-20">

          {/* LEFT: copy */}
          <div className="text-center lg:text-left">
            <h2 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight leading-[0.95] mb-5">
              <span className="block bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">Achievement</span>
              <span className="block text-slate-900">Rewards</span>
            </h2>

            <div className="group/ribbon relative inline-flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs sm:text-sm font-black uppercase tracking-widest px-5 py-2.5 rounded-lg -rotate-1 shadow-lg shadow-slate-900/30 mb-6 overflow-hidden">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/ribbon:translate-x-full transition-transform duration-700"></span>
              <Sparkles className="w-3.5 h-3.5 text-primary-light shrink-0 relative" strokeWidth={2.5} />
              <span className="relative">Earn More, Achieve More!</span>
            </div>

            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-md mx-auto lg:mx-0 mb-8">
              Your hard work deserves the best rewards. Achieve your income milestones and{' '}
              <span className="text-primary font-bold">unlock exciting gifts</span> along the way!
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {INTRO_FEATURES.map((f, idx) => (
                <div key={idx} className="text-center lg:text-left">
                  <div className="w-11 h-11 mx-auto lg:mx-0 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary/30 mb-2">
                    <f.Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h3 className="text-xs font-black text-primary uppercase tracking-wide">{f.title}</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: photo */}
          <div className="relative flex items-center justify-center py-4">
            <div className="relative w-full max-w-[360px] aspect-[4/5]">
              <div className="absolute inset-[-10px] rounded-full border border-primary/10 pointer-events-none hidden sm:block"></div>
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-sky-100/70 via-blue-50/50 to-indigo-100/30 border border-white/80 shadow-[inset_0_0_60px_rgba(59,130,246,0.1),0_20px_80px_rgba(59,130,246,0.15)]"></div>
              <div className="absolute inset-0 z-10">
                <img
                  src="/static/img/achievement-man.png"
                  alt="Student celebrating a reward milestone"
                  className="w-full h-full object-contain drop-shadow-[0_25px_40px_rgba(43,128,240,0.2)]"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: journey / milestones */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3">
            <span className="hidden sm:block w-10 h-px bg-primary/30"></span>
            <h3 className="text-lg sm:text-xl font-black text-primary uppercase tracking-widest">Your Journey, Your Rewards</h3>
            <span className="hidden sm:block w-10 h-px bg-primary/30"></span>
          </div>
        </div>

        <div className="relative overflow-x-auto pt-9 pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="relative grid grid-cols-5 gap-3 sm:gap-4 min-w-[560px] sm:min-w-0">
            <div className="hidden sm:block absolute top-5 left-[10%] right-[10%] h-0 border-t-2 border-dashed border-primary/25"></div>

            {MILESTONES.map((m, idx) => (
              <div key={idx} className="relative flex flex-col items-center">
                {m.popular && (
                  <span className="absolute -top-7 bg-primary text-white text-[9px] font-black uppercase tracking-wide px-2.5 py-1 rounded-md shadow-md whitespace-nowrap">
                    Most Popular
                  </span>
                )}
                <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary/30 mb-3">
                  <Lock className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <div className={`w-full h-28 sm:h-32 md:h-36 rounded-2xl bg-white flex items-center justify-center p-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] ${m.popular ? 'border-2 border-primary' : 'border border-slate-100'}`}>
                  <img
                    src={m.img}
                    alt={m.label}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-2 text-center">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-primary/20 shadow-sm rounded-full px-4 py-2">
            <Lock className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={2.5} />
            <span className="text-xs font-bold text-slate-600">Complete Each Milestone To Unlock Your Reward</span>
          </div>
        </div>

        {/* PERKS strip */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 overflow-hidden mb-10">
          {PERKS.map((p, idx) => (
            <div key={idx} className="flex items-center gap-3 px-5 py-5 group hover:bg-slate-50 transition-colors duration-200">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <p.Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 leading-tight">{p.title}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA bar */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-6 py-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl shadow-slate-900/30">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/20 rounded-full blur-[70px] pointer-events-none"></div>
          <div className="relative flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-primary-light" strokeWidth={2} />
            </div>
            <div>
              <p className="text-white font-black text-sm sm:text-base uppercase tracking-wide">Your Success, Your Reward!</p>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">The more you achieve, the more you earn.</p>
            </div>
          </div>
          <Link
            to="/register"
            className="relative shrink-0 inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            Start Your Journey
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>

      </div>
    </section>
  );
}
