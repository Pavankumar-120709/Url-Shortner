import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, RefreshCw } from 'lucide-react';
import { useToast } from './Toast';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  shortCode: string;
}

export default function QrCodeModal({ isOpen, onClose, shortUrl, shortCode }: QrCodeModalProps) {
  const { success, error } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const downloadQr = () => {
    try {
      const svgElement = qrRef.current?.querySelector('svg');
      if (!svgElement) throw new Error('SVG not found');

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `qr_${shortCode}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);

      success('QR Code downloaded successfully as SVG');
    } catch (err) {
      logError(err);
      error('Failed to download QR code');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shortUrl);
    success('Short URL copied to clipboard');
  };

  // Helper log function inside component scope
  function logError(e: unknown) {
    console.error(e);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-6">
          <h3 className="text-xl font-bold text-slate-100">QR Code Preview</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-6">
          <div
            ref={qrRef}
            className="p-4 rounded-2xl bg-white border-4 border-slate-700/30 flex items-center justify-center shadow-inner"
          >
            <QRCodeSVG
              value={shortUrl}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#0f172a"
              bgColor="#ffffff"
            />
          </div>

          <div className="w-full text-center">
            <p className="text-sm font-semibold text-indigo-400 select-all mb-1">{shortUrl}</p>
            <p className="text-xs text-slate-400">Scannable link for mobile access and print media</p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-slate-800 text-slate-200 text-sm font-medium transition-all"
            >
              <Copy className="w-4 h-4" />
              Copy URL
            </button>
            <button
              onClick={downloadQr}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/10"
            >
              <Download className="w-4 h-4" />
              Download SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
