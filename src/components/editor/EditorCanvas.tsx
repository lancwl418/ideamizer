'use client';

import { useEffect } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useEditorStore } from '@/stores/editorStore';
import type { DesignLayer } from '@/types/design';

export default function EditorCanvas() {
  const { canvasRef, getManager } = useCanvas();
  const zoom = useEditorStore((s) => s.zoom);

  useKeyboardShortcuts(getManager);

  // Listen for layer-added events from EditorPage
  useEffect(() => {
    const handler = (e: Event) => {
      const layer = (e as CustomEvent<DesignLayer>).detail;
      getManager()?.addLayer(layer);
    };
    window.addEventListener('ideamizer:layer-added', handler);
    return () => window.removeEventListener('ideamizer:layer-added', handler);
  }, [getManager]);

  // Listen for PNG export requests
  useEffect(() => {
    const handler = () => {
      const manager = getManager();
      if (!manager) return;
      const dataURL = manager.exportToDataURL('png', 2);
      if (dataURL) {
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'design.png';
        a.click();
      }
    };
    window.addEventListener('ideamizer:export-png', handler);
    return () => window.removeEventListener('ideamizer:export-png', handler);
  }, [getManager]);

  return (
    <div className="relative flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-8">
      <div
        className="relative shadow-xl rounded-sm"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
