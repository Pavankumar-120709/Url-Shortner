import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Link2, BarChart3, Settings, Layers, PlusCircle, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Layers },
    { to: '/urls', label: 'My Links', icon: Link2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                <Link2 className="w-6 h-6 rotate-45" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 light:from-slate-900 light:to-slate-700 font-sans">
                Trimly
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-1 pt-1 text-sm font-semibold border-b-2 transition-all duration-200 ${
                        isActive
                          ? 'border-indigo-500 text-indigo-400 light:text-indigo-600'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700 light:hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/urls"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              New Link
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-border/80 bg-secondary/30 hover:bg-secondary/80 text-slate-400 hover:text-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/50 bg-background/95 backdrop-blur-lg">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-base font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600/10 text-indigo-400'
                        : 'text-slate-400 hover:bg-secondary/40 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </NavLink>
              );
            })}
            <div className="px-3 py-2 pt-4 border-t border-border/40">
              <Link
                to="/urls"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              >
                <PlusCircle className="w-5 h-5" />
                New Link
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
