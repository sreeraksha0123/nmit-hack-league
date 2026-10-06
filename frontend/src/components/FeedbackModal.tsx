import React, { useState } from 'react';
import { Star, X, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { feedbackApi } from '../services/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  hackathonId: string;
  hackathonTitle: string;
  onSuccess: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  hackathonId,
  hackathonTitle,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [learnedText, setLearnedText] = useState('');
  const [likedText, setLikedText] = useState('');
  const [improvedText, setImprovedText] = useState('');
  const [wouldParticipateAgain, setWouldParticipateAgain] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await feedbackApi.submit(hackathonId, {
        rating,
        learnedText,
        likedText,
        improvedText,
        wouldParticipateAgain,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#101522] border border-[#1f293d] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-bold text-white">Post-Hackathon Feedback</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6 font-medium">
          Sharing your experience for: <span className="text-blue-400 font-semibold">{hackathonTitle}</span>
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Star Rating */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Overall Experience Rating</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-600 hover:text-amber-400 focus:outline-none transition-colors"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-slate-400 ml-2 font-medium">({rating} / 5 Stars)</span>
            </div>
          </div>

          {/* Learned */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              What did you learn? <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={learnedText}
              onChange={(e) => setLearnedText(e.target.value)}
              placeholder="E.g., Technologies explored, architecture learned, team collaboration..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Liked */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              What did you like the most? <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={likedText}
              onChange={(e) => setLikedText(e.target.value)}
              placeholder="E.g., Mentorship, jury feedback, problem statement challenge..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Improved */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              What could be improved? <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={improvedText}
              onChange={(e) => setImprovedText(e.target.value)}
              placeholder="E.g., Timeline, submission portal, problem ambiguity..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Would participate again */}
          <div className="pt-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wouldParticipateAgain}
                onChange={(e) => setWouldParticipateAgain(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
              />
              <span className="text-slate-300 font-medium">
                I would participate in future hackathons organized or circulated by NMIT Hack League
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
