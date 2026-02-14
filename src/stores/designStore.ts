import { create } from 'zustand';
import { temporal } from 'zundo';
import type { DesignDocument, DesignLayer, DesignView } from '@/types/design';
import { generateId } from '@/lib/id';

interface DesignStoreState {
  design: DesignDocument;
  // Actions
  initDesign: (productTemplateId: string, viewIds: string[]) => void;
  loadDesign: (design: DesignDocument) => void;
  addLayer: (viewId: string, layer: DesignLayer) => void;
  removeLayer: (viewId: string, layerId: string) => void;
  updateLayer: (viewId: string, layerId: string, changes: Partial<DesignLayer>) => void;
  reorderLayers: (viewId: string, orderedIds: string[]) => void;
  setDesignName: (name: string) => void;
}

function createEmptyDesign(): DesignDocument {
  return {
    version: '1.0.0',
    id: generateId(),
    name: 'Untitled Design',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    productTemplateId: '',
    views: {},
    metadata: {},
  };
}

export const useDesignStore = create<DesignStoreState>()(
  temporal(
    (set) => ({
      design: createEmptyDesign(),

      initDesign: (productTemplateId, viewIds) => {
        const views: Record<string, DesignView> = {};
        for (const viewId of viewIds) {
          views[viewId] = { viewId, layers: [] };
        }
        set({
          design: {
            ...createEmptyDesign(),
            productTemplateId,
            views,
          },
        });
      },

      loadDesign: (design) => {
        set({ design });
      },

      addLayer: (viewId, layer) =>
        set((state) => {
          const view = state.design.views[viewId];
          if (!view) return state;
          return {
            design: {
              ...state.design,
              updatedAt: new Date().toISOString(),
              views: {
                ...state.design.views,
                [viewId]: {
                  ...view,
                  layers: [...view.layers, layer],
                },
              },
            },
          };
        }),

      removeLayer: (viewId, layerId) =>
        set((state) => {
          const view = state.design.views[viewId];
          if (!view) return state;
          return {
            design: {
              ...state.design,
              updatedAt: new Date().toISOString(),
              views: {
                ...state.design.views,
                [viewId]: {
                  ...view,
                  layers: view.layers.filter((l) => l.id !== layerId),
                },
              },
            },
          };
        }),

      updateLayer: (viewId, layerId, changes) =>
        set((state) => {
          const view = state.design.views[viewId];
          if (!view) return state;
          return {
            design: {
              ...state.design,
              updatedAt: new Date().toISOString(),
              views: {
                ...state.design.views,
                [viewId]: {
                  ...view,
                  layers: view.layers.map((l) =>
                    l.id === layerId ? { ...l, ...changes } : l
                  ),
                },
              },
            },
          };
        }),

      reorderLayers: (viewId, orderedIds) =>
        set((state) => {
          const view = state.design.views[viewId];
          if (!view) return state;
          const layerMap = new Map(view.layers.map((l) => [l.id, l]));
          const reordered = orderedIds
            .map((id) => layerMap.get(id))
            .filter((l): l is DesignLayer => l !== undefined);
          return {
            design: {
              ...state.design,
              updatedAt: new Date().toISOString(),
              views: {
                ...state.design.views,
                [viewId]: { ...view, layers: reordered },
              },
            },
          };
        }),

      setDesignName: (name) =>
        set((state) => ({
          design: {
            ...state.design,
            name,
            updatedAt: new Date().toISOString(),
          },
        })),
    }),
    {
      limit: 50,
      partialize: (state) => ({ design: state.design }),
    }
  )
);
