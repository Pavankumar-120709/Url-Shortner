import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link2, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      {/* Dynamic graphic animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-5 rounded-2xl bg-red-950/20 border border-red-500/20 text-red-400 mb-8 shadow-2xl relative"
      >
        <AlertTriangle className="w-16 h-16" />
        <div className="absolute -inset-1 bg-red-500/10 rounded-2xl blur-lg -z-10" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-5xl font-black text-white leading-tight"
      >
        404 - Page Not Found
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-slate-400 text-sm max-w-sm mt-3 mb-8 leading-relaxed"
      >
        The page you are looking for does not exist, or the shortened link has expired or been removed by its owner.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-border hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Safety
        </Link>
      </motion.div>
    </div>
  );
}
