'use client';

import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Download, Save, Eye, EyeOff } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { useEditorStore } from '@/stores/editorStore';
import { useDesignStore } from '@/stores/designStore';
import { cn } from '@/lib/cn';

interface ToolbarProps {
  onExportJSON?: () => void;
  onExportPNG?: () => void;
  onSave?: () => void;
}

export default function Toolbar({ onExportJSON, onExportPNG, onSave }: ToolbarProps) {
  const { undo, redo, canUndo, canRedo } = useHistory();
  const { zoom, setZoom, showPrintableArea, togglePrintableArea } = useEditorStore();
  const designName = useDesignStore((s) => s.design.name);
  const setDesignName = useDesignStore((s) => s.setDesignName);

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-3 gap-1">
      {/* Design name */}
      <input
        type="text"
        value={designName}
        onChange={(e) => setDesignName(e.target.value)}
        className="text-sm font-medium text-gray-800 bg-transparent border-none outline-none w-40 mr-4 hover:bg-gray-50 px-2 py-1 rounded"
      />

      <div className="h-6 w-px bg-gray-200 mx-1" />

      {/* Undo / Redo */}
      <ToolbarButton onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)">
        <Undo2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={redo} disabled={!canRedo()} title="Redo (Ctrl+Shift+Z)">
        <Redo2 className="w-4 h-4" />
      </ToolbarButton>

      <div className="h-6 w-px bg-gray-200 mx-1" />

      {/* Zoom */}
      <ToolbarButton onClick={() => setZoom(zoom - 0.1)} title="Zoom Out">
        <ZoomOut className="w-4 h-4" />
      </ToolbarButton>
      <span className="text-xs text-gray-600 w-12 text-center select-none">
        {Math.round(zoom * 100)}%
      </span>
      <ToolbarButton onClick={() => setZoom(zoom + 0.1)} title="Zoom In">
        <ZoomIn className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => setZoom(1)} title="Reset Zoom">
        <Maximize2 className="w-4 h-4" />
      </ToolbarButton>

      <div className="h-6 w-px bg-gray-200 mx-1" />

      {/* Printable area toggle */}
      <ToolbarButton onClick={togglePrintableArea} title="Toggle Printable Area">
        {showPrintableArea ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </ToolbarButton>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export / Save */}
      <ToolbarButton onClick={onSave} title="Save">
        <Save className="w-4 h-4" />
      </ToolbarButton>

      <div className="relative group">
        <ToolbarButton title="Export">
          <Download className="w-4 h-4" />
        </ToolbarButton>
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 hidden group-hover:block z-50 min-w-[140px]">
          <button
            onClick={onExportJSON}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Export JSON
          </button>
          <button
            onClick={onExportPNG}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Export PNG
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded hover:bg-gray-100 transition-colors',
        disabled && 'opacity-30 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}
