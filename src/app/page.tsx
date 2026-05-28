import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { ToolsGrid } from '@/components/home/ToolsGrid';
import { FeaturesSection, TestimonialsSection, PricingSection, Footer } from '@/components/home/Sections';

const trustItems = [
  { icon: '🔒', label: 'No file stored after 2 hours' },
  { icon: '🛡️', label: '256-bit SSL encryption' },
  { icon: '📋', label: 'GDPR compliant' },
  { icon: '⚡', label: 'Auto-deleted files' },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        {/* Trust bar */}
        <div className="bg-surface-2 border-y border-surface-3 py-3 px-6 flex items-center justify-center gap-8 flex-wrap">
          {trustItems.map(t => (
            <div key={t.label} className="flex items-center gap-2 text-[13px] font-medium text-ink-3">
              <span>{t.icon}</span>
              {t.label}
            </div>
          ))}
        </div>
        <ToolsGrid />
        <FeaturesSection />
        {/* How it works */}
        <section className="py-20 px-6 max-w-[860px] mx-auto text-center">
          <p className="text-[12px] font-semibold tracking-[1.5px] uppercase text-brand mb-2">How it works</p>
          <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] tracking-tight text-ink mb-3">Three steps, done</h2>
          <p className="text-[16px] text-ink-3 mb-14">No tutorials needed. No experience required.</p>
          <div className="relative flex gap-0 flex-col sm:flex-row">
            <div className="hidden sm:block absolute top-[22px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-surface-3 to-transparent" />
            {[
              { n: '1', title: 'Choose your tool', desc: 'Pick from 20+ tools — merge, compress, convert, sign and more' },
              { n: '2', title: 'Upload your PDF', desc: 'Drag and drop or select from device, Google Drive, or Dropbox' },
              { n: '3', title: 'Download result', desc: 'File is processed instantly — download or share the link' },
            ].map(step => (
              <div key={step.n} className="flex-1 text-center px-4 mb-8 sm:mb-0">
                <div className="w-11 h-11 bg-white border-2 border-brand rounded-full flex items-center justify-center font-display font-extrabold text-[16px] text-brand mx-auto mb-4 relative z-10">
                  {step.n}
                </div>
                <h4 className="font-display font-bold text-[15px] text-ink mb-2">{step.title}</h4>
                <p className="text-[13px] text-ink-3 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <TestimonialsSection />
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
