import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const text = (formData.get('text') as string) || 'CONFIDENTIAL';
    const opacity = Number(formData.get('opacity') || 0.3);
    const position = (formData.get('position') as string) || 'diagonal';
    const colorHex = (formData.get('color') as string) || '#E8392A';

    const r = parseInt(colorHex.slice(1, 3), 16) / 255;
    const g = parseInt(colorHex.slice(3, 5), 16) / 255;
    const b = parseInt(colorHex.slice(5, 7), 16) / 255;

    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 48;

    doc.getPages().forEach(page => {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: height / 2,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
        rotate: position === 'diagonal' ? degrees(45) : degrees(0),
      });
    });

    const result = await doc.save();
    return new NextResponse(Buffer.from(result), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="watermarked.pdf"',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Watermark failed' }, { status: 500 });
  }
}
