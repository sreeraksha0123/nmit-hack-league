import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hackathon, HackathonStatus, GenderEligibility } from '../types';
import { hackathonApi } from '../services/api';
import {
  Trophy,
  Plus,
  Archive,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  ExternalLink,
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

const BATCHES = [2025, 2026, 2027, 2028, 2029];

export const AdminHackathonsPage: React.FC = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    description: '',
    category: 'Open Innovation',
    registrationUrl: '',
    registrationDeadline: '',
    eventDate: '',
    teamSize: '1-4 Members',
    prizeInfo: '',
    bannerUrl: '',
    instructions: '',
    allowedDepartments: [] as string[],
    allowedBatches: [] as number[],
    allowedGender: 'ALL' as GenderEligibility,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadHackathons = async () => {
    try {
      const data = await hackathonApi.list({ status: 'ALL' });
      setHackathons(data);
    } catch (e) {
      console.error('Failed to load hackathons', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      organizer: '',
      description: '',
      category: 'Open Innovation',
      registrationUrl: '',
      registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
      eventDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      teamSize: '1-4 Members',
      prizeInfo: '',
      bannerUrl: '',
      instructions: '',
      allowedDepartments: [],
      allowedBatches: [],
      allowedGender: 'ALL',
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (h: Hackathon) => {
    setEditingId(h.id);
    setFormData({
      title: h.title,
      organizer: h.organizer,
      description: h.description,
      category: h.category,
      registrationUrl: h.registrationUrl,
      registrationDeadline: new Date(h.registrationDeadline).toISOString().slice(0, 16),
      eventDate: new Date(h.eventDate).toISOString().slice(0, 16),
      teamSize: h.teamSize,
      prizeInfo: h.prizeInfo || '',
      bannerUrl: h.bannerUrl || '',
      instructions: h.instructions || '',
      allowedDepartments: h.eligibility?.allowedDepartments || [],
      allowedBatches: h.eligibility?.allowedBatches || [],
      allowedGender: h.eligibility?.allowedGender || 'ALL',
    });
    setError(null);
    setModalOpen(true);
  };

  const toggleDepartment = (dept: string) => {
    setFormData((prev) => {
      const exists = prev.allowedDepartments.includes(dept);
      return {
        ...prev,
        allowedDepartments: exists
          ? prev.allowedDepartments.filter((d) => d !== dept)
          : [...prev.allowedDepartments, dept],
      };
    });
  };

  const toggleBatch = (batch: number) => {
    setFormData((prev) => {
      const exists = prev.allowedBatches.includes(batch);
      return {
        ...prev,
        allowedBatches: exists
          ? prev.allowedBatches.filter((b) => b !== batch)
          : [...prev.allowedBatches, batch],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
        eventDate: new Date(formData.eventDate).toISOString(),
      };

      if (editingId) {
        await hackathonApi.update(editingId, payload);
        setSuccess('Hackathon specifications updated successfully.');
      } else {
        await hackathonApi.create(payload);
        setSuccess('Hackathon published successfully to eligible students.');
      }

      setModalOpen(false);
      loadHackathons();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save hackathon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm('Archive this hackathon? Historical registration records will be preserved.')) {
      try {
        await hackathonApi.archive(id);
        setSuccess('Hackathon moved to archive.');
        loadHackathons();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to archive hackathon.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this hackathon? Only allowed if zero registrations.')) {
      try {
        await hackathonApi.delete(id);
        setSuccess('Hackathon deleted.');
        loadHackathons();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Manage Hackathons</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish competitions, configure department/batch eligibility, and track entries.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Hackathon</span>
        </button>
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

      {/* Hackathons Table / Cards */}
      <div className="devfolio-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Hackathon</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Registrations</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading hackathon database...
                  </td>
                </tr>
              ) : hackathons.length > 0 ? (
                hackathons.map((h) => {
                  const deadline = new Date(h.registrationDeadline).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={h.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-white block">{h.title}</span>
                        <span className="text-[11px] text-slate-400">{h.organizer}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold">
                          {h.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px]">{deadline}</td>
                      <td className="px-6 py-4">
                        {h.status === 'PUBLISHED' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                            PUBLISHED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-semibold">
                            ARCHIVED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/registrations?hackathonId=${h.id}`}
                          className="inline-flex items-center space-x-1.5 text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{h.registrationCount || 0} Students</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(h)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {h.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleArchive(h.id)}
                            className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg hover:bg-amber-500/10"
                            title="Archive Hackathon"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10"
                          title="Delete (only if 0 registrations)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No hackathons found. Click "Publish New Hackathon" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101522] border border-[#1f293d] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              {editingId ? 'Edit Hackathon Specifications' : 'Publish New Hackathon'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Configure competition metadata and fine-grained student eligibility rules.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Title & Organizer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hackathon Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. KPIT K-IMPACT 2.0"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Organizer / Company <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="e.g. KPIT Technologies"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline problem statements, challenge scope, and expectations..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Category & Registration URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. AI/ML, Web3, Open Innovation"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Official Registration URL <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    placeholder="https://organizer.com/register"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Deadlines & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Registration Deadline <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.registrationDeadline}
                    onChange={(e) =>
                      setFormData({ ...formData, registrationDeadline: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Event Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Team Size, Prize Info, Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Team Size</label>
                  <input
                    type="text"
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    placeholder="e.g. 2-4 Members"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prize Info</label>
                  <input
                    type="text"
                    value={formData.prizeInfo}
                    onChange={(e) => setFormData({ ...formData, prizeInfo: e.target.value })}
                    placeholder="e.g. ₹1,00,000 Cash Pool"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Eligibility Criteria Matrix */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
                <span className="font-bold text-blue-400 block uppercase tracking-wider text-[11px]">
                  Eligibility Rules (Automated Filter)
                </span>

                {/* Departments Multi-Select */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-300 font-semibold">Eligible Departments</span>
                    <span className="text-[10px] text-slate-500">Empty = Open to ALL branches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DEPARTMENTS.map((dept) => {
                      const selected = formData.allowedDepartments.includes(dept);
                      return (
                        <button
                          type="button"
                          key={dept}
                          onClick={() => toggleDepartment(dept)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                            selected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {dept}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Batches Multi-Select */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-300 font-semibold">Graduation Batches</span>
                    <span className="text-[10px] text-slate-500">Empty = Open to ALL batches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {BATCHES.map((b) => {
                      const selected = formData.allowedBatches.includes(b);
                      return (
                        <button
                          type="button"
                          key={b}
                          onClick={() => toggleBatch(b)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                            selected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {b} Batch
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Gender Eligibility */}
                <div>
                  <span className="text-slate-300 font-semibold block mb-1.5">Gender Criteria</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'ALL', label: 'Everyone' },
                      { val: 'FEMALE', label: 'Women Only' },
                      { val: 'MALE', label: 'Men Only' },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.val}
                        onClick={() =>
                          setFormData({ ...formData, allowedGender: opt.val as GenderEligibility })
                        }
                        className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                          formData.allowedGender === opt.val
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Additional Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Special guidelines, repo formats, PPT submission templates..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50"
                >
                  {submitting
                    ? 'Publishing...'
                    : editingId
                    ? 'Update Hackathon'
                    : 'Publish Hackathon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
