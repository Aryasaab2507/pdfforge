'use client';
import { useCallback } from 'react';
import { Images } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import { imagesToPDF } from '@/lib/pdf/engine';
import type { UploadFile } from '@/components/ui/UploadZone';

export default function JPGToPDFPage() {
  const processFiles = useCallback(async (files: UploadFile[]): Promise<UploadFile[]> => {
    const imageFiles = files.map(f => f.file);
    const result = await imagesToPDF(imageFiles);
    if (result.success && result.data) {
      return files.map((f, i) => ({
        ...f, status: 'done' as const, progress: 100,
        resultBuffer: i === 0 ? result.data : undefined,
        resultName: i === 0 ? 'converted.pdf' : undefined,
      }));
    }
    return files.map(f => ({ ...f, status: 'error' as const, error: result.error }));
  }, []);

  return (
    <ToolPage
      title="JPG to PDF"
      description="Convert your images into a single PDF document. Supports JPG, PNG, and WebP."
      accept=".jpg,.jpeg,.png,.webp"
      multiple
      formats={['JPG', 'PNG', 'WEBP']}
      color="#16A34A"
      icon={<Images className="w-8 h-8" strokeWidth={1.6} />}
      processFiles={processFiles}
      actionLabel="Convert to PDF →"
    />
  );
}
