'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { cn, formatFileSize, downloadBlob, generateId } from '@/lib/utils';
import { UploadZone, FileItem, type UploadFile } from '@/components/ui/UploadZone';
import { Button } from '@/components/ui/Button';

interface ToolPageProps {
  title: string;
  description: string;
  accept?: string;
  multiple?: boolean;
  formats?: string[];
  color?: string;
  icon: React.ReactNode;
  options?: React.ReactNode;
  processFiles: (files: UploadFile[]) => Promise<UploadFile[]>;
  actionLabel?: string;
}

export function ToolPage({
  title,
  description,
  accept = '.pdf',
  multiple = false,
  formats = ['PDF'],
  color = '#E8392A',
  icon,
  options,
  processFiles,
  actionLabel = 'Process',
}: ToolPageProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [results, setResults] = useState<UploadFile[]>([]);

  const handleFilesSelected = useCallback((newFiles: UploadFile[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setIsDone(false);
    setResults([]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleProcess = useCallback(async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setIsDone(false);

    // Set all to processing
    setFiles(prev => prev.map(f => ({ ...f, status: 'processing', progress: 0 })));

    try {
      const processed = await processFiles(files);
      setResults(processed);
      setFiles(processed);
      setIsDone(true);
    } catch (err) {
      setFiles(prev => prev.map(f => ({ ...f, status: 'error', error: 'Processing failed' })));
    } finally {
      setIsProcessing(false);
    }
  }, [files, processFiles]);

  const handleDownloadAll = useCallback(() => {
    results.forEach(f => {
      if (f.resultBuffer && f.resultName) {
        downloadBlob(f.resultBuffer, f.resultName);
      }
    });
  }, [results]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setResults([]);
    setIsDone(false);
  }, []);

  const hasResults = results.some(r => r.resultBuffer);

  return (
    <div className="min-h-screen bg-surface py-16 px-6">
      <div className="max-w-[680px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: color + '20' }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          <h1 className="font-display font-extrabold text-[32px] tracking-tight text-ink mb-3">{title}</h1>
          <p className="text-[16px] text-ink-3 max-w-[440px] mx-auto leading-relaxed">{description}</p>
        </motion.div>

        {/* Upload zone */}
        {!isDone && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.08 } }}>
            <UploadZone
              accept={accept}
              multiple={multiple}
              formats={formats}
              onFilesSelected={handleFilesSelected}
              className="mb-4"
            />
          </motion.div>
        )}

        {/* File list */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 mb-4"
            >
              {files.map(f => (
                <FileItem
                  key={f.id}
                  file={f}
                  onRemove={!isProcessing && !isDone ? () => handleRemove(f.id) : undefined}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options */}
        {options && files.length > 0 && !isDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-surface-3 rounded-lg p-5 mb-4"
          >
            {options}
          </motion.div>
        )}

        {/* Actions */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            {!isDone ? (
              <Button
                variant="hero"
                size="lg"
                className="flex-1"
                loading={isProcessing}
                disabled={isProcessing || files.length === 0}
                onClick={handleProcess}
              >
                {isProcessing ? 'Processing...' : actionLabel}
                {!isProcessing && <ArrowRight className="w-4 h-4" />}
              </Button>
            ) : (
              <>
                {hasResults && (
                  <Button variant="hero" size="lg" className="flex-1" onClick={handleDownloadAll}>
                    <Download className="w-4 h-4" />
                    Download Result
                  </Button>
                )}
                <Button variant="outline" size="lg" onClick={handleReset}>
                  Process Another
                </Button>
              </>
            )}
          </motion.div>
        )}

        {/* Success banner */}
        <AnimatePresence>
          {isDone && hasResults && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Done! Your file is ready.</p>
                <p className="text-xs text-green-600 mt-0.5">Files are automatically deleted from our servers after 2 hours.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
          {[
            '🔒 256-bit SSL',
            '🗑️ Auto-deleted in 2h',
            '🔐 Never shared',
            '⚡ Instant processing',
          ].map(badge => (
            <span key={badge} className="text-[12px] text-ink-3 font-medium">{badge}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
