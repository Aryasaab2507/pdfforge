import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // Server-side PDF-to-image requires puppeteer or ghostscript
  // For now, return info that client-side handles this
  return NextResponse.json({ message: 'Use client-side PDF.js for image conversion' });
}
