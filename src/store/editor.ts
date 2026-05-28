import { create } from 'zustand';
import type { EditorTool, TextBlock } from '@/types';
import { generateId } from '@/lib/utils';

interface EditorState {
  fileName: string;
  isLoaded: boolean;
  isLoading: boolean;
  loadingMessage: string;
  activeTool: EditorTool;
  zoomLevel: number;
  selectedBlockId: string | null;
  editingBlockId: string | null;
  drawColor: string;
  drawWidth: number;

  setFileName: (name: string) => void;
  setLoading: (loading: boolean, message?: string) => void;
  setIsLoaded: (loaded: boolean) => void;
  setActiveTool: (tool: EditorTool) => void;
  setZoom: (level: number) => void;
  setSelectedBlock: (id: string | null) => void;
  setEditingBlock: (id: string | null) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  fileName: '',
  isLoaded: false,
  isLoading: false,
  loadingMessage: '',
  activeTool: 'select',
  zoomLevel: 100,
  selectedBlockId: null,
  editingBlockId: null,
  drawColor: '#E8392A',
  drawWidth: 2.5,

  setFileName: (name) => set({ fileName: name }),
  setLoading: (isLoading, loadingMessage = '') => set({ isLoading, loadingMessage }),
  setIsLoaded: (isLoaded) => set({ isLoaded }),
  setActiveTool: (activeTool) => set({ activeTool, selectedBlockId: null, editingBlockId: null }),
  setZoom: (level) => set({ zoomLevel: Math.min(200, Math.max(50, level)) }),
  setSelectedBlock: (id) => set({ selectedBlockId: id }),
  setEditingBlock: (id) => set({ editingBlockId: id }),
  reset: () => set({ fileName: '', isLoaded: false, isLoading: false, loadingMessage: '', activeTool: 'select', zoomLevel: 100, selectedBlockId: null, editingBlockId: null }),
}));
