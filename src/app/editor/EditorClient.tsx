'use client';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with canvas/pdfjs
const PDFEditor = dynamic(
  () => import('@/components/editor/PDFEditor').then(m => ({ default: m.PDFEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen bg-editor-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-editor-border2 border-t-brand rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-sm text-editor-text2">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

export function EditorClient() {
  return <PDFEditor />;
}
