import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hackathon, Registration } from '../types';
import { hackathonApi, registrationApi } from '../services/api';
import { HackathonCard } from '../components/HackathonCard';
import {
  Trophy,
  CheckCircle,
  Compass,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hackathonList, userRegs] = await Promise.all([
          hackathonApi.list({ eligibleOnly: true }),
          registrationApi.getMyRegistrations(),
        ]);
        setHackathons(hackathonList);
        setRegistrations(userRegs);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute student stats
  const registeredCount = registrations.length;
  const participatedCount = registrations.filter(
    (r) =>
      r.status === 'PARTICIPATED' ||
      r.status === 'ROUND_1' ||
      r.status === 'ROUND_2' ||
      r.status === 'FINALIST' ||
      r.status === 'WINNER'
  ).length;
  const openOpportunitiesCount = hackathons.filter(
    (h) => new Date(h.registrationDeadline) >= new Date()
  ).length;
  const winnerOrFinalistCount = registrations.filter(
    (r) => r.status === 'WINNER' || r.status === 'FINALIST'
  ).length;

  const categories = ['ALL', 'AI/ML', 'Open Innovation', 'Diversity & FinTech', 'Cloud & GenAI', 'Web3'];

  const filteredHackathons =
    selectedCategory === 'ALL'
      ? hackathons
      : hackathons.filter((h) =>
          h.category.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Welcome Banner */}
      <div className="devfolio-card p-6 sm:p-8 bg-gradient-to-r from-[#101522] via-[#121a2e] to-[#0c1220] border-blue-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NMIT Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              USN: <span className="font-mono text-white font-semibold">{user?.usn}</span> • Branch:{' '}
              <span className="text-white font-semibold">{user?.department}</span> • Batch:{' '}
              <span className="text-white font-semibold">{user?.graduationYear}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/my-hackathons"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-md shadow-blue-600/20"
            >
              <Trophy className="w-4 h-4" />
              <span>My Hackathons ({registeredCount})</span>
            </Link>

            <Link
              to="/hackathons"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center space-x-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>Browse All</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="devfolio-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Registered</span>
            <CheckCircle className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{registeredCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Logged participation</span>
        </div>

        <div className="devfolio-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Participated</span>
            <Trophy className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{participatedCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Verified hackathons</span>
        </div>

        <div className="devfolio-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Eligible Openings</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{openOpportunitiesCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Active competitions</span>
        </div>

        <div className="devfolio-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Finalist / Winner</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{winnerOrFinalistCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Recognized outcomes</span>
        </div>
      </div>

      {/* Recommended / Eligible Hackathons Feed */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Eligibility Filtered</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Recommended for You
            </h2>
            <p className="text-xs text-slate-400">
              Filtered specifically for your department ({user?.department}) and graduation batch ({user?.graduationYear}).
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Hackathon Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="devfolio-card p-6 h-64 animate-pulse bg-slate-900/40" />
            ))}
          </div>
        ) : filteredHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredHackathons.map((h) => (
              <HackathonCard key={h.id} hackathon={h} />
            ))}
          </div>
        ) : (
          <div className="devfolio-card p-12 text-center text-slate-400 space-y-3">
            <Compass className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">No Matching Hackathons</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no active hackathons matching this category. Try switching the category filter or check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
