'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TOOLS, TOOL_CATEGORIES } from '@/config/tools';
import type { ToolCategory } from '@/types';
import {
  Combine, Scissors, LayoutGrid, FileOutput, FileText, Table, Image,
  FileUp, Images, PenLine, Stamp, RotateCw, Hash, Crop, Lock, Unlock,
  Minimize2, Wrench, Sparkles, Languages, ScanText, EyeOff, Signature, Sheet
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Combine, Scissors, LayoutGrid, FileOutput, FileText, Table, Image,
  FileUp, Images, PenLine, Stamp, RotateCw, Hash, Crop, Lock, Unlock,
  Minimize2, Wrench, Sparkles, Languages, ScanText, EyeOff, Signature, Sheet,
};

const badgeStyles: Record<string, string> = {
  popular: 'bg-[#FFF3CD] text-[#7A5C00]',
  new: 'bg-[#E8F5E9] text-[#1B5E20]',
  ai: 'bg-[#EDE7F6] text-[#4527A0]',
  free: 'bg-[#E8F5E9] text-[#1B5E20]',
};

export function ToolsGrid() {
  const [activeCategory, setActiveCategory] = useState<'all' | ToolCategory>('all');

  const filtered = TOOLS.filter(t =>
    activeCategory === 'all' || t.category === activeCategory
  );

  return (
    <section id="tools" className="py-16 px-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-[12px] font-semibold tracking-[1.5px] uppercase text-brand mb-2">All Tools</p>
        <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] tracking-tight text-ink mb-3">
          Everything your PDFs need
        </h2>
        <p className="text-[16px] text-ink-3 max-w-[460px] mx-auto">
          Professional-grade tools, simple enough for everyone
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
        {TOOL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as 'all' | ToolCategory)}
            className={cn(
              'text-[13px] font-medium px-4 py-[7px] rounded-full border transition-all',
              activeCategory === cat.id
                ? 'bg-brand border-brand text-white'
                : 'bg-white border-surface-3 text-ink-2 hover:border-[#C0B8B0] hover:bg-surface-2'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((tool, i) => {
            const Icon = iconMap[tool.icon];
            return (
              <motion.div
                key={tool.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.03 } }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Link
                  href={tool.href}
                  className="block bg-white border border-surface-3 rounded-lg p-6 relative overflow-hidden group transition-all duration-200 hover:-translate-y-[3px] hover:shadow-card-lg hover:border-[#C0B8B0] tool-card-line"
                  style={{ '--tw-color': tool.color } as React.CSSProperties}
                >
                  {/* Badge */}
                  {tool.badge && (
                    <span className={cn('absolute top-[14px] right-[14px] text-[10px] font-semibold uppercase tracking-[0.5px] px-2 py-[3px] rounded-md', badgeStyles[tool.badge])}>
                      {tool.badge}
                    </span>
                  )}

                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: tool.iconBg }}
                  >
                    {Icon && <Icon className="w-[22px] h-[22px]" strokeWidth={1.8} />}
                  </div>

                  {/* Text */}
                  <p className="font-display font-bold text-[15px] text-ink mb-1.5">{tool.name}</p>
                  <p className="text-[13px] text-ink-3 leading-snug">{tool.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
