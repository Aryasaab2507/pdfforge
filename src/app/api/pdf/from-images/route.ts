import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const images = formData.getAll('images') as File[];
    if (!images.length) return NextResponse.json({ error: 'No images' }, { status: 400 });

    const doc = await PDFDocument.create();
    for (const img of images) {
      const buf = await img.arrayBuffer();
      const isJpeg = img.type === 'image/jpeg';
      const isPng = img.type === 'image/png';
      if (!isJpeg && !isPng) continue;
      const embedded = isJpeg ? await doc.embedJpg(buf) : await doc.embedPng(buf);
      const page = doc.addPage([embedded.width, embedded.height]);
      page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
    }

    const result = await doc.save();
    return new NextResponse(Buffer.from(result), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted.pdf"',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
  }
}
