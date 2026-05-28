'use client';
import { useCallback } from 'react';
import { FileText } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import type { UploadFile } from '@/components/ui/UploadZone';

export default function PDFToWordPage() {
  const processFiles = useCallback(async (files: UploadFile[]): Promise<UploadFile[]> => {
    return files.map(f => ({
      ...f, status: 'error' as const,
      error: 'Server-side conversion required. Coming soon with backend!',
    }));
  }, []);

  return (
    <ToolPage
      title="PDF to Word"
      description="Convert your PDF into an editable Word document (.docx). Preserves formatting and layout."
      accept=".pdf"
      multiple
      color="#7C3AED"
      icon={<FileText className="w-8 h-8" strokeWidth={1.6} />}
      processFiles={processFiles}
      actionLabel="Convert to Word →"
    />
  );
}
