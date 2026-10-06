import React, { useEffect, useState } from 'react';
import { Feedback, Hackathon } from '../types';
import { feedbackApi, hackathonApi } from '../services/api';
import { MessageSquare, Star, Trophy, Building2, ThumbsUp, Calendar } from 'lucide-react';

export const AdminFeedbackPage: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [hackathonsList, setHackathonsList] = useState<Hackathon[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load hackathons for filter dropdown
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const list = await hackathonApi.list({ status: 'ALL' });
        setHackathonsList(list);
      } catch (e) {
        console.error('Failed to load hackathons list', e);
      }
    };
    fetchHackathons();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await feedbackApi.getAdminFeedback({
        hackathonId: selectedHackathonId !== 'ALL' ? selectedHackathonId : undefined,
        page,
        limit: 10,
      });
      setFeedbackList(data.feedback);
      setTotalPages(data.pagination.totalPages);
    } catch (e) {
      console.error('Failed to load feedback', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [selectedHackathonId, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Post-Event Insights</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Student Feedback Logs</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review qualitative student reflections, learnings, and ratings across competitions.
          </p>
        </div>

        {/* Filter by Hackathon */}
        <div className="w-full sm:w-72">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Filter by Opportunity
          </label>
          <select
            value={selectedHackathonId}
            onChange={(e) => {
              setSelectedHackathonId(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Competitions</option>
            {hackathonsList.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="devfolio-card p-6 h-40 animate-pulse bg-slate-900/40" />
          ))}
        </div>
      ) : feedbackList.length > 0 ? (
        <div className="space-y-4">
          {feedbackList.map((fb) => {
            const date = new Date(fb.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div key={fb.id} className="devfolio-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {fb.student?.name}{' '}
                      <span className="font-mono text-slate-400 font-normal">
                        ({fb.student?.usn})
                      </span>{' '}
                      •{' '}
                      <span className="text-blue-400 font-semibold">{fb.student?.department}</span>
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                      <Trophy className="w-3.5 h-3.5 text-slate-500" />
                      <span>{fb.hackathon?.title}</span>
                      <span className="text-slate-600">•</span>
                      <span>Submitted on {date}</span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold ml-1">{fb.rating}/5</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">What was learned</span>
                    <p className="text-slate-200 leading-relaxed">{fb.learnedText}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">What was liked</span>
                    <p className="text-slate-200 leading-relaxed">{fb.likedText}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">Suggestions</span>
                    <p className="text-slate-200 leading-relaxed">{fb.improvedText}</p>
                  </div>
                </div>

                {fb.wouldParticipateAgain && (
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 pt-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Student would happily participate in future club-promoted hackathons.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="devfolio-card p-16 text-center text-slate-500 space-y-2">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Feedback Submitted Yet</h3>
          <p className="text-xs text-slate-400">
            Student feedback will populate here as hackathon outcomes conclude.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded-lg bg-slate-800 text-white disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded-lg bg-slate-800 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
