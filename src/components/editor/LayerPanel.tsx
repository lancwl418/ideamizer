'use client';

import { Eye, EyeOff, Lock, Unlock, Trash2, GripVertical } from 'lucide-react';
import { useDesignStore } from '@/stores/designStore';
import { useProductStore } from '@/stores/productStore';
import { useEditorStore } from '@/stores/editorStore';
import { cn } from '@/lib/cn';
import type { DesignLayer } from '@/types/design';

interface LayerPanelProps {
  onSelectLayer?: (layerId: string) => void;
  onRemoveLayer?: (layerId: string) => void;
  onToggleVisibility?: (layerId: string, visible: boolean) => void;
  onToggleLock?: (layerId: string, locked: boolean) => void;
}

export default function LayerPanel({
  onSelectLayer,
  onRemoveLayer,
  onToggleVisibility,
  onToggleLock,
}: LayerPanelProps) {
  const activeViewId = useProductStore((s) => s.activeViewId);
  const design = useDesignStore((s) => s.design);
  const updateLayer = useDesignStore((s) => s.updateLayer);
  const removeLayer = useDesignStore((s) => s.removeLayer);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const setSelectedLayerIds = useEditorStore((s) => s.setSelectedLayerIds);

  const currentView = design.views[activeViewId];
  const layers = currentView?.layers ?? [];

  const handleToggleVisibility = (layer: DesignLayer) => {
    const newVisible = !layer.visible;
    updateLayer(activeViewId, layer.id, { visible: newVisible });
    onToggleVisibility?.(layer.id, newVisible);
  };

  const handleToggleLock = (layer: DesignLayer) => {
    const newLocked = !layer.locked;
    updateLayer(activeViewId, layer.id, { locked: newLocked });
    onToggleLock?.(layer.id, newLocked);
  };

  const handleRemove = (layerId: string) => {
    removeLayer(activeViewId, layerId);
    onRemoveLayer?.(layerId);
    setSelectedLayerIds(selectedLayerIds.filter((id) => id !== layerId));
  };

  const handleSelect = (layerId: string) => {
    setSelectedLayerIds([layerId]);
    onSelectLayer?.(layerId);
  };

  return (
    <div className="flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Layers</h3>
      </div>

      {layers.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-400">
          No layers yet. Upload an image to start.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {[...layers].reverse().map((layer) => {
            const isSelected = selectedLayerIds.includes(layer.id);

            return (
              <div
                key={layer.id}
                onClick={() => handleSelect(layer.id)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 cursor-pointer group',
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                )}
              >
                <GripVertical className="w-3 h-3 text-gray-300 cursor-grab" />

                {/* Layer type indicator */}
                <div
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center text-[10px] font-medium',
                    layer.type === 'image' && 'bg-purple-100 text-purple-600',
                    layer.type === 'text' && 'bg-green-100 text-green-600',
                    layer.type === 'shape' && 'bg-orange-100 text-orange-600'
                  )}
                >
                  {layer.type === 'image' ? 'IMG' : layer.type === 'text' ? 'T' : 'S'}
                </div>

                {/* Layer name */}
                <span className="flex-1 text-xs text-gray-700 truncate">{layer.name}</span>

                {/* Actions */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVisibility(layer);
                  }}
                  className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {layer.visible ? (
                    <Eye className="w-3 h-3 text-gray-400" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-gray-300" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLock(layer);
                  }}
                  className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {layer.locked ? (
                    <Lock className="w-3 h-3 text-gray-400" />
                  ) : (
                    <Unlock className="w-3 h-3 text-gray-300" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(layer.id);
                  }}
                  className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
