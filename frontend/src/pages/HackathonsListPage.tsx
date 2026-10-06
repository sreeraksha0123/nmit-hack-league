import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Hackathon } from '../types';
import { hackathonApi } from '../services/api';
import { HackathonCard } from '../components/HackathonCard';
import { Search, Filter, Compass, AlertCircle, Sparkles } from 'lucide-react';

export const HackathonsListPage: React.FC = () => {
  const { isStudent } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const data = await hackathonApi.list({
        search: search.trim() || undefined,
        category: category !== 'ALL' ? category : undefined,
        eligibleOnly: isStudent ? eligibleOnly : undefined,
      });
      setHackathons(data);
    } catch (e) {
      console.error('Failed to load hackathons', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [category, eligibleOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHackathons();
  };

  const categories = [
    'ALL',
    'Open Innovation',
    'AI/ML & Automotive',
    'Diversity & FinTech',
    'Cloud & GenAI',
    'Web3',
    'Cybersecurity',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
          <Compass className="w-3.5 h-3.5" />
          <span>Curated Registry</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Explore Hackathons</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Browse all active and upcoming competitions verified for NMIT students.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="devfolio-card p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by hackathon title, organizer, or keywords..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800/80 text-xs">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  category === cat
                    ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300 font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Student Eligibility Toggle */}
          {isStudent && (
            <label className="flex items-center space-x-2 cursor-pointer text-slate-300 font-medium shrink-0">
              <input
                type="checkbox"
                checked={eligibleOnly}
                onChange={(e) => setEligibleOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
              />
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Eligible for Me Only</span>
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Hackathons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="devfolio-card p-6 h-64 animate-pulse bg-slate-900/40" />
          ))}
        </div>
      ) : hackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hackathons.map((h) => (
            <HackathonCard key={h.id} hackathon={h} />
          ))}
        </div>
      ) : (
        <div className="devfolio-card p-16 text-center text-slate-400 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Hackathons Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No hackathons matched your current search filters. Try resetting search query or category.
          </p>
        </div>
      )}
    </div>
  );
};
