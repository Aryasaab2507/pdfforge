import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const merged = await PDFDocument.create();
    let totalPages = 0;

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => { merged.addPage(p); totalPages++; });
    }

    const result = await merged.save({ useObjectStreams: true });

    return new NextResponse(Buffer.from(result), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"',
        'X-Page-Count': String(totalPages),
      },
    });
  } catch (err) {
    console.error('Merge error:', err);
    return NextResponse.json({ error: 'Merge failed' }, { status: 500 });
  }
}
