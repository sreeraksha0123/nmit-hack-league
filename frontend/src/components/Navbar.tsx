import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  Compass,
  Trophy,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Users,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0d14]/90 backdrop-blur-md border-b border-[#1f293d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center p-1 group-hover:border-blue-400 transition-all">
              <img src="/logo-shield.svg" alt="NMIT Hack League" className="h-7 w-7" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  NMIT HACK LEAGUE
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  V1
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wide font-medium">
                Nitte Meenakshi Institute of Technology
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {/* Public Links */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-white bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/hackathons"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/hackathons')
                      ? 'text-white bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  Explore Hackathons
                </Link>
              </>
            )}

            {/* Student Navigation */}
            {isStudent && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-white bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/hackathons"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/hackathons')
                      ? 'text-white bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Opportunities</span>
                </Link>
                <Link
                  to="/my-hackathons"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/my-hackathons')
                      ? 'text-white bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>My Hackathons</span>
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/profile')
                      ? 'text-white bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Profile</span>
                </Link>
              </>
            )}

            {/* Administrator Navigation */}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'text-white bg-blue-600/20 text-blue-300'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-blue-400" />
                  <span>Admin Overview</span>
                </Link>
                <Link
                  to="/admin/hackathons"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/hackathons')
                      ? 'text-white bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-indigo-400" />
                  <span>Manage Hackathons</span>
                </Link>
                <Link
                  to="/admin/students"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/students')
                      ? 'text-white bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Students</span>
                </Link>
                <Link
                  to="/admin/feedback"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/feedback')
                      ? 'text-white bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Feedback</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg shadow-sm hover:shadow-blue-500/25 transition-all flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Join Club</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                    {user?.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {user?.role === 'ADMIN' ? 'Administrator' : user?.usn}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0d14] border-b border-[#1f293d] px-4 pt-2 pb-6 space-y-2">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
              >
                Home
              </Link>
              <Link
                to="/hackathons"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
              >
                Explore Hackathons
              </Link>
              <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 rounded-lg bg-slate-800 text-white font-medium text-sm"
                >
                  Student Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm"
                >
                  Sign Up (NMIT Students)
                </Link>
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Admin Portal →
                </Link>
              </div>
            </>
          ) : (
            <>
              {isStudent && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/hackathons"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
                  >
                    Opportunities
                  </Link>
                  <Link
                    to="/my-hackathons"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
                  >
                    My Hackathons
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
                  >
                    Profile
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-400 hover:bg-slate-800"
                  >
                    Admin Overview
                  </Link>
                  <Link
                    to="/admin/hackathons"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
                  >
                    Manage Hackathons
                  </Link>
                  <Link
                    to="/admin/students"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
                  >
                    Student Directory
                  </Link>
                  <Link
                    to="/admin/feedback"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
                  >
                    Feedback Logs
                  </Link>
                </>
              )}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between px-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{user?.name}</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {user?.role === 'ADMIN' ? 'Administrator' : user?.usn}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
