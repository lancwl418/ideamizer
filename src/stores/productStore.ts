import { create } from 'zustand';
import type { ProductTemplate } from '@/types/product';
import { templateRegistry } from '@/core/templates/ProductTemplateRegistry';

interface ProductStoreState {
  templates: ProductTemplate[];
  selectedTemplate: ProductTemplate | null;
  activeViewId: string;
  selectTemplate: (templateId: string) => void;
  setActiveView: (viewId: string) => void;
}

export const useProductStore = create<ProductStoreState>((set) => ({
  templates: templateRegistry.getAll(),
  selectedTemplate: templateRegistry.getAll()[0] ?? null,
  activeViewId: templateRegistry.getAll()[0]?.defaultViewId ?? '',

  selectTemplate: (templateId) => {
    const template = templateRegistry.getById(templateId);
    if (template) {
      set({
        selectedTemplate: template,
        activeViewId: template.defaultViewId,
      });
    }
  },

  setActiveView: (viewId) => {
    set({ activeViewId: viewId });
  },
}));
