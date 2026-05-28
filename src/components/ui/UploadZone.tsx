'use client';
import { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn, formatFileSize, generateId } from '@/lib/utils';
import { Button } from './Button';

export interface UploadFile {
  id: string;
  file: File;
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: number;
  error?: string;
  resultBuffer?: ArrayBuffer;
  resultName?: string;
}

interface UploadZoneProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // MB
  label?: string;
  sublabel?: string;
  formats?: string[];
  variant?: 'light' | 'dark';
  onFilesSelected: (files: UploadFile[]) => void;
  className?: string;
}

export function UploadZone({
  accept = '.pdf',
  multiple = false,
  maxSize = 50,
  label = 'Click to upload or drag & drop',
  sublabel,
  formats = ['PDF'],
  variant = 'light',
  onFilesSelected,
  className,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((rawFiles: FileList | null) => {
    if (!rawFiles?.length) return;
    const files: UploadFile[] = Array.from(rawFiles).map(file => ({
      id: generateId(),
      file,
      status: 'idle',
      progress: 0,
    }));
    onFilesSelected(files);
  }, [onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const dark = variant === 'dark';

  return (
    <motion.div
      className={cn(
        'relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer group',
        dark
          ? 'border-editor-border2 bg-editor-surface hover:border-brand/60 hover:bg-brand/5'
          : 'border-surface-3 bg-white hover:border-brand/50 hover:bg-brand-light/40',
        isDragging && (dark ? 'border-brand bg-brand/5 upload-pulse' : 'border-brand bg-brand-light upload-pulse'),
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
      />

      <div className="flex flex-col items-center justify-center py-14 px-8 text-center pointer-events-none">
        {/* Icon */}
        <motion.div
          className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center mb-5',
            dark ? 'bg-brand/15' : 'bg-brand-light'
          )}
          animate={isDragging ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Upload className="w-8 h-8 text-brand" strokeWidth={1.6} />
        </motion.div>

        {/* Text */}
        <p className={cn('text-base font-medium mb-1', dark ? 'text-editor-text' : 'text-ink')}>
          {isDragging ? 'Drop file here' : label}
        </p>
        {sublabel && (
          <p className={cn('text-sm', dark ? 'text-editor-text3' : 'text-ink-3')}>
            {sublabel}
          </p>
        )}
        <p className={cn('text-xs mt-2', dark ? 'text-editor-text3' : 'text-ink-3')}>
          Max {maxSize} MB
        </p>

        {/* Format pills */}
        <div className="flex gap-2 mt-4 flex-wrap justify-center">
          {formats.map(fmt => (
            <span
              key={fmt}
              className={cn(
                'text-[11px] font-semibold px-2.5 py-1 rounded-md border',
                dark
                  ? 'bg-editor-surface2 border-editor-border2 text-editor-text3'
                  : 'bg-surface-2 border-surface-3 text-ink-3'
              )}
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── File List Item ──
export function FileItem({
  file,
  onRemove,
  dark = false,
}: {
  file: UploadFile;
  onRemove?: () => void;
  dark?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border',
        dark ? 'bg-editor-surface border-editor-border' : 'bg-surface-2 border-surface-3'
      )}
    >
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', dark ? 'bg-brand/15' : 'bg-brand-light')}>
        {file.status === 'done' ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : file.status === 'error' ? (
          <AlertCircle className="w-5 h-5 text-red-400" />
        ) : file.status === 'processing' ? (
          <Loader2 className="w-5 h-5 text-brand animate-spin" />
        ) : (
          <FileText className="w-5 h-5 text-brand" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', dark ? 'text-editor-text' : 'text-ink')}>
          {file.file.name}
        </p>
        <p className={cn('text-xs', dark ? 'text-editor-text3' : 'text-ink-3')}>
          {formatFileSize(file.file.size)}
          {file.status === 'done' && file.resultName && (
            <span className="ml-1 text-green-500">→ {file.resultName}</span>
          )}
          {file.error && <span className="ml-1 text-red-400">{file.error}</span>}
        </p>

        {file.status === 'processing' && (
          <div className={cn('w-full h-1 rounded-full mt-1.5', dark ? 'bg-editor-border2' : 'bg-surface-3')}>
            <motion.div
              className="h-full rounded-full bg-brand"
              initial={{ width: '0%' }}
              animate={{ width: `${file.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      {onRemove && file.status !== 'processing' && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className={cn('w-7 h-7 rounded-md flex items-center justify-center transition-colors', dark ? 'hover:bg-editor-border2 text-editor-text3' : 'hover:bg-surface-3 text-ink-3')}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
