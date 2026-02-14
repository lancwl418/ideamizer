import { create } from 'zustand';
import type { EditorTool } from '@/types/editor';

interface EditorStoreState {
  activeTool: EditorTool;
  zoom: number;
  selectedLayerIds: string[];
  showPrintableArea: boolean;
  // Actions
  setActiveTool: (tool: EditorTool) => void;
  setZoom: (zoom: number) => void;
  setSelectedLayerIds: (ids: string[]) => void;
  togglePrintableArea: () => void;
}

export const useEditorStore = create<EditorStoreState>((set) => ({
  activeTool: 'select',
  zoom: 1,
  selectedLayerIds: [],
  showPrintableArea: true,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setSelectedLayerIds: (ids) => set({ selectedLayerIds: ids }),
  togglePrintableArea: () =>
    set((state) => ({ showPrintableArea: !state.showPrintableArea })),
}));
