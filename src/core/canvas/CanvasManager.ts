import * as fabric from 'fabric';
import type { ProductTemplate, ProductView } from '@/types/product';
import type { DesignLayer, DesignView } from '@/types/design';
import { ObjectFactory } from './ObjectFactory';
import { ClipRegionManager } from './ClipRegionManager';

export type CanvasEventHandler = {
  onObjectModified?: (layerId: string, transform: DesignLayer['transform']) => void;
  onSelectionChanged?: (layerIds: string[]) => void;
  onObjectAdded?: (layerId: string) => void;
  onObjectRemoved?: (layerId: string) => void;
};

export class CanvasManager {
  private canvas: fabric.Canvas | null = null;
  private clipRegion: ClipRegionManager | null = null;
  private currentView: ProductView | null = null;
  private eventHandlers: CanvasEventHandler = {};
  private backgroundImage: fabric.FabricImage | null = null;

  initialize(
    canvasElement: HTMLCanvasElement,
    template: ProductTemplate,
    viewId: string,
    handlers: CanvasEventHandler
  ): void {
    this.eventHandlers = handlers;

    this.canvas = new fabric.Canvas(canvasElement, {
      selection: true,
      preserveObjectStacking: true,
      backgroundColor: '#f0f0f0',
    });

    this.setupView(template, viewId);
    this.bindEvents();
  }

  async setupView(template: ProductTemplate, viewId: string): Promise<void> {
    const view = template.views.find((v) => v.id === viewId);
    if (!view || !this.canvas) return;

    this.currentView = view;
    this.canvas.setDimensions({ width: view.mockupWidth, height: view.mockupHeight });

    // Load mockup background
    try {
      const img = await fabric.FabricImage.fromURL(view.mockupImageUrl);
      if (!this.canvas) return; // canvas may have been disposed during await
      img.set({
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      img.scaleToWidth(view.mockupWidth);
      if (this.backgroundImage) {
        this.canvas.remove(this.backgroundImage);
      }
      this.backgroundImage = img;
      this.canvas.insertAt(0, img);
    } catch {
      // Mockup image not found — use plain background
      if (!this.canvas) return;
      this.canvas.backgroundColor = '#ffffff';
    }

    if (!this.canvas) return;

    // Setup printable area clip region
    this.clipRegion = new ClipRegionManager(this.canvas, view.printableArea);
    this.clipRegion.render();

    this.canvas.renderAll();
  }

  private bindEvents(): void {
    if (!this.canvas) return;

    this.canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (!obj || !obj.data?.layerId) return;
      this.eventHandlers.onObjectModified?.(obj.data.layerId as string, {
        x: obj.left ?? 0,
        y: obj.top ?? 0,
        width: obj.width ?? 0,
        height: obj.height ?? 0,
        rotation: obj.angle ?? 0,
        scaleX: obj.scaleX ?? 1,
        scaleY: obj.scaleY ?? 1,
        flipX: obj.flipX ?? false,
        flipY: obj.flipY ?? false,
      });
    });

    this.canvas.on('selection:created', (e) => {
      const ids = this.getSelectedLayerIds(e.selected);
      this.eventHandlers.onSelectionChanged?.(ids);
    });

    this.canvas.on('selection:updated', (e) => {
      const ids = this.getSelectedLayerIds(e.selected);
      this.eventHandlers.onSelectionChanged?.(ids);
    });

    this.canvas.on('selection:cleared', () => {
      this.eventHandlers.onSelectionChanged?.([]);
    });
  }

  private getSelectedLayerIds(selected?: fabric.FabricObject[]): string[] {
    if (!selected) return [];
    return selected
      .filter((obj) => obj.data?.layerId)
      .map((obj) => obj.data!.layerId as string);
  }

  addLayer(layer: DesignLayer): void {
    if (!this.canvas || !this.currentView) return;

    const obj = ObjectFactory.create(layer);
    if (!obj) return;

    // Apply printable area clipping
    if (this.clipRegion) {
      this.clipRegion.applyClipToObject(obj);
    }

    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.canvas.renderAll();
  }

  updateLayerTransform(layerId: string, transform: Partial<DesignLayer['transform']>): void {
    const obj = this.findObjectByLayerId(layerId);
    if (!obj) return;

    if (transform.x !== undefined) obj.left = transform.x;
    if (transform.y !== undefined) obj.top = transform.y;
    if (transform.rotation !== undefined) obj.angle = transform.rotation;
    if (transform.scaleX !== undefined) obj.scaleX = transform.scaleX;
    if (transform.scaleY !== undefined) obj.scaleY = transform.scaleY;
    if (transform.flipX !== undefined) obj.flipX = transform.flipX;
    if (transform.flipY !== undefined) obj.flipY = transform.flipY;

    obj.setCoords();
    this.canvas?.renderAll();
  }

  removeLayerFromCanvas(layerId: string): void {
    const obj = this.findObjectByLayerId(layerId);
    if (!obj || !this.canvas) return;
    this.canvas.remove(obj);
    this.canvas.renderAll();
  }

  setLayerVisibility(layerId: string, visible: boolean): void {
    const obj = this.findObjectByLayerId(layerId);
    if (!obj) return;
    obj.visible = visible;
    this.canvas?.renderAll();
  }

  setLayerLocked(layerId: string, locked: boolean): void {
    const obj = this.findObjectByLayerId(layerId);
    if (!obj) return;
    obj.selectable = !locked;
    obj.evented = !locked;
    this.canvas?.renderAll();
  }

  setLayerOpacity(layerId: string, opacity: number): void {
    const obj = this.findObjectByLayerId(layerId);
    if (!obj) return;
    obj.opacity = opacity;
    this.canvas?.renderAll();
  }

  reorderLayers(orderedIds: string[]): void {
    if (!this.canvas) return;

    // Start index after background image and clip region overlay
    let startIndex = 0;
    if (this.backgroundImage) startIndex++;
    if (this.clipRegion) startIndex += this.clipRegion.getOverlayCount();

    for (let i = 0; i < orderedIds.length; i++) {
      const obj = this.findObjectByLayerId(orderedIds[i]);
      if (obj) {
        // Remove and re-insert at target position
        this.canvas.remove(obj);
        this.canvas.insertAt(startIndex + i, obj);
      }
    }
    this.canvas.renderAll();
  }

  loadDesignView(designView: DesignView): void {
    if (!this.canvas) return;

    // Remove all existing design objects (keep background and overlays)
    const designObjects = this.canvas.getObjects().filter((o) => o.data?.layerId);
    for (const obj of designObjects) {
      this.canvas.remove(obj);
    }

    // Add layers from design
    for (const layer of designView.layers) {
      this.addLayer(layer);
    }
  }

  selectObject(layerId: string): void {
    const obj = this.findObjectByLayerId(layerId);
    if (!obj || !this.canvas) return;
    this.canvas.setActiveObject(obj);
    this.canvas.renderAll();
  }

  deselectAll(): void {
    this.canvas?.discardActiveObject();
    this.canvas?.renderAll();
  }

  setZoom(zoom: number): void {
    if (!this.canvas) return;
    const center = this.canvas.getCenterPoint();
    this.canvas.zoomToPoint(center, zoom);
    this.canvas.renderAll();
  }

  exportToDataURL(format: 'png' | 'jpeg' = 'png', multiplier = 1): string {
    if (!this.canvas || !this.currentView) return '';

    const { printableArea } = this.currentView;

    // Export only the printable area
    return this.canvas.toDataURL({
      format,
      multiplier,
      left: printableArea.x,
      top: printableArea.y,
      width: printableArea.width,
      height: printableArea.height,
    });
  }

  private findObjectByLayerId(layerId: string): fabric.FabricObject | undefined {
    return this.canvas?.getObjects().find((o) => o.data?.layerId === layerId);
  }

  getCanvas(): fabric.Canvas | null {
    return this.canvas;
  }

  dispose(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
    this.clipRegion = null;
    this.currentView = null;
    this.backgroundImage = null;
  }
}
