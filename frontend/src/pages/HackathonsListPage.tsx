import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Hackathon } from '../types';
import { hackathonApi } from '../services/api';
import { HackathonCard } from '../components/HackathonCard';
import {
  Search,
  Filter,
  Compass,
  AlertCircle,
  Sparkles,
  RotateCcw,
  GraduationCap,
  Building,
  Calendar,
  Layers,
} from 'lucide-react';

export const HackathonsListPage: React.FC = () => {
  const { isStudent } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [batch, setBatch] = useState('ALL');
  const [department, setDepartment] = useState('ALL');
  const [deadlineStatus, setDeadlineStatus] = useState('ALL');
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const data = await hackathonApi.list({
        search: search.trim() || undefined,
        category: category !== 'ALL' ? category : undefined,
        batch: batch !== 'ALL' ? batch : undefined,
        department: department !== 'ALL' ? department : undefined,
        deadlineStatus: deadlineStatus !== 'ALL' ? deadlineStatus : undefined,
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
  }, [category, batch, department, deadlineStatus, eligibleOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHackathons();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('ALL');
    setBatch('ALL');
    setDepartment('ALL');
    setDeadlineStatus('ALL');
    setEligibleOnly(false);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'ALL' ||
    batch !== 'ALL' ||
    department !== 'ALL' ||
    deadlineStatus !== 'ALL' ||
    eligibleOnly;

  const categories = [
    'ALL',
    'Innovation / Project-based Challenge',
    'Hardware / Deep Tech / Innovation',
    'Corporate Case Competition / Product Building',
    'Skill / Aptitude / Technology Competition',
    'AI / FinTech / Buildathon',
    'Innovation / Ideation / Pitching',
    'Engineering Innovation',
    'Machine Learning',
    'Open Source / AI Agents',
    'Engineering / Product Prototyping',
    'AI / Design / Product Engineering',
  ];

  const batches = ['ALL', '2026', '2027', '2028', '2029', '2030'];
  const departments = ['ALL', 'ISE', 'CSE', 'AIML', 'ECE', 'ME', 'EEE', 'CIVIL'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Curated Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Explore Hackathons</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse all verified competitions, challenges, and buildathons for NMIT students.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-lg shrink-0">
          Showing <span className="font-bold text-white">{hackathons.length}</span> opportunities
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="devfolio-card p-5 space-y-4">
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by hackathon title, organizer, tracks, or keywords..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Detailed Filter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5">
              <Layers className="w-3 h-3 text-blue-400" />
              <span>Category</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories
                .filter((c) => c !== 'ALL')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          {/* Department Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5">
              <Building className="w-3 h-3 text-cyan-400" />
              <span>Department</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departments
                .filter((d) => d !== 'ALL')
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>

          {/* Graduation Year Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5">
              <GraduationCap className="w-3 h-3 text-indigo-400" />
              <span>Graduation Year</span>
            </label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Batches</option>
              {batches
                .filter((b) => b !== 'ALL')
                .map((b) => (
                  <option key={b} value={b}>
                    Batch {b}
                  </option>
                ))}
            </select>
          </div>

          {/* Deadline Status Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>Deadline Status</span>
            </label>
            <select
              value={deadlineStatus}
              onChange={(e) => setDeadlineStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Deadlines</option>
              <option value="OPEN">Open / Upcoming Only</option>
              <option value="CLOSED">Closed Only</option>
            </select>
          </div>
        </div>

        {/* Bottom Bar: Eligibility Toggle and Reset Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          {/* Student Eligibility Toggle */}
          {isStudent ? (
            <label className="flex items-center space-x-2 cursor-pointer text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={eligibleOnly}
                onChange={(e) => setEligibleOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
              />
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-white">Eligible for Me Only</span>
                <span className="text-[10px] text-slate-400">(Filters by your branch & batch)</span>
              </span>
            </label>
          ) : (
            <div className="text-xs text-slate-500">
              Log in with your NMIT account to see personalized eligibility badges.
            </div>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Hackathons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="devfolio-card p-6 h-64 animate-pulse bg-slate-900/40" />
          ))}
        </div>
      ) : hackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((h) => (
            <HackathonCard key={h.id} hackathon={h} />
          ))}
        </div>
      ) : (
        <div className="devfolio-card p-16 text-center text-slate-400 space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Hackathons Match Your Filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting or resetting your search filters, graduation year, or department options.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
