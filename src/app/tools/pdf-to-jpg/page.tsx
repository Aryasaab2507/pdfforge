'use client';
import { useCallback } from 'react';
import { Image } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import { downloadBlob } from '@/lib/utils';
import type { UploadFile } from '@/components/ui/UploadZone';

export default function PDFToJPGPage() {
  const processFiles = useCallback(async (files: UploadFile[]): Promise<UploadFile[]> => {
    // Dynamic import - only runs in browser
    const pdfjsModule = await import('pdfjs-dist');
    const pdfjsLib = (pdfjsModule as any).default || pdfjsModule;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

    const results: UploadFile[] = [];
    for (const f of files) {
      try {
        const buf = await f.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width; canvas.height = vp.height;
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
          const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), 'image/jpeg', 0.92));
          const abuf = await blob.arrayBuffer();
          setTimeout(() => downloadBlob(abuf, `${f.file.name.replace('.pdf','')}-page-${i}.jpg`), i * 200);
        }
        results.push({ ...f, status: 'done' as const, progress: 100, resultName: `${pdf.numPages} JPG images` });
      } catch (err) {
        results.push({ ...f, status: 'error' as const, error: 'Conversion failed' });
      }
    }
    return results;
  }, []);

  return (
    <ToolPage
      title="PDF to JPG"
      description="Convert each page of your PDF into high-quality JPG images. Perfect for presentations and web use."
      accept=".pdf"
      multiple
      color="#E8392A"
      icon={<Image className="w-8 h-8" strokeWidth={1.6} />}
      processFiles={processFiles}
      actionLabel="Convert to JPG →"
    />
  );
}
