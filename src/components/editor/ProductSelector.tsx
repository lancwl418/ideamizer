'use client';

import { useProductStore } from '@/stores/productStore';
import { Shirt, Coffee, Smartphone } from 'lucide-react';
import { cn } from '@/lib/cn';

const productIcons: Record<string, typeof Shirt> = {
  tshirt: Shirt,
  mug: Coffee,
  phonecase: Smartphone,
};

export default function ProductSelector() {
  const { templates, selectedTemplate, selectTemplate, activeViewId, setActiveView } =
    useProductStore();

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</h3>
      </div>

      <div className="p-2 space-y-1">
        {templates.map((template) => {
          const Icon = productIcons[template.type] ?? Shirt;
          const isSelected = selectedTemplate?.id === template.id;

          return (
            <button
              key={template.id}
              onClick={() => selectTemplate(template.id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                isSelected
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-4 h-4" />
              {template.name}
            </button>
          );
        })}
      </div>

      {selectedTemplate && selectedTemplate.views.length > 1 && (
        <>
          <div className="p-3 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">View</h3>
          </div>
          <div className="p-2 space-y-1">
            {selectedTemplate.views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={cn(
                  'w-full px-3 py-1.5 rounded-md text-sm transition-colors text-left',
                  activeViewId === view.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {view.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
