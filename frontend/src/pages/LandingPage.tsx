import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hackathon } from '../types';
import { hackathonApi } from '../services/api';
import { HackathonCard } from '../components/HackathonCard';
import {
  Sparkles,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Code2,
  Users2,
  CheckCircle2,
  Compass,
  Building,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [featuredHackathons, setFeaturedHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await hackathonApi.list();
        setFeaturedHackathons(data.slice(0, 3));
      } catch (e) {
        console.error('Failed to load hackathons', e);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 lg:pt-28 overflow-hidden">
        {/* Glow Background Effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Institution Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 mb-6 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-blue-400">NMIT Bengaluru</span>
            <span className="text-slate-500">•</span>
            <span>Official Hackathon Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Discover. Build. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Compete.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The central gateway for students of <strong>Nitte Meenakshi Institute of Technology</strong> to discover curated hackathons, check eligibility, record participation, and track their competitive journey.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/hackathons"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-xl shadow-blue-600/25 transition-all group"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/signup"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition-colors"
            >
              <span>Student Signup (@nmit.ac.in)</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">100%</span>
              <span className="block text-xs text-slate-400 mt-1">Verified NMIT Students</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">Direct</span>
              <span className="block text-xs text-slate-400 mt-1">Eligibility Engine</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400">Recorded</span>
              <span className="block text-xs text-slate-400 mt-1">Participation History</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">Verified</span>
              <span className="block text-xs text-slate-400 mt-1">Club Recognition</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hackathons Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active Competitions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Current Opportunities</h2>
          </div>

          <Link
            to="/hackathons"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>View All Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="devfolio-card p-6 h-64 animate-pulse bg-slate-900/50" />
            ))}
          </div>
        ) : featuredHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredHackathons.map((h) => (
              <HackathonCard key={h.id} hackathon={h} />
            ))}
          </div>
        ) : (
          <div className="devfolio-card p-12 text-center text-slate-400">
            No active hackathons currently open. Check back soon!
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Seamless Workflow
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">How NMIT Hack League Works</h2>
          <p className="text-sm text-slate-400 mt-3">
            Say goodbye to fragmented WhatsApp groups and lost registration links. A single unified pipeline for all students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            {
              step: '01',
              title: 'Create Account',
              desc: 'Sign up with your official @nmit.ac.in college email and USN.',
              icon: ShieldCheck,
            },
            {
              step: '02',
              title: 'Check Eligibility',
              desc: 'Automated filtering surfaces events tailored to your branch, batch & year.',
              icon: Compass,
            },
            {
              step: '03',
              title: 'Click Participate',
              desc: 'Log your participation intent in the official NMIT database.',
              icon: Code2,
            },
            {
              step: '04',
              title: 'Register Externally',
              desc: 'Get redirected instantly to the organizer’s official competition portal.',
              icon: ExternalLinkIcon,
            },
            {
              step: '05',
              title: 'Track & Feedback',
              desc: 'Follow your rounds from Round 1 to Finalist, and submit event reviews.',
              icon: Trophy,
            },
          ].map((item, idx) => (
            <div key={idx} className="devfolio-card p-6 relative">
              <span className="text-3xl font-black text-slate-800 font-mono block mb-3">
                {item.step}
              </span>
              <item.icon className="w-6 h-6 text-blue-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About NMIT Hack League Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="devfolio-card p-8 sm:p-12 relative overflow-hidden bg-gradient-to-b from-[#101522] to-[#0c101a]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Institutional Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                About NMIT Hack League
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                NMIT Hack League is the premier student-led technical hackathon club of <strong>Nitte Meenakshi Institute of Technology</strong>. We identify, evaluate, and circulate top-tier hackathons across AI, Web3, Systems, and Open Innovation.
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                By maintaining a structured institutional registry, the platform ensures that student achievements, finalist placements, and winning entries are officially recognized by faculty coordinators and department heads.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
                >
                  Join as an NMIT Student
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  Student Login
                </Link>
              </div>
            </div>

            <div className="space-y-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Why Students Trust Hack League
              </h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">
                    <strong>Zero Spam:</strong> Only vetted, genuine national and global competitions.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">
                    <strong>Tailored Eligibility:</strong> Filter opportunities by your exact branch (ISE, CSE, AIML, ECE, ME) and graduation batch.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">
                    <strong>Verified Portfolio:</strong> Keep an unshakeable digital record of your hackathons, verified rounds, and finalist achievements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

function ExternalLinkIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}
