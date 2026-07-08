import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Sparkles, BarChart3, Shield, QrCode, Copy, Check, ArrowRight, HelpCircle } from 'lucide-react';
import { useCreateUrlMutation } from '../hooks/useUrls';
import { useToast } from '../components/Toast';

export default function LandingPage() {
  const { success, error } = useToast();
  const [urlInput, setUrlInput] = useState('');
  const [shortenedResult, setShortenedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createMutation = useCreateUrlMutation();

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault();
    setShortenedResult(null);

    if (!urlInput.trim()) return;

    createMutation.mutate(
      { originalUrl: urlInput.trim() },
      {
        onSuccess: (data) => {
          setShortenedResult(data.shortUrl);
          success('URL shortened successfully!');
        },
        onError: (err) => {
          error(err.message || 'Failed to shorten URL');
        },
      }
    );
  };

  const handleCopy = () => {
    if (!shortenedResult) return;
    navigator.clipboard.writeText(shortenedResult);
    setCopied(true);
    success('Short URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // FAQ item helper component
  const FaqItem = ({ q, a }: { q: string; a: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="border-b border-border/40 py-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between text-left font-semibold text-lg text-slate-100 hover:text-indigo-400 transition-colors"
        >
          <span>{q}</span>
          <HelpCircle className={`w-5 h-5 text-indigo-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-2 text-slate-400 text-sm leading-relaxed"
            >
              {a}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-grid-pattern pb-16">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-semibold mb-6"
        >
          <Sparkles className="w-4 h-4" />
          <span>Next-Generation Shortener Tool</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none mb-6 font-sans"
        >
          Shorten links. <br />
          <span className="text-gradient">Measure clicks.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-slate-400 text-lg sm:text-xl mb-10 leading-relaxed"
        >
          Trimly is a developer-first SaaS platform designed to condense long destination URLs, generate dynamic vector QR codes, and extract granular visitor analytics.
        </motion.p>

        {/* Shortener Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl border border-border/80 bg-slate-900/60 backdrop-blur-md shadow-2xl mb-20"
        >
          <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste your long destination URL here..."
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={createMutation.isPending}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95 shadow-lg shadow-indigo-500/20"
              disabled={createMutation.isPending}
            >
              Shorten URL
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Results Area */}
          <AnimatePresence>
            {shortenedResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 overflow-hidden"
              >
                <div className="flex items-center gap-2 select-all font-semibold text-indigo-400 text-base">
                  <Link2 className="w-5 h-5" />
                  {shortenedResult}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all w-full sm:w-auto justify-center"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto border-t border-border/40 pt-16">
          {[
            { value: '1M+', label: 'Links Shortened' },
            { value: '15M+', label: 'Clicks Processed' },
            { value: '99.99%', label: 'Uptime SLA' },
            { value: '< 50ms', label: 'Redirect Latency' },
          ].map((stat, idx) => (
            <div key={idx} className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-sans">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Full-featured link management</h2>
          <p className="text-slate-400 text-sm mt-3">Everything you need to deploy, share, and track URLs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: BarChart3,
              title: 'Detailed Analytics',
              desc: 'Log browser, device type, referrer networks, and city-level geolocations on every single click.',
            },
            {
              icon: QrCode,
              title: 'Dynamic QR Codes',
              desc: 'Instantly download vector format QR code graphics for banners, product packages, and flyers.',
            },
            {
              icon: Shield,
              title: 'Security Control',
              desc: 'Configure maximum click triggers, set dates to self-destruct links automatically, and prevent abuse.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl border border-border/60 bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Frequently Asked Questions</h2>
        <div className="space-y-1">
          <FaqItem
            q="Why should I use 302 Found redirects instead of 301 Moved Permanently?"
            a="301 redirects are heavily cached by client browsers, which means subsequent clicks bypass the redirection server entirely. Trimly uses 302/307 redirects to bypass cache and capture visit statistics for every click."
          />
          <FaqItem
            q="Can I specify customized aliases for short URLs?"
            a="Yes! You can enter alphanumeric aliases (including hyphens and underscores) during URL creation. If they are unique, they will be registered instantly."
          />
          <FaqItem
            q="How are QR code vector graphics generated?"
            a="QR codes are rendered client-side using scalable SVG elements. They look razor-sharp on high-density Retina screens and print media, and are lightweight to generate."
          />
        </div>
      </div>
    </div>
  );
}
