import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hackathon } from '../types';
import { hackathonApi, registrationApi } from '../services/api';
import { RegistrationRedirectModal } from '../components/RegistrationRedirectModal';
import {
  Calendar,
  Users,
  Trophy,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Building2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const HackathonDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isStudent, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect Modal State
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const data = await hackathonApi.getById(id);
      setHackathon(data);
      if (data.isRegistered) {
        setIsAlreadyRegistered(true);
      }
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load hackathon details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs">Loading hackathon specifications...</p>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm max-w-md mx-auto">
          {error || 'Hackathon not found.'}
        </div>
        <Link
          to="/hackathons"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </Link>
      </div>
    );
  }

  const deadline = new Date(hackathon.registrationDeadline);
  const now = new Date();
  const isClosed = deadline < now;
  const eventDate = new Date(hackathon.eventDate);

  const formattedDeadline = deadline.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedEventDate = eventDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleParticipate = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isStudent) {
      setError('Only student accounts can register for hackathons.');
      return;
    }

    setError(null);
    setRegistering(true);

    try {
      const response = await registrationApi.register(hackathon.id);
      setIsAlreadyRegistered(!!response.alreadyRegistered);
      setRedirectModalOpen(true);
      fetchDetails(); // Refresh registered state
    } catch (err: any) {
      const backendError = err.response?.data?.error || 'Registration failed';
      const reasons = err.response?.data?.reasons;
      if (reasons && reasons.length > 0) {
        setError(`${backendError} ${reasons.join(' ')}`);
      } else {
        setError(backendError);
      }
    } finally {
      setRegistering(false);
    }
  };

  const eligibility = hackathon.eligibility;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/hackathons"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Hackathons</span>
      </Link>

      {/* Banner / Header */}
      <div className="devfolio-card overflow-hidden">
        {hackathon.bannerUrl && (
          <div className="w-full h-48 sm:h-72 overflow-hidden bg-slate-900 relative">
            <img
              src={hackathon.bannerUrl}
              alt={hackathon.title}
              className="w-full h-full object-cover filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101522] via-[#101522]/40 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {hackathon.category}
            </span>

            {isClosed ? (
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Registrations Closed
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Open for Applications</span>
              </span>
            )}

            {hackathon.isRegistered && (
              <span className="flex items-center space-x-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
                <span>Participation Logged in NMIT Hack League</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {hackathon.title}
          </h1>

          <div className="flex items-center space-x-2 text-sm text-slate-300">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="font-semibold">{hackathon.organizer}</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">
              {hackathon.registrationCount || 0} NMIT students registered
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Devfolio split: Left content, Right sticky action card) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Details, Rules, Eligibility Specs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="devfolio-card p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Competition Overview</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {hackathon.description}
            </p>
          </div>

          {/* Detailed Eligibility Matrix */}
          <div className="devfolio-card p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Eligibility Criteria</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Eligible Branches</span>
                <span className="font-semibold text-white">
                  {eligibility?.allowedDepartments && eligibility.allowedDepartments.length > 0
                    ? eligibility.allowedDepartments.join(', ')
                    : 'Open to All Branches'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Graduation Batches</span>
                <span className="font-semibold text-white">
                  {eligibility?.allowedBatches && eligibility.allowedBatches.length > 0
                    ? eligibility.allowedBatches.join(', ') + ' Batch'
                    : 'Open to All Batches'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Gender Criteria</span>
                <span className="font-semibold text-white">
                  {eligibility?.allowedGender === 'FEMALE'
                    ? 'Women Only'
                    : eligibility?.allowedGender === 'MALE'
                    ? 'Men Only'
                    : 'Open to All Genders'}
                </span>
              </div>
            </div>

            {/* If student is logged in, show their personal eligibility check */}
            {isStudent && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-slate-200 block">
                  Your Eligibility Status:
                </span>
                {hackathon.isEligible ? (
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>You meet all requirements for this hackathon!</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-rose-400">
                      <XCircle className="w-4 h-4" />
                      <span>You are currently not eligible for this opportunity.</span>
                    </div>
                    {hackathon.eligibilityReasons && hackathon.eligibilityReasons.length > 0 && (
                      <ul className="list-disc list-inside text-slate-400 pl-2 space-y-0.5">
                        {hackathon.eligibilityReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions and Rules */}
          {hackathon.instructions && (
            <div className="devfolio-card p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Special Instructions & Guidelines</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {hackathon.instructions}
              </p>
            </div>
          )}
        </div>

        {/* Right Sticky Sidebar: Key Facts & Primary CTA */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="devfolio-card p-6 sm:p-7 space-y-6 border-blue-500/30">
            {/* Prize Pool Banner */}
            {hackathon.prizeInfo && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 text-center">
                <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <span className="text-xs text-amber-300/80 uppercase font-semibold tracking-wider block">
                  Prizes & Awards
                </span>
                <span className="text-base font-extrabold text-amber-400 block mt-0.5">
                  {hackathon.prizeInfo}
                </span>
              </div>
            )}

            {/* Quick Facts List */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Registration Deadline</span>
                </span>
                <span className="font-semibold text-white text-right">{formattedDeadline}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Event / Hack Date</span>
                </span>
                <span className="font-semibold text-white text-right">{formattedEventDate}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Team Size</span>
                </span>
                <span className="font-semibold text-white">{hackathon.teamSize}</span>
              </div>
            </div>

            {/* Error notification if registration fails */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <div>
              {!isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
                  >
                    <span>Log In to Participate</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <p className="text-[11px] text-slate-500 text-center">
                    Must be logged in with an official @nmit.ac.in account
                  </p>
                </div>
              ) : isClosed ? (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 text-slate-500 font-semibold text-sm cursor-not-allowed"
                >
                  Registration Closed
                </button>
              ) : isStudent && hackathon.isEligible === false ? (
                <div className="space-y-2">
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 text-rose-400/80 border border-rose-500/20 font-semibold text-sm cursor-not-allowed"
                  >
                    Not Eligible for Your Profile
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">
                    This hackathon has branch or batch criteria that do not match your student profile.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleParticipate}
                    disabled={registering}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 disabled:opacity-50"
                  >
                    <span>
                      {registering
                        ? 'Logging Participation...'
                        : hackathon.isRegistered
                        ? 'Continue to Official Registration'
                        : 'Participate with Hack League'}
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    Clicks record your club registration in PostgreSQL before redirecting to the official organizer portal.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Redirect Confirmation Modal */}
      <RegistrationRedirectModal
        isOpen={redirectModalOpen}
        onClose={() => setRedirectModalOpen(false)}
        hackathonTitle={hackathon.title}
        organizer={hackathon.organizer}
        registrationUrl={hackathon.registrationUrl}
        alreadyRegistered={isAlreadyRegistered}
      />
    </div>
  );
};
