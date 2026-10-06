import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { User } from '../types';
import { Users, Search, Filter, Mail, Building2, Calendar } from 'lucide-react';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<
    Array<User & { registrationsCount: number; feedbackCount: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [batch, setBatch] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getStudents({
        page,
        limit: 10,
        search: search.trim() || undefined,
        department: department !== 'ALL' ? department : undefined,
        batch: batch !== 'ALL' ? batch : undefined,
      });
      setStudents(data.students);
      setTotalPages(data.pagination.totalPages);
      setTotalStudents(data.pagination.total);
    } catch (e) {
      console.error('Failed to load students directory', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [page, department, batch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadStudents();
  };

  const departments = ['ALL', 'ISE', 'CSE', 'AIML', 'AIDS', 'ECE', 'EEE', 'ME', 'CIVIL'];
  const batches = ['ALL', '2025', '2026', '2027', '2028', '2029'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>NMIT Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Student Directory</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse verified NMIT undergraduate accounts and track hackathon participation volume.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400">Total Enrolled: </span>
          <strong className="text-white text-sm">{totalStudents} Students</strong>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="devfolio-card p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, USN, or college email..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium shrink-0">Department:</span>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-white focus:outline-none w-full"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium shrink-0">Graduation Batch:</span>
            <select
              value={batch}
              onChange={(e) => {
                setBatch(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-white focus:outline-none w-full"
            >
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b === 'ALL' ? 'All Batches' : `${b} Batch`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="devfolio-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">USN</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Year & Batch</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Registrations</th>
                <th className="px-6 py-4">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading student directory...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-white block">{st.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{st.email}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-white">{st.usn}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {st.department || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 block">{st.currentYear}th Year</span>
                      <span className="text-[11px] text-slate-500">{st.graduationYear} Batch</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 capitalize">
                      {st.gender?.toLowerCase() || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-400">{st.registrationsCount}</span>{' '}
                      <span className="text-slate-500">events</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-400">{st.feedbackCount}</span>{' '}
                      <span className="text-slate-500">reviews</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No students found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
    </div>
  );
};
