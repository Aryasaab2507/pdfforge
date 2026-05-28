'use client';
import { useCallback } from 'react';
import { Unlock } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import type { UploadFile } from '@/components/ui/UploadZone';

export default function UnlockPage() {
  const processFiles = useCallback(async (files: UploadFile[]): Promise<UploadFile[]> => {
    const { PDFDocument } = await import('pdf-lib');
    const results: UploadFile[] = [];
    for (const f of files) {
      try {
        const buf = await f.file.arrayBuffer();
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const result = await doc.save();
        results.push({ ...f, status: 'done' as const, progress: 100, resultBuffer: result.buffer as ArrayBuffer, resultName: `unlocked-${f.file.name}` });
      } catch {
        results.push({ ...f, status: 'error' as const, error: 'Could not unlock — password may be required' });
      }
    }
    return results;
  }, []);

  return (
    <ToolPage
      title="Unlock PDF"
      description="Remove password protection from any PDF you have access to. Instantly unlocks owner-restricted PDFs."
      accept=".pdf"
      color="#0D9488"
      icon={<Unlock className="w-8 h-8" strokeWidth={1.6} />}
      processFiles={processFiles}
      actionLabel="Unlock PDF →"
    />
  );
}
