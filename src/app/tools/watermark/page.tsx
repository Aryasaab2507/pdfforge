'use client';
import { useState, useCallback } from 'react';
import { Stamp } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import { addWatermark } from '@/lib/pdf/engine';
import type { UploadFile } from '@/components/ui/UploadZone';

export default function WatermarkPage() {
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(30);
  const [position, setPosition] = useState<'center' | 'diagonal'>('diagonal');
  const [color, setColor] = useState('#E8392A');

  const processFiles = useCallback(async (files: UploadFile[]): Promise<UploadFile[]> => {
    const results: UploadFile[] = [];
    for (const f of files) {
      const buf = await f.file.arrayBuffer();
      const result = await addWatermark(buf, {
        watermarkText: text,
        watermarkOpacity: opacity / 100,
        watermarkPosition: position,
        watermarkColor: color,
        watermarkFontSize: 52,
      });
      if (result.success && result.data) {
        results.push({ ...f, status: 'done' as const, progress: 100, resultBuffer: result.data, resultName: `watermarked-${f.file.name}` });
      } else {
        results.push({ ...f, status: 'error' as const, error: result.error });
      }
    }
    return results;
  }, [text, opacity, position, color]);

  const options = (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-ink-3 mb-1.5 block">Watermark text</label>
        <input value={text} onChange={e => setText(e.target.value)}
          className="w-full h-10 px-3 border border-surface-3 rounded-lg text-sm focus:outline-none focus:border-brand"
          placeholder="CONFIDENTIAL" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-ink-3 mb-1.5 block">Position</label>
          <div className="flex gap-2">
            {(['center', 'diagonal'] as const).map(p => (
              <button key={p} onClick={() => setPosition(p)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all capitalize ${position === p ? 'bg-brand text-white border-brand' : 'bg-white border-surface-3 hover:border-brand/30'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-ink-3 mb-1.5 block">Color</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="w-full h-10 px-2 border border-surface-3 rounded-lg cursor-pointer" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-ink-3 mb-1.5 block">Opacity: {opacity}%</label>
        <input type="range" min={10} max={80} value={opacity} onChange={e => setOpacity(Number(e.target.value))}
          className="w-full accent-brand" />
      </div>
    </div>
  );

  return (
    <ToolPage
      title="Add Watermark"
      description="Stamp text watermarks across all pages of your PDF document."
      accept=".pdf"
      multiple
      color="#2563EB"
      icon={<Stamp className="w-8 h-8" strokeWidth={1.6} />}
      options={options}
      processFiles={processFiles}
      actionLabel="Add Watermark →"
    />
  );
}
