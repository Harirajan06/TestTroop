import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbStore, fetchContestsAsync } from '../lib/supabase';
import { Contest } from '../types';
import { 
  Trophy, 
  ArrowRight, 
  PlayCircle,
  Bug,
  BookOpen,
  Users,
  Code,
  Zap,
  Smartphone,
  Globe,
  Heart,
  FileText,
  UserCheck,
  ArrowUpRight
} from 'lucide-react';

const CARD_STYLES = [
  { color: 'from-cyan-500 to-blue-600' },
  { color: 'from-purple-500 to-indigo-600' },
  { color: 'from-pink-400 to-rose-500' },
];

const CONTEST_TYPE_LABEL: Record<string, string> = {
  mobile_app: 'Mobile Application',
  website: 'Website',
  web_app: 'Web Application',
  other: 'Other',
};

const CONTEST_TYPE_TAG: Record<string, string> = {
  mobile_app: 'Mobile',
  website: 'Web',
  web_app: 'Web',
  other: 'Other',
};

export const LandingPage: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>(() => dbStore.getContests());

  useEffect(() => {
    fetchContestsAsync().then(fetched => {
      setContests(fetched || []);
    });
  }, []);

  const liveContests = contests
    .filter(c => c.status === 'testing_live' || c.status === 'registration_open')
    .slice(0, 3);

  const displayContests = liveContests.map((c, idx) => ({
    id: c.id,
    title: c.title,
    type: CONTEST_TYPE_LABEL[c.contest_type] || 'Application',
    description: c.description,
    tag: CONTEST_TYPE_TAG[c.contest_type] || 'App',
    contestType: c.contest_type,
    color: CARD_STYLES[idx % CARD_STYLES.length].color,
  }));

  return (
    <div className="space-y-28 md:space-y-36 pb-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 pb-6 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Column */}
          <div className="space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#1b0d5d]/80 border border-purple-400/25 rounded-full px-4 py-1.5 text-xs font-semibold text-purple-200 shadow-lg shadow-purple-950/50 backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Real Products. Real Testing. Real Impact.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.08] font-heading">
              Break Software.<br />
              Build <span className="bg-gradient-to-r from-[#9B7BFF] via-[#C879FF] to-[#E0A7FF] bg-clip-text text-transparent">Better.</span>
            </h1>

            <p className="text-base sm:text-lg text-purple-200/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Join a community of software testers, discover meaningful bugs in real-world products, and help build a better digital world.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
              <Link 
                to="/contests" 
                className="btn w-full sm:w-auto text-sm sm:text-base px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#6D19FF] to-[#8B35FF] hover:from-[#7C2FFF] hover:to-[#9B4DFF] shadow-lg shadow-[#6D19FF]/40 hover:shadow-[#6D19FF]/60 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Explore Testing Contests</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>
              
              <button 
                type="button"
                className="btn w-full sm:w-auto text-sm sm:text-base px-6 py-3.5 rounded-xl font-semibold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 backdrop-blur-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5"
              >
                <PlayCircle className="w-4 h-4 text-white fill-white/20" />
                <span>Watch How It Works</span>
              </button>
            </div>

            {/* 3 Feature items under buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#230d72]/80 border border-purple-400/20 flex items-center justify-center text-purple-300 shrink-0 shadow-md">
                  <Code className="w-5 h-5 text-purple-200" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-snug">Real Products</div>
                  <div className="text-xs text-purple-300/70">Test live applications</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#230d72]/80 border border-purple-400/20 flex items-center justify-center text-purple-300 shrink-0 shadow-md">
                  <BookOpen className="w-5 h-5 text-purple-200" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-snug">Learn & Grow</div>
                  <div className="text-xs text-purple-300/70">Build your skills</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#230d72]/80 border border-purple-400/20 flex items-center justify-center text-purple-300 shrink-0 shadow-md">
                  <Users className="w-5 h-5 text-purple-200" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-snug">Supportive Community</div>
                  <div className="text-xs text-purple-300/70">Connect with testers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Graphic */}
          <div className="relative w-full flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[560px]">
              <img 
                src="/Hero.png" 
                alt="The Test Troop Platform Visual" 
                className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_20px_50px_rgba(109,25,255,0.3)] animate-subtle-float" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE CONTESTS SECTION */}
      <section className="container mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#230d72]/80 border border-purple-400/30 rounded-full px-3.5 py-1 text-xs font-semibold text-purple-200 shadow-md">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="uppercase tracking-wider text-[11px]">Live Contests</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-heading tracking-tight">
              Real Applications. Real Challenges.
            </h2>
            <p className="text-sm sm:text-base text-purple-200/70 max-w-xl leading-relaxed">
              Test live products from startups to enterprises. Find bugs, submit reports, and earn rewards.
            </p>
          </div>

          <Link
            to="/contests"
            className="btn text-sm font-bold px-6 py-3 rounded-xl text-white bg-gradient-to-r from-[#6D19FF] to-[#8B35FF] hover:from-[#7C2FFF] hover:to-[#9B4DFF] shadow-lg shadow-[#6D19FF]/30 hover:shadow-[#6D19FF]/50 flex items-center gap-2 self-start sm:self-auto shrink-0 transition-all"
          >
            <span>View All Contests ({contests.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Contests Grid */}
        {displayContests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {displayContests.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl p-6 bg-[#160c54]/70 hover:bg-[#1a0e60]/90 border border-purple-500/20 hover:border-purple-400/40 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between shadow-xl shadow-black/20 hover:-translate-y-1 group"
              >
                <div className="space-y-5">
                  {/* App Icon + Title */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                      {item.contestType === 'mobile_app' && <Smartphone className="w-6 h-6" />}
                      {(item.contestType === 'website' || item.contestType === 'web_app') && <Globe className="w-6 h-6" />}
                      {item.contestType === 'other' && <Heart className="w-6 h-6 fill-white/30" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-purple-200 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-purple-300/70 font-medium">
                        {item.type}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Card Footer: Tag and View Contest Button */}
                <div className="pt-6 mt-6 border-t border-purple-500/15 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#230d72]/80 text-purple-300 border border-purple-400/20">
                    {item.tag}
                  </span>

                  <Link
                    to={`/contests/${item.id}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/90 hover:text-white bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 px-3.5 py-1.5 rounded-lg transition-colors group-hover:border-purple-400/40"
                  >
                    <span>View Contest</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-10 bg-[#160c54]/70 border border-purple-500/20 text-center space-y-2">
            <Trophy className="w-10 h-10 text-purple-300 mx-auto" />
            <h3 className="text-white font-bold">No Live Contests Right Now</h3>
            <p className="text-sm text-purple-200/70">New testing contests are added regularly — check back soon.</p>
          </div>
        )}
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="container mx-auto px-4 sm:px-6 text-center space-y-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#230d72]/80 border border-purple-400/30 rounded-full px-3.5 py-1 text-xs font-semibold text-purple-200 shadow-md">
            <Zap className="w-3.5 h-3.5 text-purple-300" />
            <span className="uppercase tracking-wider text-[11px]">How It Works</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-heading tracking-tight">
            From Testing to Impact — In 4 Simple Steps.
          </h2>
          <p className="text-sm sm:text-base text-purple-200/70 max-w-xl mx-auto leading-relaxed">
            Get started and make a difference in just a few steps.
          </p>
        </div>

        {/* 4 Steps Process */}
        <div className="relative pt-6 max-w-5xl mx-auto">
          {/* Subtle Connecting Line on Desktop */}
          <div className="hidden lg:block absolute top-[62px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-[#6D19FF]/40 via-purple-400/50 to-[#6D19FF]/40 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-3.5 group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#6D19FF] to-[#390d96] p-[2px] shadow-lg shadow-[#6D19FF]/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-[#18085b] flex items-center justify-center text-white">
                  <UserCheck className="w-7 h-7 text-purple-200" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mt-1">1. Join</h3>
              <p className="text-xs sm:text-sm text-purple-200/70 max-w-[210px] leading-relaxed">
                Create your free account and join the community.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-3.5 group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#6D19FF] to-[#390d96] p-[2px] shadow-lg shadow-[#6D19FF]/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-[#18085b] flex items-center justify-center text-white">
                  <FileText className="w-7 h-7 text-purple-200" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mt-1">2. Choose a Contest</h3>
              <p className="text-xs sm:text-sm text-purple-200/70 max-w-[210px] leading-relaxed">
                Pick from active testing contests.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-3.5 group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#6D19FF] to-[#390d96] p-[2px] shadow-lg shadow-[#6D19FF]/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-[#18085b] flex items-center justify-center text-white">
                  <Bug className="w-7 h-7 text-purple-200" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mt-1">3. Find & Report</h3>
              <p className="text-xs sm:text-sm text-purple-200/70 max-w-[210px] leading-relaxed">
                Test, find bugs, and submit detailed reports.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center space-y-3.5 group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#6D19FF] to-[#390d96] p-[2px] shadow-lg shadow-[#6D19FF]/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-[#18085b] flex items-center justify-center text-white">
                  <Trophy className="w-7 h-7 text-purple-200" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mt-1">4. Earn Rewards</h3>
              <p className="text-xs sm:text-sm text-purple-200/70 max-w-[210px] leading-relaxed">
                Get recognized and win exciting rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BOTTOM CTA BANNER SECTION */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl p-8 sm:p-12 lg:p-14 border border-purple-500/30 bg-gradient-to-br from-[#1b0d5d]/85 via-[#15094d]/90 to-[#0e0735] overflow-hidden shadow-2xl shadow-purple-950/70 backdrop-blur-2xl">
          {/* Subtle Ambient Radial Glow Inside Card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#6D19FF]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-purple-900/50 border border-purple-400/30 rounded-full px-3.5 py-1 text-xs font-semibold text-purple-200">
                <Zap className="w-3.5 h-3.5 text-purple-300" />
                <span className="uppercase tracking-wider text-[10px]">Be Part of Something Big</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-heading leading-tight tracking-tight">
                Make Software Better.<br />
                <span className="bg-gradient-to-r from-[#9B7BFF] via-[#C879FF] to-[#E0A7FF] bg-clip-text text-transparent">
                  One Bug at a Time.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-purple-200/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Join The Test Troop and help build a safer, better, and more reliable digital world.
              </p>

              <div className="pt-2">
                <Link 
                  to="/contests" 
                  className="btn text-sm sm:text-base font-bold px-7 py-3.5 rounded-xl text-white bg-gradient-to-r from-[#6D19FF] to-[#8B35FF] hover:from-[#7C2FFF] hover:to-[#9B4DFF] shadow-lg shadow-[#6D19FF]/40 hover:shadow-[#6D19FF]/60 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
                >
                  <span>Join The Test Troop</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Graphic: Timeline & Watermark */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end gap-6 sm:gap-10">
              {/* Vertical Step Timeline */}
              <div className="relative pl-6 space-y-4 text-left">
                {/* Connecting vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-purple-400/80 via-purple-500/40 to-purple-600/80" />

                <div className="flex items-center gap-3 relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#9B7BFF] ring-4 ring-[#6D19FF]/30 -ml-[23px] shrink-0" />
                  <span className="text-sm font-semibold text-white">Test</span>
                </div>

                <div className="flex items-center gap-3 relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#9B7BFF] ring-4 ring-[#6D19FF]/30 -ml-[23px] shrink-0" />
                  <span className="text-sm font-semibold text-white">Report</span>
                </div>

                <div className="flex items-center gap-3 relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#9B7BFF] ring-4 ring-[#6D19FF]/30 -ml-[23px] shrink-0" />
                  <span className="text-sm font-semibold text-white">Improve</span>
                </div>

                <div className="flex items-center gap-3 relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#9B7BFF] ring-4 ring-[#6D19FF]/30 -ml-[23px] shrink-0" />
                  <span className="text-sm font-semibold text-white">Repeat</span>
                </div>
              </div>

              {/* Elevated Box with Arrow & Watermark */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#2b107d]/90 border border-purple-400/30 flex items-center justify-center text-purple-200 shadow-xl shadow-purple-950/60 hover:scale-105 transition-transform">
                  <ArrowUpRight className="w-7 h-7 text-purple-200" />
                </div>
                
                <div className="text-[11px] font-semibold text-purple-300/40 tracking-wider text-right leading-tight select-none">
                  Better<br />
                  Software<br />
                  Brighter<br />
                  Tomorrow
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-subtle-float {
          animation: subtle-float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
