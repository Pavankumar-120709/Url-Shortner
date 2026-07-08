import React, { useState } from 'react';
import { X, Layers, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useCreateUrlsBulkMutation } from '../hooks/useUrls';
import { useToast } from './Toast';

interface BulkCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkCreateModal({ isOpen, onClose }: BulkCreateModalProps) {
  const { success, error } = useToast();
  const [urlsInput, setUrlsInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const bulkMutation = useCreateUrlsBulkMutation();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    // Split inputs by newline, filter empty lines
    const lines = urlsInput.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

    if (lines.length === 0) {
      setValidationErrors(['Please enter at least one URL.']);
      return;
    }

    // Simple URL regex validation
    const errorsList: string[] = [];
    const urlRequests = lines.map((line, idx) => {
      try {
        // Test URL validity
        new URL(line);
        return { originalUrl: line, notes: 'Bulk created link' };
      } catch (err) {
        errorsList.push(`Line ${idx + 1}: "${line}" is not a valid absolute URL.`);
        return null;
      }
    });

    if (errorsList.length > 0) {
      setValidationErrors(errorsList);
      return;
    }

    // Filter valid requests and execute
    const requests = urlRequests.filter((r) => r !== null) as { originalUrl: string; notes: string }[];
    
    bulkMutation.mutate(requests, {
      onSuccess: (data) => {
        success(`Successfully created ${data.length} short links in bulk!`);
        setUrlsInput('');
        onClose();
      },
      onError: (err) => {
        error(err.message || 'Failed to bulk create URLs.');
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-slate-100">Bulk Link Creator</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Enter Destination URLs (one per line)
            </label>
            <textarea
              value={urlsInput}
              onChange={(e) => setUrlsInput(e.target.value)}
              placeholder="https://example1.com&#10;https://example2.com/blog&#10;https://example3.org/docs"
              rows={6}
              className="w-full rounded-xl border border-border bg-slate-950 p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm leading-relaxed"
              disabled={bulkMutation.isPending}
            />
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-200 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                <AlertCircle className="w-4 h-4 text-red-400" />
                Input Errors Found
              </div>
              <ul className="list-disc list-inside text-xs text-red-300/90 max-h-24 overflow-y-auto space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-all"
              disabled={bulkMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
              disabled={bulkMutation.isPending}
            >
              {bulkMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Links'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
