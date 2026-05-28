// ── PDF Tool Types ──
export type ToolCategory = 'organize' | 'convert' | 'edit' | 'security' | 'optimize' | 'ai';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  href: string;
  color: string;
  iconBg: string;
  badge?: 'popular' | 'new' | 'ai' | 'free';
  icon: string; // lucide icon name
}

// ── Editor Types ──
export type EditorTool = 'select' | 'addtext' | 'draw' | 'highlight' | 'signature';

export interface TextBlock {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  isNew: boolean;
  opacity: number;
}

export interface DrawStroke {
  id: string;
  pageIndex: number;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  opacity: number;
}

export interface PDFPage {
  pageNum: number;
  canvas: HTMLCanvasElement;
  drawCanvas: HTMLCanvasElement;
  overlayEl: HTMLDivElement;
  wrapper: HTMLDivElement;
  viewport: { width: number; height: number; scale: number; transform: number[] };
  scale: number;
  blocks: TextBlock[];
  strokes: DrawStroke[];
}

// ── Upload Types ──
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  arrayBuffer?: ArrayBuffer;
  url?: string;
  status: 'idle' | 'uploading' | 'processing' | 'done' | 'error';
  progress: number;
  error?: string;
  resultUrl?: string;
  resultName?: string;
}

// ── Processing Types ──
export interface ProcessingOptions {
  // Compress
  compressionLevel?: 'low' | 'medium' | 'high';
  // Rotate
  rotationAngle?: 90 | 180 | 270;
  rotateAll?: boolean;
  selectedPages?: number[];
  // Watermark
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkPosition?: 'center' | 'diagonal';
  watermarkFontSize?: number;
  watermarkColor?: string;
  // Protect
  password?: string;
  // Split
  splitMode?: 'range' | 'every' | 'extract';
  pageRanges?: string;
  extractPages?: number[];
  // Merge
  mergeOrder?: string[];
}

export interface ProcessingResult {
  success: boolean;
  data?: ArrayBuffer;
  filename?: string;
  error?: string;
  metadata?: {
    originalSize: number;
    resultSize: number;
    pageCount: number;
    processingTime: number;
  };
}

// ── Auth Types ──
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'business';
  usage: {
    filesThisMonth: number;
    storageUsed: number;
    limit: number;
  };
}

// ── Pricing Types ──
export interface PricingPlan {
  id: 'free' | 'pro' | 'business';
  name: string;
  price: { inr: number; usd: number };
  period: 'month' | 'year';
  description: string;
  features: string[];
  limits: {
    filesPerHour: number;
    maxFileSize: number; // MB
    batchProcessing: boolean;
    aiFeatures: boolean;
    api: boolean;
    teamSeats: number;
  };
  featured?: boolean;
}
