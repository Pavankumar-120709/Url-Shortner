import React from 'react';
import { Link2, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400">
                <Link2 className="w-5 h-5 rotate-45" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-100 light:text-slate-800">
                Trimly
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs">
              SaaS URL shortener offering lightning-fast redirections, modern QR codes, and granular visitor analytics dashboards.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 light:text-slate-800 uppercase tracking-wider">Product</h3>
                <ul className="mt-4 space-y-3">
                  <li><Link to="/dashboard" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Analytics</Link></li>
                  <li><Link to="/urls" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Link Creator</Link></li>
                  <li><a href="#features" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Features</a></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-200 light:text-slate-800 uppercase tracking-wider">Resources</h3>
                <ul className="mt-4 space-y-3">
                  <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">API Docs</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Developer Portal</a></li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 light:text-slate-800 uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border/40 pt-8 flex items-center justify-between">
          <p className="text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} Trimly Technologies, Inc. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs flex items-center gap-1">
            Built with 💜 for developers.
          </p>
        </div>
      </div>
    </footer>
  );
}
