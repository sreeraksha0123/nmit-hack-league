import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Registration, PARTICIPATION_STATUS_MAP } from '../types';
import { registrationApi } from '../services/api';
import { FeedbackModal } from '../components/FeedbackModal';
import {
  Trophy,
  Calendar,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';

export const MyHackathonsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'FINALIST_WINNER'>('ALL');

  // Feedback Modal State
  const [selectedHackathonForFeedback, setSelectedHackathonForFeedback] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const fetchRegistrations = async () => {
    try {
      const data = await registrationApi.getMyRegistrations();
      setRegistrations(data);
    } catch (e) {
      console.error('Failed to load registrations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') {
      return r.status === 'REGISTERED' || r.status === 'ROUND_1' || r.status === 'ROUND_2';
    }
    if (filter === 'FINALIST_WINNER') {
      return r.status === 'FINALIST' || r.status === 'WINNER';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Participation Portfolio</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Hackathons</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your registered hackathons, round progressions, outcomes, and post-event reviews.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({registrations.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filter === 'ACTIVE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('FINALIST_WINNER')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filter === 'FINALIST_WINNER' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Winners & Finalists
          </button>
        </div>
      </div>

      {/* Registrations List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="devfolio-card p-6 h-36 animate-pulse bg-slate-900/40" />
          ))}
        </div>
      ) : filteredRegistrations.length > 0 ? (
        <div className="space-y-4">
          {filteredRegistrations.map((reg) => {
            const statusMeta = PARTICIPATION_STATUS_MAP[reg.status] || {
              label: reg.status,
              bg: 'bg-slate-800',
              text: 'text-slate-300',
              border: 'border-slate-700',
              dot: 'bg-slate-400',
            };

            const regDate = new Date(reg.registeredAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            const eventDate = reg.hackathon
              ? new Date(reg.hackathon.eventDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'N/A';

            const isEventPassed = reg.hackathon
              ? new Date(reg.hackathon.eventDate) <= new Date()
              : false;

            const isParticipationVerified =
              reg.status === 'PARTICIPATED' ||
              reg.status === 'ROUND_1' ||
              reg.status === 'ROUND_2' ||
              reg.status === 'FINALIST' ||
              reg.status === 'WINNER';

            const canSubmitFeedback = isEventPassed || isParticipationVerified;

            return (
              <div
                key={reg.id}
                className="devfolio-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.bg} ${statusMeta.text} border ${statusMeta.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                      <span>{statusMeta.label}</span>
                    </span>

                    {reg.round && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        Round: {reg.round}
                      </span>
                    )}

                    <span className="text-xs text-slate-500">
                      Registered on {regDate}
                    </span>
                  </div>

                  <div>
                    <Link
                      to={`/hackathons/${reg.hackathon?.id}`}
                      className="text-lg font-bold text-white hover:text-blue-400 transition-colors"
                    >
                      {reg.hackathon?.title}
                    </Link>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{reg.hackathon?.organizer}</span>
                      <span className="text-slate-600">•</span>
                      <span>Category: {reg.hackathon?.category}</span>
                      <span className="text-slate-600">•</span>
                      <span>Event Date: {eventDate}</span>
                    </div>
                  </div>

                  {/* Admin notes if any */}
                  {reg.adminNotes && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">Coordinator Feedback: </span>
                        <span>{reg.adminNotes}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
                  {/* External Portal Link */}
                  {reg.hackathon?.registrationUrl && (
                    <a
                      href={reg.hackathon.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-lg transition-colors"
                    >
                      <span>Organizer Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* Feedback Status / CTA */}
                  {reg.hasSubmittedFeedback ? (
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Feedback Submitted ({reg.submittedFeedback?.rating}★)</span>
                    </div>
                  ) : canSubmitFeedback ? (
                    <button
                      onClick={() =>
                        setSelectedHackathonForFeedback({
                          id: reg.hackathonId,
                          title: reg.hackathon?.title || 'Hackathon',
                        })
                      }
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Submit Feedback</span>
                    </button>
                  ) : (
                    <span
                      title="Feedback opens after the event date or upon outcome verification by coordinators"
                      className="text-[11px] text-slate-500 cursor-help"
                    >
                      Feedback opens after event
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="devfolio-card p-16 text-center text-slate-400 space-y-4">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">You haven't registered for any hackathons yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Explore curated competitions, verify your eligibility, and record your participation through NMIT Hack League.
          </p>
          <Link
            to="/hackathons"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/20"
          >
            <span>Browse Active Hackathons</span>
          </Link>
        </div>
      )}

      {/* Feedback Submission Modal */}
      {selectedHackathonForFeedback && (
        <FeedbackModal
          isOpen={!!selectedHackathonForFeedback}
          onClose={() => setSelectedHackathonForFeedback(null)}
          hackathonId={selectedHackathonForFeedback.id}
          hackathonTitle={selectedHackathonForFeedback.title}
          onSuccess={() => {
            fetchRegistrations();
          }}
        />
      )}
    </div>
  );
};
