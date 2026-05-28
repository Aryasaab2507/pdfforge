'use client';
import { useState, useCallback } from 'react';
import { RotateCw } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import { rotatePDF } from '@/lib/pdf/engine';
import type { UploadFile } from '@/components/ui/UploadZone';

export default function RotatePage() {
  const [angle, setAngle] = useState<90 | 180 | 270>(90);

  const processFiles = useCallback(async (files: UploadFile[]): Promise<UploadFile[]> => {
    const results: UploadFile[] = [];
    for (const f of files) {
      const buf = await f.file.arrayBuffer();
      const result = await rotatePDF(buf, { rotationAngle: angle, rotateAll: true });
      if (result.success && result.data) {
        results.push({ ...f, status: 'done' as const, progress: 100, resultBuffer: result.data, resultName: `rotated-${f.file.name}` });
      } else {
        results.push({ ...f, status: 'error' as const, error: result.error });
      }
    }
    return results;
  }, [angle]);

  const options = (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-ink">Rotation angle</p>
      <div className="flex gap-3">
        {([90, 180, 270] as const).map(a => (
          <button key={a} onClick={() => setAngle(a)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${angle === a ? 'bg-brand text-white border-brand' : 'bg-white border-surface-3 hover:border-brand/40'}`}>
            {a}°
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <ToolPage
      title="Rotate PDF"
      description="Rotate pages in your PDF document. Choose 90°, 180°, or 270° rotation."
      accept=".pdf"
      multiple
      color="#D97706"
      icon={<RotateCw className="w-8 h-8" strokeWidth={1.6} />}
      options={options}
      processFiles={processFiles}
      actionLabel="Rotate PDF →"
    />
  );
}
