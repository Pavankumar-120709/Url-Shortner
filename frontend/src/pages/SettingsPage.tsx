import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import { Settings, Globe, Key, Check } from 'lucide-react';

export default function SettingsPage() {
  const { success } = useToast();

  const [domain, setDomain] = useState('trim.ly');
  const [autoCopy, setAutoCopy] = useState(true);
  const [defaultExpiry, setDefaultExpiry] = useState('30'); // in days

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('trimly_default_domain', domain);
    localStorage.setItem('trimly_auto_copy', String(autoCopy));
    localStorage.setItem('trimly_default_expiry', defaultExpiry);
    success('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2 font-sans">
          <Settings className="w-8 h-8 text-indigo-500" />
          System Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure default dashboard parameters and customize user options.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile/General section */}
        <div className="p-6 rounded-2xl border border-border bg-slate-900/40 space-y-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            General Preferences
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Default Redirection Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-950 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Default Expiration Delay (Days)</label>
              <select
                value={defaultExpiry}
                onChange={(e) => setDefaultExpiry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-950 text-slate-300 focus:outline-none text-sm"
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="never">Never Expire</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-semibold text-slate-200">Auto-copy links on creation</p>
              <p className="text-xs text-slate-500">Copy shortened link directly to your system clipboard</p>
            </div>
            <button
              type="button"
              onClick={() => setAutoCopy(!autoCopy)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoCopy ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoCopy ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* API keys mockup */}
        <div className="p-6 rounded-2xl border border-border bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" />
              Developer API Keys
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-semibold border border-border">Sandbox</span>
          </div>
          
          <p className="text-xs text-slate-400">Generate secure integration keys to programmatically create short URLs from curl, scripts, or Slack integrations.</p>

          <div className="p-3 rounded-xl bg-slate-950 border border-border flex items-center justify-between font-mono text-xs text-slate-500">
            <span>tmly_live_920fba8c173c2a4d339b1a5e...</span>
            <button
              type="button"
              onClick={() => success('Sandbox API key copied')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold uppercase text-[10px] tracking-wider"
            >
              Copy Key
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/10 transition-all active:scale-95"
          >
            <Check className="w-4.5 h-4.5" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
