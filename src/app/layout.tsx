import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'PDFforge — Every PDF Tool, One Place', template: '%s | PDFforge' },
  description: 'Edit, convert, compress, merge, split, sign and secure your PDFs. Free online PDF tools with inline editing.',
  keywords: ['PDF editor', 'merge PDF', 'compress PDF', 'PDF to Word', 'split PDF', 'PDF tools'],
  openGraph: {
    type: 'website',
    title: 'PDFforge — Every PDF Tool, One Place',
    description: 'Edit, convert, compress, merge, split, sign and secure your PDFs. Free, fast, private.',
    siteName: 'PDFforge',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#E8392A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-surface text-ink">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1A1917',
              border: '1px solid #3D3A36',
              color: '#F5F2EE',
              fontSize: '13px',
              borderRadius: '8px',
            },
          }}
        />
      </body>
    </html>
  );
}
