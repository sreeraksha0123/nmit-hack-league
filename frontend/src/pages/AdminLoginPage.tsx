import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminLogin({ email: email.trim().toLowerCase(), password });
      navigate('/admin');
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Invalid administrator credentials. Access restricted.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@nmit.ac.in');
    setPassword('AdminHackLeague@2026');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full devfolio-card p-8 sm:p-10 shadow-2xl relative border-blue-500/30">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/40 text-blue-400 mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Administrator Access</h2>
          <p className="text-xs text-slate-400 mt-1">
            Restricted to authorized NMIT Hack League Club Coordinators
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Coordinator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@nmit.ac.in"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Administrative Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure password"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50"
            >
              <span>{loading ? 'Verifying Authorization...' : 'Access Admin Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Demo Admin Auto-fill for Presentation */}
        <div className="mt-6 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300 font-medium">Demo Coordinator Auth:</span>
          </div>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline"
          >
            Auto-Fill
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Security Policy: Administrator accounts are strictly provisioned via server configuration. Public signup is permanently disabled.
        </div>
      </div>
    </div>
  );
};
