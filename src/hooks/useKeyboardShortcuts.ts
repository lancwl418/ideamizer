'use client';

import { useEffect } from 'react';
import { useHistory } from './useHistory';
import { useDesignStore } from '@/stores/designStore';
import { useEditorStore } from '@/stores/editorStore';
import { useProductStore } from '@/stores/productStore';

export function useKeyboardShortcuts(
  getManager: () => import('@/core/canvas/CanvasManager').CanvasManager | null
) {
  const { undo, redo } = useHistory();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;

      // Don't capture when typing in inputs
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const selectedIds = useEditorStore.getState().selectedLayerIds;
        const viewId = useProductStore.getState().activeViewId;
        for (const id of selectedIds) {
          useDesignStore.getState().removeLayer(viewId, id);
          getManager()?.removeLayerFromCanvas(id);
        }
        useEditorStore.getState().setSelectedLayerIds([]);
      } else if (e.key === 'Escape') {
        getManager()?.deselectAll();
      } else if (isMod && e.key === 'a') {
        e.preventDefault();
        // Select all is handled by fabric canvas
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, getManager]);
}
