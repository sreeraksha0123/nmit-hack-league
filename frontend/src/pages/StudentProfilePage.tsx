import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import {
  User as UserIcon,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Building2,
  Lock,
  Mail,
  Save,
} from 'lucide-react';

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

export const StudentProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || 'ISE',
    currentYear: user?.currentYear || 3,
    graduationYear: user?.graduationYear || 2027,
    gender: user?.gender || 'FEMALE',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      await authApi.updateProfile({
        name: formData.name,
        department: formData.department,
        currentYear: formData.currentYear,
        graduationYear: formData.graduationYear,
        gender: formData.gender as any,
      });
      await refreshUser();
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Student Profile</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Student Profile</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Your institutional credentials and academic profile details.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left summary card */}
        <div className="devfolio-card p-6 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-blue-600/15 border-2 border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto text-2xl font-black">
            {user?.name.charAt(0)}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <span className="font-mono text-xs text-blue-400 font-semibold block mt-0.5">
              {user?.usn}
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              {user?.department} • Batch of {user?.graduationYear}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Account Type</span>
              <span className="text-white font-semibold">Student (Undergraduate)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Email Verification</span>
              <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verified Domain</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right edit form */}
        <div className="md:col-span-2 devfolio-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Locked Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>College USN (Locked)</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.usn}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-400 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>NMIT Email (Locked)</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-400 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            {/* Editable Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Department, Current Year, Graduation Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                  value={formData.currentYear}
                  onChange={(e) =>
                    setFormData({ ...formData, currentYear: parseInt(e.target.value, 10) })
                  }
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Graduation Batch</label>
                <select
                  value={formData.graduationYear}
                  onChange={(e) =>
                    setFormData({ ...formData, graduationYear: parseInt(e.target.value, 10) })
                  }
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
            <div>
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
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="sr-only"
                    />
                    <span>{g.charAt(0) + g.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
