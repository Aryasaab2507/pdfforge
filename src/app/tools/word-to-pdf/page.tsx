'use client';
import { useCallback } from 'react';
import { FileUp } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import type { UploadFile } from '@/components/ui/UploadZone';

export default function WordToPDFPage() {
  const processFiles = useCallback(async (files: UploadFile[]): Promise<UploadFile[]> => {
    // Note: true Word→PDF conversion requires a backend (LibreOffice).
    // Client-side: we show the file and inform user.
    return files.map(f => ({
      ...f, status: 'error' as const,
      error: 'Server-side conversion required. Coming soon with backend!',
    }));
  }, []);

  return (
    <ToolPage
      title="Word to PDF"
      description="Convert your Word documents (.docx, .doc) into perfectly formatted PDF files."
      accept=".doc,.docx"
      multiple
      formats={['DOC', 'DOCX']}
      color="#EA580C"
      icon={<FileUp className="w-8 h-8" strokeWidth={1.6} />}
      processFiles={processFiles}
      actionLabel="Convert to PDF →"
    />
  );
}
