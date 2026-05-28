'use client';
import { useState, useCallback } from 'react';
import { Scissors } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import { splitPDF } from '@/lib/pdf/engine';
import type { UploadFile } from '@/components/ui/UploadZone';
import { downloadBlob } from '@/lib/utils';

export default function SplitPage() {
  const [mode, setMode] = useState<'every' | 'range'>('every');
  const [ranges, setRanges] = useState('1-3,4-6');

  const processFiles = useCallback(async (files: UploadFile[]): Promise<UploadFile[]> => {
    const f = files[0];
    const buf = await f.file.arrayBuffer();
    const results = await splitPDF(buf, { splitMode: mode, pageRanges: ranges });

    // Download all split files
    results.forEach((r, i) => {
      if (r.success && r.data) {
        setTimeout(() => downloadBlob(r.data!, r.filename || `part-${i+1}.pdf`), i * 200);
      }
    });

    return [{ ...f, status: 'done' as const, progress: 100, resultName: `${results.length} files` }];
  }, [mode, ranges]);

  const options = (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-ink">Split options</p>
      <div className="flex gap-3">
        {[{ id: 'every', label: 'Extract every page' }, { id: 'range', label: 'By page range' }].map(opt => (
          <button
            key={opt.id}
            onClick={() => setMode(opt.id as 'every' | 'range')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all ${mode === opt.id ? 'bg-brand text-white border-brand' : 'bg-white border-surface-3 text-ink-2 hover:border-brand/40'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {mode === 'range' && (
        <div>
          <label className="text-xs font-medium text-ink-3 mb-1.5 block">Page ranges (e.g. 1-3,4-6,7)</label>
          <input
            value={ranges}
            onChange={e => setRanges(e.target.value)}
            className="w-full h-10 px-3 border border-surface-3 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
            placeholder="1-3, 4-6, 7"
          />
        </div>
      )}
    </div>
  );

  return (
    <ToolPage
      title="Split PDF"
      description="Separate your PDF into multiple files. Extract every page or split by custom page ranges."
      accept=".pdf"
      color="#EA580C"
      icon={<Scissors className="w-8 h-8" strokeWidth={1.6} />}
      options={options}
      processFiles={processFiles}
      actionLabel="Split PDF →"
    />
  );
}
