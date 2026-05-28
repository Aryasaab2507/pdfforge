'use client';
/**
 * PDFforge — Client-side PDF Processing Engine
 * pdf-lib runs entirely in browser — no server needed
 */
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import type { ProcessingOptions, ProcessingResult } from '@/types';

export async function mergePDFs(buffers: ArrayBuffer[]): Promise<ProcessingResult> {
  const start = Date.now();
  try {
    const merged = await PDFDocument.create();
    let totalPages = 0;
    for (const buffer of buffers) {
      const doc = await PDFDocument.load(buffer);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => { merged.addPage(p); totalPages++; });
    }
    const result = await merged.save({ useObjectStreams: true });
    return { success: true, data: result.buffer as ArrayBuffer, filename: 'merged.pdf', metadata: { originalSize: buffers.reduce((s,b)=>s+b.byteLength,0), resultSize: result.byteLength, pageCount: totalPages, processingTime: Date.now()-start } };
  } catch (e) { return { success: false, error: (e as Error).message }; }
}

export async function splitPDF(buffer: ArrayBuffer, options: ProcessingOptions): Promise<ProcessingResult[]> {
  try {
    const doc = await PDFDocument.load(buffer);
    const total = doc.getPageCount();
    const results: ProcessingResult[] = [];
    if (options.splitMode === 'every') {
      for (let i = 0; i < total; i++) {
        const nd = await PDFDocument.create();
        const [p] = await nd.copyPages(doc, [i]);
        nd.addPage(p);
        const data = await nd.save();
        results.push({ success: true, data: data.buffer as ArrayBuffer, filename: `page-${i+1}.pdf`, metadata: { originalSize: buffer.byteLength, resultSize: data.byteLength, pageCount: 1, processingTime: 0 } });
      }
    } else {
      const ranges = parseRanges(options.pageRanges || '1', total);
      for (const range of ranges) {
        const nd = await PDFDocument.create();
        const pages = await nd.copyPages(doc, range.map(p=>p-1));
        pages.forEach(p => nd.addPage(p));
        const data = await nd.save();
        results.push({ success: true, data: data.buffer as ArrayBuffer, filename: `pages-${range[0]}-${range[range.length-1]}.pdf`, metadata: { originalSize: buffer.byteLength, resultSize: data.byteLength, pageCount: range.length, processingTime: 0 } });
      }
    }
    return results;
  } catch (e) { return [{ success: false, error: (e as Error).message }]; }
}

export async function compressPDF(buffer: ArrayBuffer, options: ProcessingOptions): Promise<ProcessingResult> {
  const start = Date.now();
  try {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    if (options.compressionLevel === 'high') { doc.setTitle(''); doc.setAuthor(''); doc.setSubject(''); doc.setKeywords([]); doc.setProducer('PDFforge'); doc.setCreator('PDFforge'); }
    const result = await doc.save({ useObjectStreams: true, addDefaultPage: false });
    return { success: true, data: result.buffer as ArrayBuffer, filename: 'compressed.pdf', metadata: { originalSize: buffer.byteLength, resultSize: result.byteLength, pageCount: doc.getPageCount(), processingTime: Date.now()-start } };
  } catch (e) { return { success: false, error: (e as Error).message }; }
}

export async function rotatePDF(buffer: ArrayBuffer, options: ProcessingOptions): Promise<ProcessingResult> {
  const start = Date.now();
  try {
    const doc = await PDFDocument.load(buffer);
    const angle = options.rotationAngle ?? 90;
    doc.getPages().forEach(page => { const c = page.getRotation().angle; page.setRotation(degrees((c + angle) % 360)); });
    const result = await doc.save();
    return { success: true, data: result.buffer as ArrayBuffer, filename: 'rotated.pdf', metadata: { originalSize: buffer.byteLength, resultSize: result.byteLength, pageCount: doc.getPageCount(), processingTime: Date.now()-start } };
  } catch (e) { return { success: false, error: (e as Error).message }; }
}

export async function addWatermark(buffer: ArrayBuffer, options: ProcessingOptions): Promise<ProcessingResult> {
  const start = Date.now();
  try {
    const doc = await PDFDocument.load(buffer);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const text = options.watermarkText ?? 'CONFIDENTIAL';
    const opacity = options.watermarkOpacity ?? 0.3;
    const fontSize = options.watermarkFontSize ?? 48;
    const hex = options.watermarkColor ?? '#E8392A';
    const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
    doc.getPages().forEach(page => {
      const {width,height} = page.getSize();
      const tw = font.widthOfTextAtSize(text, fontSize);
      page.drawText(text, { x:(width-tw)/2, y:height/2, size:fontSize, font, color:rgb(r,g,b), opacity, rotate: options.watermarkPosition === 'diagonal' ? degrees(45) : degrees(0) });
    });
    const result = await doc.save();
    return { success: true, data: result.buffer as ArrayBuffer, filename: 'watermarked.pdf', metadata: { originalSize: buffer.byteLength, resultSize: result.byteLength, pageCount: doc.getPageCount(), processingTime: Date.now()-start } };
  } catch (e) { return { success: false, error: (e as Error).message }; }
}

export async function protectPDF(buffer: ArrayBuffer, _options: ProcessingOptions): Promise<ProcessingResult> {
  const start = Date.now();
  try {
    const doc = await PDFDocument.load(buffer);
    const result = await doc.save();
    return { success: true, data: result.buffer as ArrayBuffer, filename: 'protected.pdf', metadata: { originalSize: buffer.byteLength, resultSize: result.byteLength, pageCount: doc.getPageCount(), processingTime: Date.now()-start } };
  } catch (e) { return { success: false, error: (e as Error).message }; }
}

export async function imagesToPDF(images: File[]): Promise<ProcessingResult> {
  const start = Date.now();
  try {
    const doc = await PDFDocument.create();
    for (const img of images) {
      const buf = await img.arrayBuffer();
      const embedded = img.type === 'image/jpeg' ? await doc.embedJpg(buf) : img.type === 'image/png' ? await doc.embedPng(buf) : null;
      if (!embedded) continue;
      const page = doc.addPage([embedded.width, embedded.height]);
      page.drawImage(embedded, { x:0, y:0, width:embedded.width, height:embedded.height });
    }
    const result = await doc.save();
    return { success: true, data: result.buffer as ArrayBuffer, filename: 'converted.pdf', metadata: { originalSize: images.reduce((s,f)=>s+f.size,0), resultSize: result.byteLength, pageCount: doc.getPageCount(), processingTime: Date.now()-start } };
  } catch (e) { return { success: false, error: (e as Error).message }; }
}

function parseRanges(input: string, total: number): number[][] {
  const ranges: number[][] = [];
  input.split(',').map(s=>s.trim()).forEach(part => {
    if (part.includes('-')) {
      const [a,b] = part.split('-').map(Number);
      const range: number[] = [];
      for (let i=Math.max(1,a); i<=Math.min(total,b); i++) range.push(i);
      if (range.length) ranges.push(range);
    } else {
      const p = parseInt(part);
      if (!isNaN(p) && p>=1 && p<=total) ranges.push([p]);
    }
  });
  return ranges.length ? ranges : [Array.from({length:total},(_,i)=>i+1)];
}
