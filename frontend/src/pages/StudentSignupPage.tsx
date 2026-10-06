import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, ArrowRight, Sparkles, Building2 } from 'lucide-react';

const DEPARTMENTS = [
  'ISE',
  'CSE',
  'AIML',
  'AIDS',
  'ECE',
  'EEE',
  'ME',
  'CIVIL',
  'AERONAUTICAL',
];

const GRADUATION_YEARS = [2025, 2026, 2027, 2028, 2029];

export const StudentSignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'ISE',
    currentYear: 3,
    graduationYear: 2027,
    gender: 'FEMALE',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'currentYear' || name === 'graduationYear' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation for email domain
    const normalizedEmail = formData.email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@nmit.ac.in')) {
      setError('Only NMIT college email addresses ending with @nmit.ac.in are allowed.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await signup({
        ...formData,
        email: normalizedEmail,
        usn: formData.usn.trim().toUpperCase(),
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full devfolio-card p-8 sm:p-10 shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create Student Account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Exclusive to Nitte Meenakshi Institute of Technology undergraduates
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name & USN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sree Raksha S P"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                College USN <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                name="usn"
                value={formData.usn}
                onChange={handleChange}
                placeholder="e.g. 1NT23IS089"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white uppercase placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* College Email */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-semibold">
                NMIT College Email <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] text-blue-400 font-mono">Must end with @nmit.ac.in</span>
            </div>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. studentname.dept@nmit.ac.in"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
            />
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Department, Current Year, Graduation Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Current Year</label>
              <select
                name="currentYear"
                value={formData.currentYear}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Graduation Year</label>
              <select
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              >
                {GRADUATION_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} Batch
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender */}
          <div className="pt-2">
            <label className="block text-slate-300 font-semibold mb-1">Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {['FEMALE', 'MALE', 'OTHER'].map((g) => (
                <label
                  key={g}
                  className={`flex items-center justify-center py-2 px-3 rounded-xl border cursor-pointer font-medium text-xs transition-colors ${
                    formData.gender === g
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>{g.charAt(0) + g.slice(1).toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <span>{loading ? 'Validating & Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 font-semibold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};
