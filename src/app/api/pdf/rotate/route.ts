import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, degrees } from 'pdf-lib';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const angle = Number(formData.get('angle') || 90) as 90 | 180 | 270;

    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer);
    doc.getPages().forEach(page => {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + angle) % 360));
    });
    const result = await doc.save();

    return new NextResponse(Buffer.from(result), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="rotated.pdf"',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Rotation failed' }, { status: 500 });
  }
}
