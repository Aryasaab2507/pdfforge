import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/home/Sections';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
