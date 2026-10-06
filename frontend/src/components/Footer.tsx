import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, Github, Linkedin, Twitter, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#080b11] border-t border-[#1f293d] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info with official NMIT banner */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/logo-shield.svg" alt="NMIT Hack League" className="h-8 w-8" />
              <span className="font-extrabold text-lg tracking-tight text-white">
                NMIT HACK LEAGUE
              </span>
            </div>
            
            {/* Official NMIT Institution Tag */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 max-w-md">
              <img
                src="/nmit-logo.png"
                alt="Nitte Meenakshi Institute of Technology"
                className="h-9 w-auto object-contain filter brightness-105"
                onError={(e) => {
                  // Fallback to text if image fails to render
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <p className="text-xs text-slate-400 mt-1">
                Official Hackathon Club • Nitte Meenakshi Institute of Technology, Yelahanka, Bengaluru - 560064
              </p>
            </div>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Empowering students to build world-class technology solutions, compete in premier national & global hackathons, and accelerate their careers through innovation challenges.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/hackathons" className="hover:text-blue-400 transition-colors">
                  Explore Hackathons
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-blue-400 transition-colors">
                  New Student Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Connect & Admin</h4>
            <div className="flex items-center space-x-3 text-slate-400">
              <a
                href="https://github.com/sreeraksha0123/nmit-hack-league"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-all"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-all"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:hackleague@nmit.ac.in"
                className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-all"
                title="Email Hack League"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-3">
              <Link
                to="/admin/login"
                className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-300 py-1 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-slate-600" />
                <span>Coordinator / Admin Login</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#1f293d]/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NMIT Hack League. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">
            Designed for Nitte Meenakshi Institute of Technology
          </p>
        </div>
      </div>
    </footer>
  );
};
