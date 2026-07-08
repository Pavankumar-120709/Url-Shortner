import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  useUrlsQuery, 
  useCreateUrlMutation, 
  useUpdateUrlMutation, 
  useDeleteUrlMutation 
} from '../hooks/useUrls';
import { useToast } from '../components/Toast';
import QrCodeModal from '../components/QrCodeModal';
import BulkCreateModal from '../components/BulkCreateModal';
import { 
  PlusCircle, Search, Copy, Check, QrCode, Edit2, Trash2, 
  Layers, ExternalLink, Calendar, HelpCircle, Shield, ChevronLeft, ChevronRight, RefreshCw 
} from 'lucide-react';
import { formatDate } from '../lib/utils';

// Zod Validation Schema
const urlSchema = z.object({
  originalUrl: z.string().url('Must be a valid absolute URL (starting with http/https)'),
  customAlias: z.string()
    .max(50, 'Must be under 50 characters')
    .regex(/^[a-zA-Z0-9-_]*$/, 'Only letters, numbers, hyphens, and underscores are allowed')
    .optional()
    .or(z.literal('')),
  maxClicks: z.union([z.number().min(1, 'Must be at least 1'), z.nan()]).nullable().optional(),
  expiresAt: z.string().optional().or(z.literal('')),
  notes: z.string().max(250, 'Notes must be under 250 characters').optional()
});

type UrlFormValues = z.infer<typeof urlSchema>;

export default function UrlManagement() {
  const { success, error } = useToast();
  
  // Query and mutation hooks
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const { data, isLoading } = useUrlsQuery(search, page, 10, sortBy, sortDir);
  const createMutation = useCreateUrlMutation();
  const updateMutation = useUpdateUrlMutation();
  const deleteMutation = useDeleteUrlMutation();

  // Modals and form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<any | null>(null);
  
  const [activeQrUrl, setActiveQrUrl] = useState<{ url: string; code: string } | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UrlFormValues>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      originalUrl: '',
      customAlias: '',
      maxClicks: null,
      expiresAt: '',
      notes: ''
    }
  });

  const onSubmit = (values: UrlFormValues) => {
    // Standardize input fields
    const formattedData = {
      originalUrl: values.originalUrl,
      customAlias: values.customAlias || undefined,
      maxClicks: typeof values.maxClicks === 'number' ? values.maxClicks : null,
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
      notes: values.notes || undefined
    };

    if (editingUrl) {
      updateMutation.mutate(
        { id: editingUrl.id, data: formattedData },
        {
          onSuccess: () => {
            success('Link updated successfully!');
            closeForm();
          },
          onError: (err) => error(err.message || 'Failed to update link')
        }
      );
    } else {
      createMutation.mutate(formattedData, {
        onSuccess: () => {
          success('Short link generated!');
          closeForm();
        },
        onError: (err) => error(err.message || 'Failed to create link')
      });
    }
  };

  const openEdit = (url: any) => {
    setEditingUrl(url);
    setValue('originalUrl', url.originalUrl);
    setValue('customAlias', url.customAlias || '');
    setValue('maxClicks', url.maxClicks || null);
    setValue('notes', url.notes || '');
    if (url.expiresAt) {
      // Format LocalDateTime string "2026-07-08T23:36:29" to input "YYYY-MM-DDTHH:MM"
      setValue('expiresAt', url.expiresAt.substring(0, 16));
    } else {
      setValue('expiresAt', '');
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingUrl(null);
    reset();
    setIsFormOpen(false);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        success('Short link deleted');
        setDeleteConfirmId(null);
      },
      onError: (err) => error(err.message || 'Failed to delete link')
    });
  };

  const handleCopy = (id: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    success('Copied short URL');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to determine link status
  const getStatusBadge = (url: any) => {
    const now = new Date();
    if (url.expiresAt && new Date(url.expiresAt) < now) {
      return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-950/40 border border-red-500/30 text-red-400">Expired</span>;
    }
    if (url.maxClicks && url.clickCount >= url.maxClicks) {
      return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950/40 border border-amber-500/30 text-amber-400">Limit Reached</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">Active</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">URL Management</h1>
          <p className="text-slate-400 text-sm mt-1">Shorten new URLs, edit limitations, or download printable QR codes.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-all"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            Bulk Create
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Create URL
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/30 p-4 rounded-xl border border-border">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by code, url, or notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0); // Reset page on search change
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-slate-950 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-slate-950 text-slate-300 text-sm focus:outline-none"
          >
            <option value="createdAt">Date Created</option>
            <option value="clickCount">Click Volume</option>
            <option value="originalUrl">Destination URL</option>
          </select>
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-slate-950 text-slate-300 text-sm focus:outline-none"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="border border-border/80 bg-slate-900/20 rounded-2xl overflow-hidden shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 border-b border-border/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Short Code / Title</th>
                <th className="px-6 py-4 hidden md:table-cell">Destination URL</th>
                <th className="px-6 py-4 text-center">Clicks</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 hidden lg:table-cell">Expires At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24" /></td>
                    <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 bg-slate-800 rounded w-48" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-8 mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-16 mx-auto" /></td>
                    <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 bg-slate-800 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : data?.content && data.content.length > 0 ? (
                data.content.map((url) => (
                  <tr key={url.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5 select-all">
                        {url.customAlias || url.shortCode}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[180px] mt-0.5">{url.notes || 'No description notes'}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell max-w-sm truncate text-slate-400">
                      <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        <span className="truncate">{url.originalUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-200">
                      {url.clickCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(url)}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-slate-500 text-xs">
                      {url.expiresAt ? formatDate(url.expiresAt) : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopy(url.id, url.shortUrl)}
                          className="p-2 rounded-lg border border-border bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
                          title="Copy Link"
                        >
                          {copiedId === url.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setActiveQrUrl({ url: url.shortUrl, code: url.customAlias || url.shortCode })}
                          className="p-2 rounded-lg border border-border bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
                          title="QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(url)}
                          className="p-2 rounded-lg border border-border bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteConfirmId === url.id ? (
                          <div className="flex items-center gap-1 bg-red-950 border border-red-500/30 rounded-lg p-1 animate-fade-in">
                            <button
                              onClick={() => handleDelete(url.id)}
                              className="px-2 py-1 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(url.id)}
                            className="p-2 rounded-lg border border-red-950/40 bg-red-950/10 hover:bg-red-950/50 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500">
                    No shortened URLs found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/80 px-6 py-4 bg-slate-950/40 text-sm text-slate-400">
            <div>
              Showing page <span className="font-semibold text-slate-200">{page + 1}</span> of <span className="font-semibold text-slate-200">{data.totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-border bg-slate-950 hover:bg-slate-800 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                disabled={page === data.totalPages - 1}
                className="p-2 rounded-lg border border-border bg-slate-950 hover:bg-slate-800 disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog for Create & Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-xl font-bold text-slate-100">{editingUrl ? 'Modify Short URL' : 'Generate Short URL'}</h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Destination URL *</label>
                <input
                  type="url"
                  placeholder="https://my-long-website-link.com/articles/spring-boot"
                  {...register('originalUrl')}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                />
                {errors.originalUrl && <p className="text-red-400 text-xs mt-1">{errors.originalUrl.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Custom Alias (Optional)</label>
                  <input
                    type="text"
                    placeholder="my-cool-link"
                    {...register('customAlias')}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                  {errors.customAlias && <p className="text-red-400 text-xs mt-1">{errors.customAlias.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Click Limit (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    {...register('maxClicks', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                  {errors.maxClicks && <p className="text-red-400 text-xs mt-1">{errors.maxClicks.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Expiration Date (Optional)</label>
                <input
                  type="datetime-local"
                  {...register('expiresAt')}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-950 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                />
                {errors.expiresAt && <p className="text-red-400 text-xs mt-1">{errors.expiresAt.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Notes / Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Internal marketing link"
                  {...register('notes')}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                />
                {errors.notes && <p className="text-red-400 text-xs mt-1">{errors.notes.message}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-xl border border-border text-slate-300 hover:bg-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : editingUrl ? (
                    'Save Changes'
                  ) : (
                    'Create Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {activeQrUrl && (
        <QrCodeModal
          isOpen={!!activeQrUrl}
          onClose={() => setActiveQrUrl(null)}
          shortUrl={activeQrUrl.url}
          shortCode={activeQrUrl.code}
        />
      )}

      {isBulkOpen && (
        <BulkCreateModal
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
        />
      )}
    </div>
  );
}

// Inline replacement for X icon to keep standalone code tidy
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
