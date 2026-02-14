'use client';

import { useDesignStore } from '@/stores/designStore';
import { useProductStore } from '@/stores/productStore';
import { useEditorStore } from '@/stores/editorStore';

interface PropertiesPanelProps {
  onUpdateTransform?: (layerId: string, transform: Record<string, unknown>) => void;
}

export default function PropertiesPanel({ onUpdateTransform }: PropertiesPanelProps) {
  const activeViewId = useProductStore((s) => s.activeViewId);
  const design = useDesignStore((s) => s.design);
  const updateLayer = useDesignStore((s) => s.updateLayer);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);

  const currentView = design.views[activeViewId];
  const selectedLayer = currentView?.layers.find((l) => l.id === selectedLayerIds[0]);

  if (!selectedLayer) {
    return (
      <div className="flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Properties
          </h3>
        </div>
        <div className="p-4 text-center text-sm text-gray-400">
          Select a layer to edit properties
        </div>
      </div>
    );
  }

  const { transform } = selectedLayer;

  const handleTransformChange = (key: string, value: number) => {
    const newTransform = { ...transform, [key]: value };
    updateLayer(activeViewId, selectedLayer.id, { transform: newTransform });
    onUpdateTransform?.(selectedLayer.id, { [key]: value });
  };

  const handleOpacityChange = (opacity: number) => {
    updateLayer(activeViewId, selectedLayer.id, { opacity });
  };

  return (
    <div className="flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Properties
        </h3>
      </div>

      <div className="p-3 space-y-3">
        {/* Layer name */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Name</label>
          <div className="text-sm font-medium text-gray-800">{selectedLayer.name}</div>
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <PropertyInput
            label="X"
            value={Math.round(transform.x)}
            onChange={(v) => handleTransformChange('x', v)}
          />
          <PropertyInput
            label="Y"
            value={Math.round(transform.y)}
            onChange={(v) => handleTransformChange('y', v)}
          />
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-2">
          <PropertyInput
            label="W"
            value={Math.round(transform.width * transform.scaleX)}
            onChange={(v) => handleTransformChange('scaleX', v / transform.width)}
          />
          <PropertyInput
            label="H"
            value={Math.round(transform.height * transform.scaleY)}
            onChange={(v) => handleTransformChange('scaleY', v / transform.height)}
          />
        </div>

        {/* Rotation */}
        <PropertyInput
          label="Rotation"
          value={Math.round(transform.rotation)}
          onChange={(v) => handleTransformChange('rotation', v)}
          suffix="°"
        />

        {/* Opacity */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Opacity</label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(selectedLayer.opacity * 100)}
            onChange={(e) => handleOpacityChange(Number(e.target.value) / 100)}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="text-xs text-gray-400 text-right mt-0.5">
            {Math.round(selectedLayer.opacity * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <div className="flex items-center">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
        />
        {suffix && <span className="text-xs text-gray-400 ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
