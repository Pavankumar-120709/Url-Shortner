import React, { useState } from 'react';
import { useDashboardStatsQuery, useUrlStatsQuery } from '../hooks/useAnalytics';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { Globe, Chrome, Laptop, Share2, Award, Calendar, RefreshCw } from 'lucide-react';
import { useUrlsQuery } from '../hooks/useUrls';

const COLORS = [
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#64748b', // Slate
  '#ef4444'  // Red
];

export default function AnalyticsPage() {
  const [selectedShortCode, setSelectedShortCode] = useState<string>('global');
  
  // Queries
  const { data: globalStats, isLoading: isGlobalLoading } = useDashboardStatsQuery();
  const { data: urlStats, isLoading: isUrlLoading } = useUrlStatsQuery(selectedShortCode !== 'global' ? selectedShortCode : '');
  const { data: urlList } = useUrlsQuery('', 0, 50, 'createdAt', 'desc'); // Pull up to 50 URLs for dropdown selector

  const isLoading = selectedShortCode === 'global' ? isGlobalLoading : isUrlLoading;
  const stats = selectedShortCode === 'global' ? globalStats : urlStats;

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-2xl">
          <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
          <p className="text-sm font-extrabold text-indigo-400">
            Clicks: <span className="text-white">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-2xl">
          <p className="text-sm font-extrabold text-indigo-400">
            {payload[0].name}: <span className="text-white">{payload[0].value} ({payload[0].payload.percent || 0}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Convert distribution list to recharts format with helper percents
  const processPieData = (data: any[] | undefined) => {
    if (!data) return [];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({
      name: item.label || 'Other',
      value: item.value,
      percent: total > 0 ? Math.round((item.value / total) * 100) : 0
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header with Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">Granular Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Deep analysis of clicks, geographical sources, user browsers, and operating systems.</p>
        </div>

        {/* Dynamic selector to switch between all links and specific links */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">Filtering:</span>
          <select
            value={selectedShortCode}
            onChange={(e) => setSelectedShortCode(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-border bg-slate-900 text-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-xs"
          >
            <option value="global">All Links (Global)</option>
            {urlList?.content.map((url) => (
              <option key={url.id} value={url.customAlias || url.shortCode}>
                {url.customAlias || url.shortCode} ({url.notes || url.originalUrl.substring(0, 30)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Clicks per Day Area Chart */}
          <div className="p-6 rounded-2xl border border-border bg-slate-900/40 col-span-1 md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-100">Clicks Per Day Timeline</h2>
            </div>
            <div className="w-full h-72">
              {stats?.clicksPerDay && stats.clicksPerDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.clicksPerDay}>
                    <defs>
                      <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#64748b" tickLine={false} fontSize={11} />
                    <YAxis stroke="#64748b" tickLine={false} fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorArea)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full border border-dashed border-border rounded-xl flex items-center justify-center text-slate-500">
                  No clicks registered in the timeline.
                </div>
              )}
            </div>
          </div>

          {/* Country Distribution */}
          <div className="p-6 rounded-2xl border border-border bg-slate-900/40 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-100">Country Breakdown</h2>
            </div>
            <div className="w-full h-64">
              {stats?.countryDistribution && stats.countryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.countryDistribution} layout="vertical" margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} horizontal={false} />
                    <XAxis type="number" stroke="#64748b" tickLine={false} fontSize={11} />
                    <YAxis dataKey="label" type="category" stroke="#64748b" tickLine={false} fontSize={11} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full border border-dashed border-border rounded-xl flex items-center justify-center text-slate-500">
                  No country records found.
                </div>
              )}
            </div>
          </div>

          {/* Referrers Distribution */}
          <div className="p-6 rounded-2xl border border-border bg-slate-900/40 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-pink-400" />
              <h2 className="text-xl font-bold text-slate-100">Referrer Sources</h2>
            </div>
            <div className="w-full h-64">
              {stats?.referrerDistribution && stats.referrerDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.referrerDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                    <XAxis dataKey="label" stroke="#64748b" tickLine={false} fontSize={11} />
                    <YAxis stroke="#64748b" tickLine={false} fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full border border-dashed border-border rounded-xl flex items-center justify-center text-slate-500">
                  No referrer records found.
                </div>
              )}
            </div>
          </div>

          {/* Browser Distribution */}
          <div className="p-6 rounded-2xl border border-border bg-slate-900/40 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Chrome className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-100">Browser Distribution</h2>
            </div>
            <div className="w-full h-64 flex items-center justify-center">
              {stats?.browserDistribution && stats.browserDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processPieData(stats.browserDistribution)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {processPieData(stats.browserDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" fontSize={11} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full border border-dashed border-border rounded-xl flex items-center justify-center text-slate-500">
                  No browser records found.
                </div>
              )}
            </div>
          </div>

          {/* Device & OS side-by-side */}
          <div className="p-6 rounded-2xl border border-border bg-slate-900/40 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-slate-100">Devices & Platforms</h2>
            </div>
            <div className="w-full h-64 flex items-center justify-center">
              {stats?.deviceDistribution && stats.deviceDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processPieData(stats.deviceDistribution)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {processPieData(stats.deviceDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full border border-dashed border-border rounded-xl flex items-center justify-center text-slate-500">
                  No device records found.
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
