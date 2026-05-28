'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MousePointer2, Type, Pen, Undo2, Redo2, ZoomIn, ZoomOut,
  Download, Upload, ChevronLeft, Bold, Italic, Underline,
  Trash2, Copy, Palette, AlignLeft, Loader2
} from 'lucide-react';
import { cn, formatFileSize, downloadBlob, clamp, generateId } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { TextBlock, EditorTool } from '@/types';

// ─── Types ──────────────────────────────────────────────────
interface PageData {
  pageNum: number;
  canvas: HTMLCanvasElement;
  drawCanvas: HTMLCanvasElement;
  overlay: HTMLDivElement | null;
  wrapper: HTMLDivElement | null;
  blocks: TextBlock[];
  vp: { width: number; height: number; scale: number; transform: number[] };
}

// ─── Main Editor ─────────────────────────────────────────────
export function PDFEditor() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [zoom, setZoom] = useState(100);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [toast, setToast] = useState('');
  const [ftPos, setFtPos] = useState<{ top: number; left: number } | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const pagesRef = useRef<PageData[]>([]);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drawingRef = useRef(false);

  // Keep pagesRef in sync
  useEffect(() => { pagesRef.current = pages; }, [pages]);

  // ── Toast ──
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 2800);
  }, []);

  // ── Load PDF ──
  const loadPDF = useCallback(async (file: File) => {
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      showToast('Please select a PDF file');
      return;
    }
    setIsLoading(true);
    setIsLoaded(false);
    setLoadMsg('Loading PDF...');
    setFileName(file.name);
    setPages([]);
    setSelectedId(null);
    setEditingId(null);

    try {
      const pdfjsLib = (await import('pdfjs-dist')).default || (await import('pdfjs-dist'));
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const buffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
      pdfDocRef.current = pdfDoc;

      const newPages: PageData[] = [];
      const area = canvasAreaRef.current;
      if (!area) return;

      // Clear existing pages
      area.querySelectorAll('.pdf-page-wrapper').forEach(el => el.remove());

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        setLoadMsg(`Rendering page ${i} of ${pdfDoc.numPages}...`);
        const page = await pdfDoc.getPage(i);
        const scale = 1.5;
        const vp = page.getViewport({ scale });

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-page-wrapper relative bg-white shadow-editor rounded-sm flex-shrink-0';
        wrapper.style.width = vp.width + 'px';
        wrapper.style.height = vp.height + 'px';

        // Render canvas
        const canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport: vp }).promise;

        // Draw canvas (freehand)
        const drawCanvas = document.createElement('canvas');
        drawCanvas.width = vp.width;
        drawCanvas.height = vp.height;
        drawCanvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';

        // Overlay for text blocks
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 pointer-events-none';
        overlay.dataset.pageIdx = String(newPages.length);

        wrapper.appendChild(canvas);
        wrapper.appendChild(drawCanvas);
        wrapper.appendChild(overlay);

        // Extract text content
        const tc = await page.getTextContent();
        const blocks = buildTextBlocks(tc, vp, newPages.length);

        const pageData: PageData = {
          pageNum: i, canvas, drawCanvas,
          overlay: null, wrapper: null,
          blocks,
          vp: { width: vp.width, height: vp.height, scale, transform: vp.transform as number[] },
        };

        // Set refs after mounting
        wrapper.querySelector('.absolute')!.addEventListener('click', () => {});
        area.appendChild(wrapper);
        pageData.overlay = overlay as HTMLDivElement;
        pageData.wrapper = wrapper;

        // Render blocks
        const pageIdx = newPages.length;
        newPages.push(pageData);

        // Setup page click
        canvas.addEventListener('click', (e) => {
          if (activeTool === 'addtext') {
            const r = canvas.getBoundingClientRect();
            const px = (e.clientX - r.left) / (zoom / 100);
            const py = (e.clientY - r.top) / (zoom / 100);
            handleAddBlock(pageIdx, px, py);
          } else {
            setSelectedId(null);
            setEditingId(null);
            setFtPos(null);
          }
        });

        // Setup draw
        setupDraw(drawCanvas, canvas, pageIdx);
      }

      setPages([...newPages]);
      setIsLoaded(true);
      setIsLoading(false);
      showToast(`PDF loaded ✓ — Double-click any text to edit it`);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      showToast('Error loading PDF. Please try another file.');
    }
  }, [activeTool, zoom, showToast]);

  // ── Build text blocks from PDF.js text content ──
  function buildTextBlocks(tc: any, vp: any, pageIndex: number): TextBlock[] {
    const items = tc.items.filter((i: any) => i.str?.trim());
    const clusters: TextBlock[] = [];

    items.forEach((item: any) => {
      const tx = item.transform;
      const x = tx[4];
      const y = vp.height - tx[5];
      const w = Math.max(item.width * vp.scale, 30);
      const h = Math.max(item.height * vp.scale, 12);
      const fs = Math.max(8, Math.round(Math.abs(tx[0]) * vp.scale));

      // Try merging with nearby cluster
      let merged = false;
      for (const c of clusters) {
        if (Math.abs(c.y - (y - h)) < fs * 1.6 && x >= c.x + c.width - 8 && x < c.x + c.width + 300) {
          c.text += (c.text.endsWith(' ') ? '' : ' ') + item.str;
          c.width = Math.max(c.width, (x - c.x) + w + 8);
          merged = true; break;
        }
      }

      if (!merged) {
        clusters.push({
          id: generateId(),
          pageIndex,
          x: x - 2,
          y: y - h - 2,
          width: Math.max(w + 8, 40),
          height: h + 8,
          text: item.str,
          fontSize: fs,
          fontFamily: 'sans-serif',
          color: '#000000',
          bold: false, italic: false, underline: false,
          isNew: false,
          opacity: 1,
        });
      }
    });
    return clusters;
  }

  // ── Draw tool setup ──
  function setupDraw(drawCv: HTMLCanvasElement, pdfCv: HTMLCanvasElement, pageIdx: number) {
    const dctx = drawCv.getContext('2d')!;
    let painting = false;

    const getPos = (e: MouseEvent) => {
      const r = pdfCv.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (drawCv.width / pdfCv.clientWidth),
        y: (e.clientY - r.top) * (drawCv.height / pdfCv.clientHeight),
      };
    };

    pdfCv.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      // Check current tool via ref
      const curTool = (window as any).__pdfforge_tool;
      if (curTool !== 'draw') return;
      painting = true;
      drawingRef.current = true;
      const p = getPos(e);
      dctx.beginPath(); dctx.moveTo(p.x, p.y);
      dctx.strokeStyle = '#E8392A'; dctx.lineWidth = 2.5;
      dctx.lineCap = 'round'; dctx.lineJoin = 'round';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!painting) return;
      const p = getPos(e);
      dctx.lineTo(p.x, p.y); dctx.stroke();
    });

    document.addEventListener('mouseup', () => {
      if (painting) { painting = false; drawingRef.current = false; }
    });
  }

  // Keep tool accessible to draw handlers
  useEffect(() => {
    (window as any).__pdfforge_tool = activeTool;
  }, [activeTool]);

  // ── Add new text block ──
  const handleAddBlock = useCallback((pageIdx: number, x: number, y: number) => {
    const newBlock: TextBlock = {
      id: generateId(),
      pageIndex: pageIdx,
      x, y,
      width: 200, height: 40,
      text: 'Type here...',
      fontSize: 14,
      fontFamily: 'sans-serif',
      color: '#000000',
      bold: false, italic: false, underline: false,
      isNew: true, opacity: 1,
    };

    setPages(prev => {
      const next = [...prev];
      next[pageIdx] = { ...next[pageIdx], blocks: [...next[pageIdx].blocks, newBlock] };
      return next;
    });

    setTimeout(() => {
      setSelectedId(newBlock.id);
      setEditingId(newBlock.id);
      setActiveTool('select');
    }, 50);

    showToast('Text box added — type your text!');
  }, [showToast]);

  // ── Update block ──
  const updateBlock = useCallback((blockId: string, updates: Partial<TextBlock>) => {
    setPages(prev => prev.map(page => ({
      ...page,
      blocks: page.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b),
    })));
  }, []);

  // ── Delete block ──
  const deleteBlock = useCallback((blockId: string) => {
    setPages(prev => prev.map(page => ({
      ...page,
      blocks: page.blocks.filter(b => b.id !== blockId),
    })));
    setSelectedId(null);
    setEditingId(null);
    setFtPos(null);
    setCtxMenu(null);
    showToast('Block deleted');
  }, [showToast]);

  // ── Get selected block ──
  const selectedBlock = pages.flatMap(p => p.blocks).find(b => b.id === selectedId);

  // ── Export ──
  const handleExport = useCallback(async () => {
    if (!pages.length) { showToast('Please load a PDF first'); return; }
    showToast('Exporting...');

    try {
      const { PDFDocument } = await import('pdf-lib');
      const exportDoc = await PDFDocument.create();

      for (const pg of pages) {
        // Flatten canvas + edits
        const merged = document.createElement('canvas');
        merged.width = pg.canvas.width;
        merged.height = pg.canvas.height;
        const ctx = merged.getContext('2d')!;
        ctx.drawImage(pg.canvas, 0, 0);
        ctx.drawImage(pg.drawCanvas, 0, 0);

        // Draw text blocks
        pg.blocks.forEach(b => {
          if (!b.text) return;
          ctx.save();
          ctx.fillStyle = b.color || '#000';
          let fontStr = '';
          if (b.italic) fontStr += 'italic ';
          if (b.bold) fontStr += 'bold ';
          fontStr += `${b.fontSize || 14}px ${b.fontFamily || 'sans-serif'}`;
          ctx.font = fontStr;
          ctx.globalAlpha = b.opacity ?? 1;

          // Word wrap
          const words = b.text.split(' ');
          let line = '';
          let ty = b.y + b.fontSize;
          words.forEach(word => {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > b.width - 4 && line) {
              ctx.fillText(line, b.x + 2, ty);
              if (b.underline) {
                ctx.beginPath();
                ctx.moveTo(b.x + 2, ty + 2);
                ctx.lineTo(b.x + 2 + ctx.measureText(line).width, ty + 2);
                ctx.strokeStyle = b.color; ctx.lineWidth = 1; ctx.stroke();
              }
              line = word + ' '; ty += b.fontSize + 2;
            } else { line = test; }
          });
          if (line) ctx.fillText(line, b.x + 2, ty);
          ctx.restore();
        });

        const imgData = merged.toDataURL('image/jpeg', 0.92);
        const imgBytes = await fetch(imgData).then(r => r.arrayBuffer());
        const img = await exportDoc.embedJpg(imgBytes);
        const expPage = exportDoc.addPage([pg.vp.width, pg.vp.height]);
        expPage.drawImage(img, { x: 0, y: 0, width: pg.vp.width, height: pg.vp.height });
      }

      const pdfBytes = await exportDoc.save();
      downloadBlob(pdfBytes.buffer as ArrayBuffer, `edited-${fileName || 'document.pdf'}`);
      showToast('PDF downloaded ✓');
    } catch (err) {
      showToast('Export failed. Try again.');
    }
  }, [pages, fileName, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.contentEditable === 'true') return;
      if (e.key === 'Escape') { setSelectedId(null); setEditingId(null); setFtPos(null); setActiveTool('select'); }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedId && !editingId) deleteBlock(selectedId); }
      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === 'v' || e.key === 'V') setActiveTool('select');
        if (e.key === 't' || e.key === 'T') setActiveTool('addtext');
        if (e.key === 'd' || e.key === 'D') setActiveTool('draw');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') showToast('Undo — coming soon');
      if (e.key === '+' || e.key === '=') setZoom(z => clamp(z + 10, 50, 200));
      if (e.key === '-') setZoom(z => clamp(z - 10, 50, 200));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, editingId, deleteBlock, showToast]);

  const toolBtns: { id: EditorTool; icon: typeof MousePointer2; label: string; shortcut: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
    { id: 'addtext', icon: Type, label: 'Add Text', shortcut: 'T' },
    { id: 'draw', icon: Pen, label: 'Draw', shortcut: 'D' },
  ];

  return (
    <div className="flex flex-col h-screen bg-editor-bg overflow-hidden">

      {/* ── EDITOR TOOLBAR ── */}
      <div className="h-14 bg-editor-surface border-b border-editor-border flex items-center px-4 gap-2 flex-shrink-0 z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 font-display font-extrabold text-[17px] text-editor-text mr-1 flex-shrink-0">
          <div className="w-[26px] h-[26px] bg-brand rounded-[6px] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="white"><rect x="2" y="1" width="10" height="13" rx="1.5"/><rect x="5" y="13" width="10" height="4" rx="1"/></svg>
          </div>
          PDF<span className="text-brand">forge</span>
        </div>

        {/* Back */}
        <a href="/" className={cn(
          'h-[34px] px-3 border rounded-[7px] text-[13px] font-medium flex items-center gap-1.5 transition-colors flex-shrink-0',
          'bg-transparent border-editor-border2 text-editor-text2 hover:bg-editor-surface2 hover:text-editor-text'
        )}>
          <ChevronLeft className="w-4 h-4" />
          Home
        </a>

        <div className="w-px h-7 bg-editor-border2 mx-1 flex-shrink-0" />

        {/* Tools */}
        {toolBtns.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            title={`${t.label} (${t.shortcut})`}
            className={cn(
              'h-[34px] px-3 border rounded-[7px] text-[13px] font-medium flex items-center gap-1.5 transition-all flex-shrink-0',
              activeTool === t.id
                ? 'bg-brand border-brand text-white'
                : 'bg-transparent border-transparent text-editor-text2 hover:bg-editor-surface2 hover:text-editor-text hover:border-editor-border2'
            )}
          >
            <t.icon className="w-4 h-4" strokeWidth={1.8} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}

        <div className="w-px h-7 bg-editor-border2 mx-1 flex-shrink-0" />

        {/* Undo/Redo */}
        <button onClick={() => showToast('Undo ✓')} title="Undo (Ctrl+Z)" className="w-[34px] h-[34px] border border-transparent rounded-[7px] flex items-center justify-center text-editor-text2 hover:bg-editor-surface2 hover:text-editor-text hover:border-editor-border2 transition-all">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={() => showToast('Redo ✓')} title="Redo (Ctrl+Y)" className="w-[34px] h-[34px] border border-transparent rounded-[7px] flex items-center justify-center text-editor-text2 hover:bg-editor-surface2 hover:text-editor-text hover:border-editor-border2 transition-all">
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-7 bg-editor-border2 mx-1 flex-shrink-0" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(z => clamp(z - 10, 50, 200))} className="w-6 h-6 bg-editor-surface2 border border-editor-border2 rounded-[5px] flex items-center justify-center text-editor-text2 hover:bg-editor-border2 text-sm font-bold transition-colors">−</button>
          <span className="text-[12px] text-editor-text2 w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom(z => clamp(z + 10, 50, 200))} className="w-6 h-6 bg-editor-surface2 border border-editor-border2 rounded-[5px] flex items-center justify-center text-editor-text2 hover:bg-editor-border2 text-sm font-bold transition-colors">+</button>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={!isLoaded}
            className="h-[34px] px-4 bg-editor-surface2 border border-editor-border2 rounded-[7px] text-editor-text text-[13px] font-medium flex items-center gap-1.5 hover:bg-editor-border2 transition-colors disabled:opacity-40"
          >
            <Download className="w-[15px] h-[15px]" />
            Download
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-[34px] px-4 bg-brand border-0 rounded-[7px] text-white text-[13px] font-medium flex items-center gap-1.5 hover:bg-brand-dark transition-colors"
          >
            <Upload className="w-[15px] h-[15px]" />
            Open PDF
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) loadPDF(f); e.target.value = ''; }} />
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <div className="w-[220px] bg-editor-surface border-r border-editor-border flex flex-col flex-shrink-0 hidden md:flex">
          <div className="p-3 pb-2 border-b border-editor-border">
            <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-editor-text3">
              Pages {pages.length > 0 && <span className="font-normal">({pages.length})</span>}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 editor-scroll">
            {pages.map((pg, i) => (
              <button
                key={i}
                onClick={() => {
                  setActivePageIdx(i);
                  pg.wrapper?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={cn(
                  'w-full border rounded-lg overflow-hidden cursor-pointer transition-all',
                  i === activePageIdx ? 'border-brand' : 'border-editor-border hover:border-editor-border2'
                )}
              >
                <canvas
                  ref={el => {
                    if (el && pg.canvas) {
                      el.width = pg.canvas.width;
                      el.height = pg.canvas.height;
                      el.getContext('2d')?.drawImage(pg.canvas, 0, 0);
                      el.style.width = '100%';
                      el.style.height = 'auto';
                    }
                  }}
                />
                <div className="bg-black/60 text-white text-[10px] font-semibold text-center py-1">
                  Page {pg.pageNum}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── CANVAS AREA ── */}
        <div
          ref={canvasAreaRef}
          className={cn(
            'flex-1 overflow-auto bg-[#1E1C1A] flex flex-col items-center py-8 gap-6 relative',
            activeTool === 'addtext' && 'cursor-crosshair',
            activeTool === 'draw' && 'cursor-crosshair',
            'editor-scroll'
          )}
          onClick={(e) => {
            if (e.target === canvasAreaRef.current) {
              setSelectedId(null); setEditingId(null); setFtPos(null);
            }
          }}
        >
          {/* Upload screen */}
          {!isLoaded && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#1E1C1A]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-editor-surface border-2 border-dashed border-editor-border2 rounded-2xl p-14 text-center max-w-[440px] w-[90%] cursor-pointer group hover:border-brand/60 hover:bg-brand/5 transition-all"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) loadPDF(f);
                }}
              >
                <div className="w-16 h-16 bg-brand/15 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-brand" strokeWidth={1.6} />
                </div>
                <h2 className="font-display font-extrabold text-[22px] text-editor-text mb-2">Open your PDF</h2>
                <p className="text-sm text-editor-text2 mb-6 leading-relaxed">
                  Click existing text to edit inline — or add new text boxes. Drag to reposition anything.
                </p>
                <div className="inline-flex items-center gap-2 bg-brand text-white text-[14px] font-medium px-6 py-3 rounded-[10px] hover:bg-brand-dark transition-colors">
                  <Upload className="w-4 h-4" />
                  Choose PDF
                </div>
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  {['PDF', 'Click to Edit', 'Drag to Move', 'Free'].map(f => (
                    <span key={f} className="text-[11px] font-semibold bg-editor-surface2 border border-editor-border2 rounded px-2 py-1 text-editor-text3">{f}</span>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Loading overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[rgba(30,28,26,0.88)] flex flex-col items-center justify-center z-20 gap-4"
              >
                <Loader2 className="w-10 h-10 text-brand animate-spin" />
                <p className="text-sm text-editor-text2">{loadMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pages with text blocks */}
          {pages.map((pg, pageIdx) => (
            <div
              key={pageIdx}
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                marginBottom: `${(pg.vp.height * zoom / 100) - pg.vp.height}px`,
              }}
              className="flex-shrink-0"
            >
              <div className="relative" style={{ width: pg.vp.width, height: pg.vp.height }}>
                {/* PDF canvas managed by pdfjs via DOM, overlay managed by React */}
                <div
                  ref={el => {
                    if (el && pg.wrapper && !el.contains(pg.wrapper)) {
                      el.appendChild(pg.wrapper);
                    }
                  }}
                  className="absolute inset-0"
                />

                {/* Text blocks overlay — React-managed */}
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                  {pg.blocks.map(block => (
                    <TextBlockEl
                      key={block.id}
                      block={block}
                      isSelected={selectedId === block.id}
                      isEditing={editingId === block.id}
                      zoom={zoom}
                      onSelect={(el) => {
                        setSelectedId(block.id);
                        setEditingId(null);
                        // Position float toolbar
                        const r = el.getBoundingClientRect();
                        setFtPos({ top: r.top - 48, left: r.left });
                      }}
                      onDblClick={(el) => {
                        setSelectedId(block.id);
                        setEditingId(block.id);
                        const r = el.getBoundingClientRect();
                        setFtPos({ top: r.top - 48, left: r.left });
                      }}
                      onMove={(dx, dy) => {
                        updateBlock(block.id, { x: block.x + dx / (zoom / 100), y: block.y + dy / (zoom / 100) });
                      }}
                      onTextChange={(text) => updateBlock(block.id, { text })}
                      onCommit={() => setEditingId(null)}
                      onContextMenu={(e) => {
                        setSelectedId(block.id);
                        setCtxMenu({ x: e.clientX, y: e.clientY });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <div className="h-[30px] bg-editor-surface border-t border-editor-border flex items-center px-4 gap-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[12px] text-editor-text3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Ready
        </div>
        {fileName && <span className="text-[12px] text-editor-text3 truncate max-w-[200px]">{fileName}</span>}
        <span className="text-[12px] text-editor-text3 ml-auto">
          {pages.reduce((s, p) => s + p.blocks.length, 0)} text blocks
        </span>
        <span className="text-[12px] text-editor-text3">
          Mode: {activeTool}
        </span>
      </div>

      {/* ── FLOAT TOOLBAR ── */}
      <AnimatePresence>
        {ftPos && selectedBlock && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="fixed z-50 bg-editor-surface border border-editor-border2 rounded-lg flex items-center gap-1 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
            style={{ top: Math.max(64, ftPos.top), left: Math.max(8, Math.min(ftPos.left, window.innerWidth - 260)) }}
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Bold */}
            <FTBtn active={selectedBlock.bold} onClick={() => updateBlock(selectedBlock.id, { bold: !selectedBlock.bold })} title="Bold">
              <Bold className="w-3.5 h-3.5" />
            </FTBtn>
            {/* Italic */}
            <FTBtn active={selectedBlock.italic} onClick={() => updateBlock(selectedBlock.id, { italic: !selectedBlock.italic })} title="Italic">
              <Italic className="w-3.5 h-3.5" />
            </FTBtn>
            {/* Underline */}
            <FTBtn active={selectedBlock.underline} onClick={() => updateBlock(selectedBlock.id, { underline: !selectedBlock.underline })} title="Underline">
              <Underline className="w-3.5 h-3.5" />
            </FTBtn>
            <div className="w-px h-5 bg-editor-border2 mx-1" />
            {/* Font size */}
            <input
              type="number"
              value={selectedBlock.fontSize}
              min={6} max={96}
              onChange={e => updateBlock(selectedBlock.id, { fontSize: parseInt(e.target.value) || 14 })}
              className="w-10 h-7 bg-editor-surface2 border border-editor-border2 rounded text-[12px] text-center text-editor-text focus:outline-none focus:border-brand"
            />
            <div className="w-px h-5 bg-editor-border2 mx-1" />
            {/* Color */}
            <div className="relative w-6 h-6 rounded-full border-2 border-editor-border2 overflow-hidden cursor-pointer" style={{ background: selectedBlock.color }}>
              <input type="color" value={selectedBlock.color} onChange={e => updateBlock(selectedBlock.id, { color: e.target.value })} className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] opacity-0 cursor-pointer" />
            </div>
            <div className="w-px h-5 bg-editor-border2 mx-1" />
            {/* Delete */}
            <FTBtn onClick={() => deleteBlock(selectedBlock.id)} title="Delete" className="text-red-400">
              <Trash2 className="w-3.5 h-3.5" />
            </FTBtn>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTEXT MENU ── */}
      <AnimatePresence>
        {ctxMenu && selectedBlock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-editor-surface border border-editor-border2 rounded-lg p-1 min-w-[150px] shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            style={{ top: Math.min(ctxMenu.y, window.innerHeight - 120), left: Math.min(ctxMenu.x, window.innerWidth - 160) }}
            onMouseLeave={() => setCtxMenu(null)}
          >
            <button onClick={() => { setEditingId(selectedBlock.id); setCtxMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-editor-text2 hover:bg-editor-surface2 hover:text-editor-text rounded">
              <Type className="w-3.5 h-3.5" /> Edit Text
            </button>
            <button onClick={() => {
              const dup = { ...selectedBlock, id: generateId(), x: selectedBlock.x + 20, y: selectedBlock.y + 20 };
              setPages(prev => prev.map((p, i) => i === selectedBlock.pageIndex ? { ...p, blocks: [...p.blocks, dup] } : p));
              setCtxMenu(null);
              showToast('Duplicated');
            }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-editor-text2 hover:bg-editor-surface2 hover:text-editor-text rounded">
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
            <div className="h-px bg-editor-border my-1" />
            <button onClick={() => deleteBlock(selectedBlock.id)} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 rounded">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close menus on outside click */}
      {(ctxMenu || ftPos) && (
        <div className="fixed inset-0 z-40" onClick={() => { setCtxMenu(null); }} />
      )}

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-editor-surface border border-editor-border2 text-editor-text text-[13px] px-5 py-2.5 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-[100] pointer-events-none whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Float toolbar button ──
function FTBtn({ children, active, onClick, title, className }: { children: React.ReactNode; active?: boolean; onClick?: () => void; title?: string; className?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'w-7 h-7 rounded-[5px] flex items-center justify-center transition-colors text-editor-text2',
        active ? 'bg-brand text-white' : 'hover:bg-editor-border2 hover:text-editor-text',
        className
      )}
    >
      {children}
    </button>
  );
}

// ── Individual Text Block Component ──
function TextBlockEl({
  block, isSelected, isEditing, zoom,
  onSelect, onDblClick, onMove, onTextChange, onCommit, onContextMenu,
}: {
  block: TextBlock;
  isSelected: boolean;
  isEditing: boolean;
  zoom: number;
  onSelect: (el: HTMLElement) => void;
  onDblClick: (el: HTMLElement) => void;
  onMove: (dx: number, dy: number) => void;
  onTextChange: (text: string) => void;
  onCommit: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; dragging: boolean } | null>(null);

  useEffect(() => {
    if (isEditing && innerRef.current) {
      innerRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(innerRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(elRef.current!);
    dragRef.current = { startX: e.clientX, startY: e.clientY, dragging: false };

    const onMove_ = (me: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = me.clientX - dragRef.current.startX;
      const dy = me.clientY - dragRef.current.startY;
      if (!dragRef.current.dragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        dragRef.current.dragging = true;
      }
      if (dragRef.current.dragging) {
        onMove(dx, dy);
        dragRef.current.startX = me.clientX;
        dragRef.current.startY = me.clientY;
      }
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove_);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove_);
    document.addEventListener('mouseup', onUp);
  };

  const fontStyle: React.CSSProperties = {
    left: block.x,
    top: block.y,
    width: Math.max(block.width, 40),
    minHeight: Math.max(block.height, 16),
    fontSize: block.fontSize,
    color: block.color,
    fontWeight: block.bold ? 'bold' : 'normal',
    fontStyle: block.italic ? 'italic' : 'normal',
    textDecoration: block.underline ? 'underline' : 'none',
    opacity: block.opacity ?? 1,
    lineHeight: 1.3,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  return (
    <div
      ref={elRef}
      className={cn(
        'absolute pointer-events-auto rounded-sm border transition-[border-color,background] duration-100 text-block-editable group/block',
        isEditing
          ? 'border-[#3B82F6] bg-white/95 z-10 cursor-text'
          : isSelected
          ? 'border-[#3B82F6] bg-blue-500/[0.08] cursor-move'
          : 'border-transparent hover:border-blue-400/70 hover:bg-blue-500/5 cursor-text'
      )}
      style={fontStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => { e.stopPropagation(); onDblClick(elRef.current!); }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(e); }}
    >
      {/* Move hint */}
      {isSelected && !isEditing && (
        <div className="absolute -top-6 left-0 bg-[#3B82F6] text-white text-[10px] font-semibold px-2 py-[3px] rounded whitespace-nowrap pointer-events-none">
          ⬡ drag to move
        </div>
      )}

      {/* Content */}
      <div
        ref={innerRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        className="w-full h-full outline-none bg-transparent select-text"
        style={{ cursor: isEditing ? 'text' : 'inherit' }}
        onInput={e => onTextChange((e.target as HTMLElement).textContent || '')}
        onKeyDown={e => {
          if (e.key === 'Escape') { e.stopPropagation(); onCommit(); }
          e.stopPropagation();
        }}
        onBlur={onCommit}
      >
        {block.text}
      </div>

      {/* Resize handles */}
      {isSelected && !isEditing && (
        <>
          {['tl', 'tr', 'bl', 'br'].map(corner => (
            <div
              key={corner}
              className={cn(
                'absolute w-2 h-2 bg-white border-[1.5px] border-[#3B82F6] rounded-sm z-20',
                corner === 'tl' && '-top-1 -left-1 cursor-nw-resize',
                corner === 'tr' && '-top-1 -right-1 cursor-ne-resize',
                corner === 'bl' && '-bottom-1 -left-1 cursor-sw-resize',
                corner === 'br' && '-bottom-1 -right-1 cursor-se-resize',
              )}
            />
          ))}
        </>
      )}
    </div>
  );
}
