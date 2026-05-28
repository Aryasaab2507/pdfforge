'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const stats = [
  { value: '20+', label: 'PDF tools' },
  { value: '2M+', label: 'Files processed' },
  { value: '100%', label: 'Free to use' },
  { value: 'SSL', label: 'Secured' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function Hero() {
  return (
    <section className="pt-20 pb-16 px-6 text-center max-w-[800px] mx-auto">
      <motion.div variants={container} initial="hidden" animate="show">

        {/* Badge */}
        <motion.div variants={item} className="inline-flex items-center gap-2 bg-brand-light text-brand-dark text-[13px] font-medium px-4 py-[5px] rounded-full mb-6 border border-brand/20">
          <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
          100% Free · No signup · Works in browser
        </motion.div>

        {/* Heading */}
        <motion.h1 variants={item} className="font-display font-extrabold text-[clamp(42px,7vw,70px)] leading-[1.04] tracking-[-2.5px] text-ink mb-5">
          Every PDF tool<br />
          in <em className="not-italic text-brand">one forge</em>
        </motion.h1>

        {/* Sub */}
        <motion.p variants={item} className="text-[18px] text-ink-3 max-w-[500px] mx-auto mb-9 leading-[1.7]">
          Edit, convert, compress, merge, split, sign and secure your PDFs.
          Click existing text to edit directly — no extra app needed.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/editor">
            <Button variant="hero" size="lg" className="gap-2">
              <Zap className="w-4 h-4" />
              Open PDF Editor
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="#tools">
            <Button variant="outline" size="lg">
              Browse all tools
            </Button>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="flex justify-center gap-8 md:gap-12 mt-14 pt-8 border-t border-surface-3 flex-wrap">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <strong className="block font-display text-[28px] font-extrabold tracking-[-1px] text-ink">{stat.value}</strong>
              <span className="text-[13px] text-ink-3">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
