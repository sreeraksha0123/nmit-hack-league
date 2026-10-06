import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertCircle, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

export const StudentLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ identifier, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Invalid credentials. Please verify your Email/USN and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to fill demo student credentials for demonstration
  const fillDemoStudent = () => {
    setIdentifier('sreeraksha@nmit.ac.in');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full devfolio-card p-8 sm:p-10 shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Student Portal Login</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your registered hackathons and opportunities
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
              College Email or USN
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 1NT23IS089 or student@nmit.ac.in"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Demo Helper Banner for Presentation */}
        <div className="mt-6 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300 font-medium">Demo Student Account:</span>
          </div>
          <button
            type="button"
            onClick={fillDemoStudent}
            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline"
          >
            Auto-Fill
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          New to NMIT Hack League?{' '}
          <Link to="/signup" className="text-blue-400 font-semibold hover:underline">
            Register your student account
          </Link>
        </div>
      </div>
    </div>
  );
};
