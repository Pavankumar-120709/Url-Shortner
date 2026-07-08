import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboardStatsQuery } from '../hooks/useAnalytics';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Link2, MousePointerClick, Calendar, Globe, AlertTriangle, Layers, QrCode, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function Dashboard() {
  const { data: stats, isLoading, isError, error } = useDashboardStatsQuery();

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/20 text-red-200 inline-block">
          <p className="font-bold">Error loading dashboard statistics</p>
          <p className="text-sm mt-1">{error?.message || 'Please check your backend connection.'}</p>
        </div>
      </div>
    );
  }

  // Card Skeleton Loader
  const CardSkeleton = () => (
    <div className="p-6 rounded-2xl border border-border bg-slate-900/40 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-1/3 h-4 bg-slate-800 rounded" />
        <div className="w-8 h-8 bg-slate-800 rounded-lg" />
      </div>
      <div className="w-1/2 h-8 bg-slate-800 rounded" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">System Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time statistics and overview of link actions.</p>
        </div>
        <Link
          to="/urls"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-sm"
        >
          Manage Short Links
          <ArrowUpRight className="w-4.5 h-4.5" />
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            {/* Total Links */}
            <div className="p-6 rounded-2xl border border-border bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-sm font-semibold">Total Links</span>
                <Layers className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.totalLinks}</p>
            </div>

            {/* Total Clicks */}
            <div className="p-6 rounded-2xl border border-border bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-sm font-semibold">Total Clicks</span>
                <MousePointerClick className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.totalClicks}</p>
            </div>

            {/* Today Clicks */}
            <div className="p-6 rounded-2xl border border-border bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-sm font-semibold">Today's Clicks</span>
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.todayClicks}</p>
            </div>

            {/* Monthly Clicks */}
            <div className="p-6 rounded-2xl border border-border bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-sm font-semibold">Monthly Clicks</span>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.monthlyClicks}</p>
            </div>

            {/* Active Links */}
            <div className="p-6 rounded-2xl border border-border bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-sm font-semibold">Active Links</span>
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.activeLinks}</p>
            </div>

            {/* Expired Links */}
            <div className="p-6 rounded-2xl border border-border bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-sm font-semibold">Expired/Limit Reached</span>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.expiredLinks}</p>
            </div>

            {/* QRs Generated */}
            <div className="p-6 rounded-2xl border border-border bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-sm font-semibold">QR Codes Generated</span>
                <QrCode className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.qrCodesGenerated}</p>
            </div>

            {/* Most Visited Link */}
            <div className="p-6 rounded-2xl border border-border bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-800 transition-all col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-sm font-semibold">Top Performing Link</span>
                <Link2 className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-lg font-bold text-white truncate max-w-xs">{stats?.mostVisitedLinkCode}</p>
              <p className="text-xs text-slate-400 mt-1">Clicks: <span className="font-semibold text-cyan-400">{stats?.mostVisitedLinkClicks}</span></p>
            </div>
          </>
        )}
      </div>

      {/* Main Charts & Activity Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Clicks Overview Graph */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-slate-900/40 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Clicks Over Time</h2>
              <p className="text-xs text-slate-400">Visitor clicks aggregated per calendar day</p>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View Detailed Analytics
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="w-full h-64 mt-2">
            {isLoading ? (
              <div className="w-full h-full bg-slate-950/40 rounded-xl animate-pulse" />
            ) : stats?.clicksPerDay && stats.clicksPerDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.clicksPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="value" name="Clicks" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-slate-500 text-sm">
                No visitor activity logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="p-6 rounded-2xl border border-border bg-slate-900/40 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Recent Activity</h2>
            <p className="text-xs text-slate-400">Latest visitor clicks logged across all links</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-64 space-y-3 pr-1">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950/20 border border-border animate-pulse flex items-center justify-between">
                  <div className="space-y-1 w-2/3">
                    <div className="h-4 bg-slate-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-800 rounded w-1/3" />
                  </div>
                  <div className="h-3 bg-slate-800 rounded w-1/4" />
                </div>
              ))
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="p-3 rounded-xl bg-slate-950/20 border border-border hover:border-slate-800 hover:bg-slate-950/60 transition-colors flex items-center justify-between text-sm gap-2">
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate">{activity.ipAddress}</p>
                    <p className="text-xs text-slate-500 truncate">{activity.browser} on {activity.operatingSystem}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">{activity.country}</span>
                    <p className="text-[10px] text-slate-600 mt-1">{formatDate(activity.visitedAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm py-12 border border-dashed border-border rounded-xl">
                No activity logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
