import type { Tool, PricingPlan } from '@/types';

export const TOOLS: Tool[] = [
  // Organize
  { id: 'merge', name: 'Merge PDF', description: 'Combine multiple PDFs into one', category: 'organize', href: '/tools/merge', color: '#E8392A', iconBg: '#FFF0EE', badge: 'popular', icon: 'Combine' },
  { id: 'split', name: 'Split PDF', description: 'Separate pages into individual files', category: 'organize', href: '/tools/split', color: '#EA580C', iconBg: '#FFF7ED', icon: 'Scissors' },
  { id: 'organize', name: 'Organize PDF', description: 'Reorder, rotate or delete pages', category: 'organize', href: '/editor', color: '#0D9488', iconBg: '#F0FDFA', icon: 'LayoutGrid' },
  { id: 'extract', name: 'Extract Pages', description: 'Pull out specific pages', category: 'organize', href: '/tools/split', color: '#2563EB', iconBg: '#EFF6FF', icon: 'FileOutput' },
  // Convert
  { id: 'pdf-to-word', name: 'PDF to Word', description: 'Editable .docx in seconds', category: 'convert', href: '/tools/pdf-to-word', color: '#7C3AED', iconBg: '#F5F3FF', badge: 'popular', icon: 'FileText' },
  { id: 'pdf-to-excel', name: 'PDF to Excel', description: 'Tables straight to spreadsheets', category: 'convert', href: '/tools/pdf-to-word', color: '#16A34A', iconBg: '#F0FDF4', icon: 'Table' },
  { id: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Pages to high-quality images', category: 'convert', href: '/tools/pdf-to-jpg', color: '#E8392A', iconBg: '#FFF0EE', icon: 'Image' },
  { id: 'word-to-pdf', name: 'Word to PDF', description: 'Perfect .docx → PDF conversion', category: 'convert', href: '/tools/word-to-pdf', color: '#EA580C', iconBg: '#FFF7ED', icon: 'FileUp' },
  { id: 'jpg-to-pdf', name: 'JPG to PDF', description: 'Turn images into a PDF', category: 'convert', href: '/tools/jpg-to-pdf', color: '#16A34A', iconBg: '#F0FDF4', badge: 'free', icon: 'Images' },
  { id: 'excel-to-pdf', name: 'Excel to PDF', description: 'Spreadsheets to PDF', category: 'convert', href: '/tools/word-to-pdf', color: '#0D9488', iconBg: '#F0FDFA', icon: 'Sheet' },
  // Edit
  { id: 'edit', name: 'Edit PDF', description: 'Click text → type directly. Drag to move', category: 'edit', href: '/editor', color: '#DB2777', iconBg: '#FDF2F8', badge: 'popular', icon: 'PenLine' },
  { id: 'watermark', name: 'Add Watermark', description: 'Brand or protect your document', category: 'edit', href: '/tools/watermark', color: '#2563EB', iconBg: '#EFF6FF', icon: 'Stamp' },
  { id: 'rotate', name: 'Rotate PDF', description: 'Fix page orientation', category: 'edit', href: '/tools/rotate', color: '#D97706', iconBg: '#FFFBEB', icon: 'RotateCw' },
  { id: 'page-numbers', name: 'Add Page Numbers', description: 'Header/footer numbering', category: 'edit', href: '/editor', color: '#7C3AED', iconBg: '#F5F3FF', icon: 'Hash' },
  { id: 'crop', name: 'Crop PDF', description: 'Adjust margins and page size', category: 'edit', href: '/editor', color: '#E8392A', iconBg: '#FFF0EE', icon: 'Crop' },
  // Security
  { id: 'protect', name: 'Protect PDF', description: 'Password-encrypt your file', category: 'security', href: '/tools/protect', color: '#16A34A', iconBg: '#F0FDF4', icon: 'Lock' },
  { id: 'unlock', name: 'Unlock PDF', description: 'Remove PDF password', category: 'security', href: '/tools/unlock', color: '#0D9488', iconBg: '#F0FDFA', icon: 'Unlock' },
  { id: 'sign', name: 'Sign PDF', description: 'Digital & drawn signatures', category: 'security', href: '/editor', color: '#DB2777', iconBg: '#FDF2F8', badge: 'popular', icon: 'Signature' },
  { id: 'redact', name: 'Redact PDF', description: 'Black out confidential text', category: 'security', href: '/editor', color: '#E8392A', iconBg: '#FFF0EE', icon: 'EyeOff' },
  // Optimize
  { id: 'compress', name: 'Compress PDF', description: 'Shrink file size dramatically', category: 'optimize', href: '/tools/compress', color: '#2563EB', iconBg: '#EFF6FF', badge: 'free', icon: 'Minimize2' },
  { id: 'repair', name: 'Repair PDF', description: 'Fix damaged or corrupted PDFs', category: 'optimize', href: '/tools/compress', color: '#EA580C', iconBg: '#FFF7ED', icon: 'Wrench' },
  // AI
  { id: 'ai-summarize', name: 'AI Summarizer', description: 'Instant AI-generated summaries', category: 'ai', href: '/tools/compress', color: '#7C3AED', iconBg: '#F5F3FF', badge: 'ai', icon: 'Sparkles' },
  { id: 'ai-translate', name: 'Translate PDF', description: '20+ language translation', category: 'ai', href: '/tools/compress', color: '#0D9488', iconBg: '#F0FDFA', badge: 'ai', icon: 'Languages' },
  { id: 'ocr', name: 'OCR PDF', description: 'Scan to searchable text', category: 'ai', href: '/tools/ocr', color: '#D97706', iconBg: '#FFFBEB', badge: 'ai', icon: 'ScanText' },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: { inr: 0, usd: 0 },
    period: 'month',
    description: 'Everything you need for everyday tasks',
    features: ['All 20+ core tools', 'Files up to 50 MB', '2 tasks per hour', 'Inline PDF Editor', 'Files deleted in 2h'],
    limits: { filesPerHour: 2, maxFileSize: 50, batchProcessing: false, aiFeatures: false, api: false, teamSeats: 1 },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { inr: 299, usd: 4 },
    period: 'month',
    description: 'For professionals and heavy users',
    features: ['Unlimited tasks', 'Files up to 500 MB', 'Batch processing', 'AI tools included', 'Priority support', 'File history 30 days'],
    limits: { filesPerHour: -1, maxFileSize: 500, batchProcessing: true, aiFeatures: true, api: false, teamSeats: 1 },
    featured: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: { inr: 999, usd: 12 },
    period: 'month',
    description: 'For teams and organizations',
    features: ['Everything in Pro', 'Up to 10 team seats', 'API access', 'GDPR data processing', 'Dedicated manager', 'Custom branding'],
    limits: { filesPerHour: -1, maxFileSize: 2048, batchProcessing: true, aiFeatures: true, api: true, teamSeats: 10 },
  },
];

export const TOOL_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'organize', label: 'Organize' },
  { id: 'convert', label: 'Convert' },
  { id: 'edit', label: 'Edit' },
  { id: 'security', label: 'Security' },
  { id: 'optimize', label: 'Optimize' },
  { id: 'ai', label: 'AI Tools' },
] as const;
