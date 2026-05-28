import type { Metadata } from 'next';
import { EditorClient } from './EditorClient';

export const metadata: Metadata = {
  title: 'PDF Editor — Edit PDF Online Free',
  description: 'Edit PDF files online. Click existing text to modify directly. Add text boxes, draw, sign. No signup needed.',
};

export default function EditorPage() {
  return <EditorClient />;
}
