import React from 'react';
import { Link } from 'react-router-dom';
import { Hackathon } from '../types';
import { Calendar, Users, Trophy, CheckCircle, ArrowRight, AlertCircle, Building2 } from 'lucide-react';

interface HackathonCardProps {
  hackathon: Hackathon;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({ hackathon }) => {
  const deadline = new Date(hackathon.registrationDeadline);
  const now = new Date();
  const isPast = deadline < now;

  // Format deadline date
  const formattedDeadline = deadline.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const eligibility = hackathon.eligibility;
  const depts =
    eligibility?.allowedDepartments && eligibility.allowedDepartments.length > 0
      ? eligibility.allowedDepartments.join(', ')
      : 'All Branches';

  const batches =
    eligibility?.allowedBatches && eligibility.allowedBatches.length > 0
      ? eligibility.allowedBatches.join(', ') + ' Batch'
      : 'All Batches';

  const gender =
    eligibility?.allowedGender === 'FEMALE'
      ? 'Women Only'
      : eligibility?.allowedGender === 'MALE'
      ? 'Men Only'
      : 'Open to All';

  return (
    <div className="devfolio-card p-6 flex flex-col justify-between group hover:border-blue-500/50 hover:bg-[#131a2b] transition-all">
      <div>
        {/* Top Meta: Category + Live/Registered Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {hackathon.category}
          </span>

          <div className="flex items-center space-x-1.5">
            {hackathon.isRegistered && (
              <span className="flex items-center space-x-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" />
                <span>Registered</span>
              </span>
            )}

            {hackathon.isEligible === false && !hackathon.isRegistered && (
              <span className="flex items-center space-x-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-3 h-3" />
                <span>Ineligible</span>
              </span>
            )}

            {isPast ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Closed
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Open</span>
              </span>
            )}
          </div>
        </div>

        {/* Title & Organizer */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
            {hackathon.title}
          </h3>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium truncate">{hackathon.organizer}</span>
          </div>
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {hackathon.description}
        </p>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 gap-2 py-3 border-y border-[#1f293d]/80 text-xs mb-4">
          <div className="flex items-center space-x-2 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 block">Deadline</span>
              <span className="font-medium">{formattedDeadline}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-300">
            <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 block">Team Size</span>
              <span className="font-medium">{hackathon.teamSize}</span>
            </div>
          </div>
        </div>

        {/* Eligibility criteria badges */}
        <div className="space-y-1.5 mb-5">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block">
            Eligibility
          </span>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono">
              {depts}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono">
              {batches}
            </span>
            {gender !== 'Open to All' && (
              <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium">
                {gender}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Prize & CTA Button */}
      <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#1f293d]/60">
        <div className="truncate">
          {hackathon.prizeInfo ? (
            <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{hackathon.prizeInfo}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500">Certificate & Badges</span>
          )}
        </div>

        <Link
          to={`/hackathons/${hackathon.id}`}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 rounded-lg transition-colors shrink-0 shadow-sm"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
