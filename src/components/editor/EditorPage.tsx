'use client';

import { useCallback, useRef, useEffect } from 'react';
import EditorShell from './EditorShell';
import Toolbar from './Toolbar';
import ProductSelector from './ProductSelector';
import DesignUploader from './DesignUploader';
import LayerPanel from './LayerPanel';
import PropertiesPanel from './PropertiesPanel';
import { useDesignStore } from '@/stores/designStore';
import { useProductStore } from '@/stores/productStore';
import { ExportService } from '@/core/design/ExportService';
import type { DesignLayer } from '@/types/design';

export default function EditorPage() {
  const design = useDesignStore((s) => s.design);
  const loadDesign = useDesignStore((s) => s.loadDesign);
  const selectedTemplate = useProductStore((s) => s.selectedTemplate);
  const initDesign = useDesignStore((s) => s.initDesign);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize design on first render
  useEffect(() => {
    if (selectedTemplate && !design.productTemplateId) {
      initDesign(
        selectedTemplate.id,
        selectedTemplate.views.map((v) => v.id)
      );
    }
  }, [selectedTemplate, design.productTemplateId, initDesign]);

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    if (!design.productTemplateId) return;
    const timer = setTimeout(() => {
      ExportService.saveToLocal(design);
    }, 1000);
    return () => clearTimeout(timer);
  }, [design]);

  const handleExportJSON = useCallback(() => {
    ExportService.downloadJSON(design);
  }, [design]);

  const handleExportPNG = useCallback(() => {
    // PNG export requires canvas manager — dispatched via a custom event
    window.dispatchEvent(new CustomEvent('ideamizer:export-png'));
  }, []);

  const handleSave = useCallback(() => {
    ExportService.saveToLocal(design);
  }, [design]);

  const handleImportJSON = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const imported = ExportService.importJSON(reader.result as string);
        if (imported) {
          loadDesign(imported);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [loadDesign]
  );

  const handleLayerAdded = useCallback((_layer: DesignLayer) => {
    // Canvas will pick up the layer from the store subscription
    // For now, we dispatch a custom event so EditorCanvas can add it
    window.dispatchEvent(
      new CustomEvent('ideamizer:layer-added', { detail: _layer })
    );
  }, []);

  const handleReorderLayers = useCallback((orderedIds: string[]) => {
    window.dispatchEvent(
      new CustomEvent('ideamizer:layers-reordered', { detail: orderedIds })
    );
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        onExportJSON={handleExportJSON}
        onExportPNG={handleExportPNG}
        onSave={handleSave}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar: Product selector + Upload */}
        <div className="flex flex-col border-r border-gray-200 bg-white">
          <ProductSelector />
          <div className="p-3 border-t border-gray-200">
            <DesignUploader onLayerAdded={handleLayerAdded} />
            <button
              onClick={handleImportJSON}
              className="w-full mt-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>
        </div>

        {/* Canvas area */}
        <EditorShell />

        {/* Right sidebar: Layers + Properties */}
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
          <LayerPanel onReorderLayers={handleReorderLayers} onDuplicateLayer={handleLayerAdded} />
          <div className="border-t border-gray-200">
            <PropertiesPanel onReorderLayers={handleReorderLayers} />
          </div>
        </div>
      </div>
    </div>
  );
}
