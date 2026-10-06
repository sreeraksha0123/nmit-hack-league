import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Registration,
  ParticipationStatus,
  Hackathon,
  PARTICIPATION_STATUS_MAP,
} from '../types';
import { hackathonApi, registrationApi, participationApi } from '../services/api';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Edit2,
  Save,
  X,
  Trophy,
} from 'lucide-react';

export const AdminRegistrationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const hackathonIdParam = searchParams.get('hackathonId') || '';

  const [hackathonsList, setHackathonsList] = useState<Hackathon[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>(hackathonIdParam);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [hackathonDetails, setHackathonDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / row editing state
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [editStatus, setEditStatus] = useState<ParticipationStatus>('REGISTERED');
  const [editRound, setEditRound] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load hackathons list for dropdown selector
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const list = await hackathonApi.list({ status: 'ALL' });
        setHackathonsList(list);
        if (!selectedHackathonId && list.length > 0) {
          setSelectedHackathonId(list[0].id);
        }
      } catch (e) {
        console.error('Failed to load hackathons list', e);
      }
    };
    fetchHackathons();
  }, []);

  // Load registrations for selected hackathon
  const loadRegistrations = async () => {
    if (!selectedHackathonId) return;
    setLoading(true);
    try {
      const data = await registrationApi.getAdminRegistrations(selectedHackathonId, {
        page,
        limit: 10,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setRegistrations(data.registrations);
      setHackathonDetails(data.hackathon);
      setTotalPages(data.pagination.totalPages);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHackathonId) {
      loadRegistrations();
    }
  }, [selectedHackathonId, page, statusFilter]);

  const handleHackathonChange = (id: string) => {
    setSelectedHackathonId(id);
    setSearchParams({ hackathonId: id });
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRegistrations();
  };

  const startEdit = (reg: Registration) => {
    setEditingReg(reg);
    setEditStatus(reg.status);
    setEditRound(reg.round || '');
    setEditNotes(reg.adminNotes || '');
    setError(null);
    setSuccess(null);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;
    setSaving(true);
    setError(null);

    try {
      await participationApi.updateStatus(editingReg.id, {
        status: editStatus,
        round: editRound.trim() || undefined,
        adminNotes: editNotes.trim() || undefined,
      });
      setSuccess(`Updated status for ${editingReg.student?.name} to ${editStatus}`);
      setEditingReg(null);
      loadRegistrations();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update participation status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Participant Outcome Tracking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Student Registrations</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            View registered students, update round progressions, and acknowledge finalists & winners.
          </p>
        </div>

        {/* Hackathon Selector Dropdown */}
        <div className="w-full sm:w-72">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Select Hackathon
          </label>
          <select
            value={selectedHackathonId}
            onChange={(e) => handleHackathonChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            {hackathonsList.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title}
              </option>
            ))}
          </select>
        </div>
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

      {/* Search & Status Filters */}
      <div className="devfolio-card p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, USN, or email..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shrink-0"
          >
            Filter
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            'ALL',
            'REGISTERED',
            'PARTICIPATED',
            'ROUND_1',
            'ROUND_2',
            'FINALIST',
            'WINNER',
            'DID_NOT_PARTICIPATE',
          ].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap text-xs ${
                statusFilter === st
                  ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300 font-semibold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations Table */}
      <div className="devfolio-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">USN</th>
                <th className="px-6 py-4">Department & Batch</th>
                <th className="px-6 py-4">Participation Status</th>
                <th className="px-6 py-4">Current Round</th>
                <th className="px-6 py-4">Coordinator Notes</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading participants...
                  </td>
                </tr>
              ) : registrations.length > 0 ? (
                registrations.map((reg) => {
                  const statusMeta = PARTICIPATION_STATUS_MAP[reg.status] || {
                    label: reg.status,
                    bg: 'bg-slate-800',
                    text: 'text-slate-300',
                    border: 'border-slate-700',
                  };

                  return (
                    <tr key={reg.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-white block">{reg.student?.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {reg.student?.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-white">
                        {reg.student?.usn}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300 block">{reg.student?.department}</span>
                        <span className="text-[11px] text-slate-500">
                          {reg.student?.graduationYear} Batch
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusMeta.bg} ${statusMeta.text} border ${statusMeta.border}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                        {reg.round || '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">
                        {reg.adminNotes || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => startEdit(reg)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 hover:bg-blue-600/25 font-semibold transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Update</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No registrations found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
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

      {/* Edit Participation Status Modal */}
      {editingReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101522] border border-[#1f293d] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingReg(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Update Participation Status</h3>
            <p className="text-xs text-slate-400 mb-4">
              Student: <strong className="text-white">{editingReg.student?.name}</strong> (
              <span className="font-mono text-blue-400">{editingReg.student?.usn}</span>)
            </p>

            <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Participation Status <span className="text-rose-400">*</span>
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ParticipationStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="REGISTERED">REGISTERED</option>
                  <option value="PARTICIPATED">PARTICIPATED</option>
                  <option value="ROUND_1">ROUND_1 (Shortlisted)</option>
                  <option value="ROUND_2">ROUND_2 (Advanced)</option>
                  <option value="FINALIST">FINALIST (Top Placement)</option>
                  <option value="WINNER">WINNER 🏆</option>
                  <option value="DID_NOT_PARTICIPATE">DID_NOT_PARTICIPATE</option>
                  <option value="DISQUALIFIED">DISQUALIFIED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Round / Stage</label>
                <input
                  type="text"
                  value={editRound}
                  onChange={(e) => setEditRound(e.target.value)}
                  placeholder="e.g. Ideation Phase, Semi-Final, Grand Finale"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coordinator Notes</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Official comments visible to the student..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingReg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
