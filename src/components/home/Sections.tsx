'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PRICING_PLANS } from '@/config/tools';
import { Check, Zap, ShieldCheck, Clock, Sparkles, Layers, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  { icon: Zap, title: 'Lightning fast', desc: 'Optimized engine processes files in under 5 seconds.' },
  { icon: ShieldCheck, title: 'Privacy first', desc: '256-bit SSL, files auto-deleted in 2 hours, never shared.' },
  { icon: Clock, title: 'No signup required', desc: 'Use all 20+ tools instantly without creating an account.' },
  { icon: Sparkles, title: 'True inline editing', desc: 'Click existing PDF text and type directly — drag to reposition.' },
  { icon: Layers, title: 'Batch processing', desc: 'Process multiple files at once and save hours on large sets.' },
  { icon: Globe, title: 'AI-powered tools', desc: 'Summarize, translate, OCR — all built-in, all free.' },
];

const testimonials = [
  { text: '"PDFforge is the only PDF tool I ever need. Fast, simple, and completely free. I use it every single day."', name: 'Priya Rao', role: 'Content Manager, Bangalore', initials: 'PR', color: '#7C3AED' },
  { text: '"The inline editor saved us hours in our law firm. Click text, type, done. Exactly what we needed."', name: 'Arjun Mehta', role: 'Senior Lawyer, Delhi', initials: 'AM', color: '#16A34A' },
  { text: '"Cleanest, fastest, most complete PDF tool. The AI summarizer is a game changer for my research."', name: 'Sneha Kapoor', role: 'Student, Mumbai', initials: 'SK', color: '#E8392A' },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-ink py-20 px-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <p className="text-[12px] font-semibold tracking-[1.5px] uppercase text-[#FF8A7A] mb-2">Why PDFforge</p>
          <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] tracking-tight text-white mb-3">
            Built for speed, privacy & power
          </h2>
          <p className="text-[16px] text-white/55 max-w-[460px] mx-auto">No bloat. No subscriptions. No compromises.</p>
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-white/[0.06] border border-white/10 rounded-lg p-7"
            >
              <div className="w-10 h-10 bg-brand/20 rounded-[10px] flex items-center justify-center mb-4">
                <feat.icon className="w-5 h-5 text-[#FF8A7A]" strokeWidth={1.8} />
              </div>
              <h3 className="font-display font-bold text-[17px] text-white mb-2">{feat.title}</h3>
              <p className="text-[14px] text-white/55 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-surface-2 py-20 px-6 border-y border-surface-3">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-10">
          <p className="text-[12px] font-semibold tracking-[1.5px] uppercase text-brand mb-2">Testimonials</p>
          <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] tracking-tight text-ink">Loved by millions</h2>
        </div>
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white border border-surface-3 rounded-lg p-7">
              <div className="text-[#F59E0B] text-sm mb-3">★★★★★</div>
              <blockquote className="text-[15px] text-ink-2 leading-relaxed mb-5 italic">{t.text}</blockquote>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white" style={{ background: t.color }}>{t.initials}</div>
                <div>
                  <p className="text-[13px] font-semibold text-ink">{t.name}</p>
                  <p className="text-[12px] text-ink-3">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-6 max-w-[1000px] mx-auto text-center">
      <p className="text-[12px] font-semibold tracking-[1.5px] uppercase text-brand mb-2">Pricing</p>
      <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] tracking-tight text-ink mb-3">
        Simple, honest pricing
      </h2>
      <p className="text-[16px] text-ink-3 max-w-[460px] mx-auto mb-14">Start for free. Upgrade when you need more.</p>

      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {PRICING_PLANS.map(plan => (
          <div
            key={plan.id}
            className={cn(
              'rounded-2xl p-8 text-left',
              plan.featured ? 'bg-ink text-white' : 'bg-white border border-surface-3'
            )}
          >
            <p className={cn('text-[12px] font-semibold tracking-[1.5px] uppercase mb-4', plan.featured ? 'text-[#FF8A7A]' : 'text-brand')}>
              {plan.name}
            </p>
            <div className="flex items-baseline gap-1 mb-2">
              <strong className={cn('font-display text-[44px] font-extrabold tracking-[-2px]', plan.featured ? 'text-white' : 'text-ink')}>
                {plan.price.inr === 0 ? '₹0' : `₹${plan.price.inr}`}
              </strong>
              <span className={cn('text-[15px]', plan.featured ? 'text-white/50' : 'text-ink-3')}>/ month</span>
            </div>
            <p className={cn('text-sm mb-6', plan.featured ? 'text-white/55' : 'text-ink-3')}>{plan.description}</p>
            <ul className="space-y-0 mb-7">
              {plan.features.map(f => (
                <li key={f} className={cn('flex items-center gap-2 text-sm py-[7px] border-b', plan.featured ? 'text-white/80 border-white/10' : 'text-ink-2 border-surface-3', 'last:border-none')}>
                  <Check className={cn('w-4 h-4 flex-shrink-0', plan.featured ? 'text-[#FF8A7A]' : 'text-brand')} />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/editor" className="block">
              <Button
                variant={plan.featured ? 'hero' : 'outline'}
                className="w-full"
                size="md"
              >
                {plan.price.inr === 0 ? 'Start free →' : `Start ${plan.name} trial →`}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  const cols = [
    {
      title: 'Tools',
      links: ['Merge PDF', 'Edit PDF', 'Compress PDF', 'PDF to Word', 'Sign PDF'],
    },
    {
      title: 'Company',
      links: ['About us', 'Blog', 'Pricing', 'API', 'Careers'],
    },
    {
      title: 'Support',
      links: ['Help center', 'Contact', 'Privacy', 'Terms', 'Security'],
    },
  ];

  return (
    <footer className="bg-ink text-white/60 pt-16 pb-8 px-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid gap-10 mb-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div>
            <Link href="/" className="flex items-center gap-2 font-display font-extrabold text-[20px] text-white mb-3">
              <div className="w-7 h-7 bg-brand rounded-[7px] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="white"><rect x="2" y="1" width="10" height="13" rx="1.5"/><rect x="5" y="13" width="10" height="4" rx="1"/></svg>
              </div>
              PDF<span className="text-brand">forge</span>
            </Link>
            <p className="text-[14px] leading-relaxed max-w-[220px]">Every PDF tool you'll ever need — fast, free, and private.</p>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="font-display font-bold text-[12px] uppercase tracking-[1px] text-white mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-[14px] text-white/50 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px]">© 2026 PDFforge. All rights reserved.</p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
              <a key={l} href="#" className="text-[13px] text-white/40 hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
