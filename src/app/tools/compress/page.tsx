'use client';
import { useState, useCallback } from 'react';
import { Minimize2 } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import { compressPDF } from '@/lib/pdf/engine';
import { formatFileSize } from '@/lib/utils';
import type { UploadFile } from '@/components/ui/UploadZone';

export default function CompressPage() {
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const processFiles = useCallback(async (files: UploadFile[]): Promise<UploadFile[]> => {
    const results: UploadFile[] = [];
    for (const f of files) {
      const buf = await f.file.arrayBuffer();
      const result = await compressPDF(buf, { compressionLevel: level });
      if (result.success && result.data) {
        const saved = buf.byteLength - result.data.byteLength;
        const pct = Math.round((saved / buf.byteLength) * 100);
        results.push({
          ...f, status: 'done' as const, progress: 100,
          resultBuffer: result.data,
          resultName: `compressed-${f.file.name}`,
          error: pct > 0 ? `Reduced by ${pct}% (${formatFileSize(saved)} saved)` : 'File already optimized',
        });
      } else {
        results.push({ ...f, status: 'error' as const, error: result.error || 'Compression failed' });
      }
    }
    return results;
  }, [level]);

  const levels = [
    { id: 'low', label: 'Low', desc: 'Best quality', color: 'text-green-600' },
    { id: 'medium', label: 'Medium', desc: 'Balanced', color: 'text-amber-600' },
    { id: 'high', label: 'High', desc: 'Max compression', color: 'text-red-500' },
  ];

  const options = (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-ink">Compression level</p>
      <div className="grid grid-cols-3 gap-3">
        {levels.map(l => (
          <button
            key={l.id}
            onClick={() => setLevel(l.id as 'low' | 'medium' | 'high')}
            className={`py-3 px-3 rounded-lg text-center border transition-all ${level === l.id ? 'bg-brand text-white border-brand' : 'bg-white border-surface-3 hover:border-brand/30'}`}
          >
            <p className="text-sm font-semibold">{l.label}</p>
            <p className={`text-xs ${level === l.id ? 'text-white/70' : l.color}`}>{l.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <ToolPage
      title="Compress PDF"
      description="Reduce your PDF file size while maintaining the best possible quality. Perfect for email and web."
      accept=".pdf"
      multiple
      color="#2563EB"
      icon={<Minimize2 className="w-8 h-8" strokeWidth={1.6} />}
      options={options}
      processFiles={processFiles}
      actionLabel="Compress PDF →"
    />
  );
}
