import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const level = (formData.get('level') as string) || 'medium';

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    if (level === 'high') {
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setKeywords([]);
      doc.setProducer('PDFforge');
      doc.setCreator('PDFforge');
    }

    const result = await doc.save({ useObjectStreams: true, addDefaultPage: false });
    const saved = buffer.byteLength - result.byteLength;
    const pct = Math.max(0, Math.round((saved / buffer.byteLength) * 100));

    return new NextResponse(Buffer.from(result), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compressed.pdf"`,
        'X-Original-Size': String(buffer.byteLength),
        'X-Result-Size': String(result.byteLength),
        'X-Reduction-Pct': String(pct),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Compression failed' }, { status: 500 });
  }
}
