'use client';
import { useState, useCallback } from 'react';
import { Lock } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import { protectPDF } from '@/lib/pdf/engine';
import type { UploadFile } from '@/components/ui/UploadZone';

export default function ProtectPage() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const processFiles = useCallback(async (files: UploadFile[]): Promise<UploadFile[]> => {
    const results: UploadFile[] = [];
    for (const f of files) {
      const buf = await f.file.arrayBuffer();
      const result = await protectPDF(buf, { password });
      if (result.success && result.data) {
        results.push({ ...f, status: 'done' as const, progress: 100, resultBuffer: result.data, resultName: `protected-${f.file.name}` });
      } else {
        results.push({ ...f, status: 'error' as const, error: result.error });
      }
    }
    return results;
  }, [password]);

  const options = (
    <div>
      <label className="text-xs font-medium text-ink-3 mb-1.5 block">Password</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full h-10 px-3 pr-10 border border-surface-3 rounded-lg text-sm focus:outline-none focus:border-brand"
          placeholder="Enter password"
        />
        <button onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 text-xs">
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );

  return (
    <ToolPage
      title="Protect PDF"
      description="Add a password to encrypt and protect your PDF from unauthorized access."
      accept=".pdf"
      color="#16A34A"
      icon={<Lock className="w-8 h-8" strokeWidth={1.6} />}
      options={options}
      processFiles={processFiles}
      actionLabel="Protect PDF →"
    />
  );
}
