'use client';
import { useCallback } from 'react';
import { Combine } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import { mergePDFs } from '@/lib/pdf/engine';
import type { UploadFile } from '@/components/ui/UploadZone';

export default function MergePage() {
  const processFiles = useCallback(async (files: UploadFile[]): Promise<UploadFile[]> => {
    const buffers: ArrayBuffer[] = [];

    for (const f of files) {
      const buf = await f.file.arrayBuffer();
      buffers.push(buf);
    }

    const result = await mergePDFs(buffers);

    if (result.success && result.data) {
      return files.map((f, i) => ({
        ...f,
        status: 'done' as const,
        progress: 100,
        resultBuffer: i === 0 ? result.data : undefined,
        resultName: i === 0 ? (result.filename || 'merged.pdf') : undefined,
      }));
    }

    return files.map(f => ({ ...f, status: 'error' as const, error: result.error || 'Failed' }));
  }, []);

  return (
    <ToolPage
      title="Merge PDF"
      description="Combine multiple PDF files into one document. Drag to reorder pages before merging."
      accept=".pdf"
      multiple
      formats={['PDF']}
      color="#E8392A"
      icon={<Combine className="w-8 h-8" strokeWidth={1.6} />}
      processFiles={processFiles}
      actionLabel="Merge PDFs →"
    />
  );
}
