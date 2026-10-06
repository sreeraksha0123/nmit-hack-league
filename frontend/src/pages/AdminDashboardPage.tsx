import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminStats, PARTICIPATION_STATUS_MAP } from '../types';
import { adminApi } from '../services/api';
import {
  Users,
  Trophy,
  CheckCircle,
  Award,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (e) {
        console.error('Failed to load admin stats', e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs">Loading institutional metrics...</p>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalStudents: 0,
    totalHackathons: 0,
    totalRegistrations: 0,
    totalParticipants: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NMIT Hack League Central Admin</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Coordinator Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Institutional overview of student hackathon registrations, outcomes, and opportunities.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/hackathons"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create / Manage Hackathons</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="devfolio-card p-6 border-blue-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-3xl font-black text-white">{metrics.totalStudents}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Registered undergraduates</span>
        </div>

        <div className="devfolio-card p-6 border-cyan-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Hackathons</span>
            <Trophy className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-3xl font-black text-white">{metrics.totalHackathons}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Circulated opportunities</span>
        </div>

        <div className="devfolio-card p-6 border-indigo-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Registrations</span>
            <CheckCircle className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-3xl font-black text-white">{metrics.totalRegistrations}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Student intents logged</span>
        </div>

        <div className="devfolio-card p-6 border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Participants</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white">{metrics.totalParticipants}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Rounds & finalists verified</span>
        </div>
      </div>

      {/* Split section: Recent Hackathons & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Hackathons */}
        <div className="devfolio-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-blue-400" />
              <span>Recent Hackathons</span>
            </h3>
            <Link
              to="/admin/hackathons"
              className="text-xs font-semibold text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentHackathons && stats.recentHackathons.length > 0 ? (
              stats.recentHackathons.map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 truncate max-w-[280px]">
                    <span className="font-bold text-white block truncate">{h.title}</span>
                    <span className="text-slate-400 text-[11px] truncate block">
                      {h.organizer} • {h.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-semibold text-[11px] border border-blue-500/20">
                      {h.registrationCount} registered
                    </span>
                    <Link
                      to={`/admin/registrations?hackathonId=${h.id}`}
                      className="text-slate-400 hover:text-white"
                      title="View registered students"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No hackathons published yet.</p>
            )}
          </div>
        </div>

        {/* Recent Registrations Stream */}
        <div className="devfolio-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Registrations</span>
            </h3>
            <Link
              to="/admin/students"
              className="text-xs font-semibold text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>View Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentRegistrations && stats.recentRegistrations.length > 0 ? (
              stats.recentRegistrations.map((reg) => {
                const statusMeta = PARTICIPATION_STATUS_MAP[reg.status] || {
                  label: reg.status,
                  bg: 'bg-slate-800',
                  text: 'text-slate-300',
                  border: 'border-slate-700',
                };
                return (
                  <div
                    key={reg.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[260px]">
                      <span className="font-bold text-white block truncate">
                        {reg.student?.name}{' '}
                        <span className="font-mono text-slate-500 font-normal">
                          ({reg.student?.usn})
                        </span>
                      </span>
                      <span className="text-slate-400 text-[11px] truncate block">
                        {reg.hackathon?.title}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusMeta.bg} ${statusMeta.text} border ${statusMeta.border} shrink-0`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">No registrations recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Feedback Reviews */}
      <div className="devfolio-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Recent Student Feedback</span>
          </h3>
          <Link
            to="/admin/feedback"
            className="text-xs font-semibold text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>All Feedback</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats?.recentFeedback && stats.recentFeedback.length > 0 ? (
            stats.recentFeedback.map((fb) => (
              <div
                key={fb.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    {fb.student?.name} ({fb.student?.department})
                  </span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: fb.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-blue-400 font-medium block truncate">
                  {fb.hackathon?.title}
                </span>
                <p className="text-slate-300 italic line-clamp-2">"{fb.learnedText}"</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 col-span-2">No feedback received yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
