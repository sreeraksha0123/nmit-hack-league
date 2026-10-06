import React, { useEffect, useState } from 'react';
import { ExternalLink, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface RegistrationRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  hackathonTitle: string;
  organizer: string;
  registrationUrl: string;
  alreadyRegistered?: boolean;
}

export const RegistrationRedirectModal: React.FC<RegistrationRedirectModalProps> = ({
  isOpen,
  onClose,
  hackathonTitle,
  organizer,
  registrationUrl,
  alreadyRegistered = false,
}) => {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(4);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto redirect when countdown reaches 0
      window.open(registrationUrl, '_blank', 'noopener,noreferrer');
    }
  }, [isOpen, countdown, registrationUrl]);

  if (!isOpen) return null;

  const handleManualRedirect = () => {
    window.open(registrationUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#101522] border border-[#1f293d] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        <div className="text-center">
          {alreadyRegistered ? (
            <div className="mx-auto w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-blue-400" />
            </div>
          ) : (
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          )}

          <h3 className="text-xl font-bold text-white mb-1">
            {alreadyRegistered ? 'Opportunity Already Logged' : 'Participation Recorded!'}
          </h3>

          <p className="text-xs text-blue-400 font-medium mb-4">
            {hackathonTitle} • {organizer}
          </p>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left text-xs text-slate-300 space-y-2 mb-6">
            <p className="font-semibold text-slate-200">
              {alreadyRegistered
                ? 'You have already registered for this opportunity through NMIT Hack League.'
                : 'Your participation intent has been securely stored in the NMIT Hack League database.'}
            </p>
            <p className="text-slate-400 leading-relaxed">
              <span className="text-amber-400 font-medium">Important:</span> NMIT Hack League records your club participation. Please now complete your official registration on the organizer website ({organizer}).
            </p>
          </div>

          {/* Countdown Indicator */}
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 mb-6">
            <Clock className="w-4 h-4 text-slate-500 animate-spin" />
            <span>
              Redirecting to official portal in <strong className="text-white">{countdown}</strong> seconds...
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleManualRedirect}
              className="flex items-center justify-center space-x-2 py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              <span>Continue to Official Registration</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
