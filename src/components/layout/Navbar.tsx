'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const navLinks = [
  { label: 'Tools', href: '/#tools' },
  { label: 'Editor', href: '/editor' },
  { label: 'Pricing', href: '/#pricing' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isEditor = pathname === '/editor';

  return (
    <nav className={cn(
      'sticky top-0 z-50 border-b h-[62px] flex items-center px-6 md:px-8',
      isEditor
        ? 'bg-editor-surface border-editor-border'
        : 'bg-[rgba(250,250,249,0.94)] backdrop-blur-[12px] border-surface-3'
    )}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-display font-extrabold text-[21px] text-ink hover:opacity-90 transition-opacity flex-shrink-0 mr-6">
        <div className="w-8 h-8 bg-brand rounded-[8px] flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
            <rect x="2" y="1" width="10" height="13" rx="1.5"/>
            <rect x="5" y="13" width="10" height="4" rx="1"/>
            <line x1="4" y1="5" x2="10" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="4" y1="8" x2="10" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        PDF<span className="text-brand">forge</span>
      </Link>

      {/* Desktop nav links */}
      <ul className="hidden md:flex items-center gap-1 flex-1">
        {navLinks.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'text-sm font-medium px-3 py-1.5 rounded-lg transition-colors',
                isEditor ? 'text-editor-text2 hover:text-editor-text hover:bg-editor-surface2' : 'text-ink-2 hover:text-ink hover:bg-surface-2'
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="hidden md:flex items-center gap-2 ml-auto">
        <Button variant={isEditor ? 'editor' : 'ghost'} size="sm">
          Log in
        </Button>
        <Link href="/editor">
          <Button variant="primary" size="sm">
            Open Editor →
          </Button>
        </Link>
      </div>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden ml-auto text-ink-2"
        onClick={() => setMobileOpen(v => !v)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-[62px] left-0 right-0 bg-white border-b border-surface-3 shadow-card-lg p-4 flex flex-col gap-2 md:hidden z-50"
        >
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-2 px-3 py-2 rounded-lg hover:bg-surface-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 border-t border-surface-3">
            <Button variant="ghost" size="sm" className="flex-1">Log in</Button>
            <Link href="/editor" className="flex-1">
              <Button variant="primary" size="sm" className="w-full">Open Editor</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
