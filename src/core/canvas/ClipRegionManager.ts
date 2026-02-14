import * as fabric from 'fabric';
import type { PrintableArea } from '@/types/product';

export class ClipRegionManager {
  private canvas: fabric.Canvas;
  private printableArea: PrintableArea;
  private overlay: fabric.FabricObject | null = null;
  private clipPath: fabric.FabricObject | null = null;

  constructor(canvas: fabric.Canvas, printableArea: PrintableArea) {
    this.canvas = canvas;
    this.printableArea = printableArea;
    this.createClipPath();
  }

  private createClipPath(): void {
    const { shape, x, y, width, height } = this.printableArea;

    switch (shape.type) {
      case 'rect':
        this.clipPath = new fabric.Rect({
          left: x,
          top: y,
          width,
          height,
          rx: shape.borderRadius ?? 0,
          ry: shape.borderRadius ?? 0,
          absolutePositioned: true,
        });
        break;
      case 'ellipse':
        this.clipPath = new fabric.Ellipse({
          left: x,
          top: y,
          rx: width / 2,
          ry: height / 2,
          absolutePositioned: true,
        });
        break;
      case 'polygon':
        this.clipPath = new fabric.Polygon(shape.points, {
          left: x,
          top: y,
          absolutePositioned: true,
        });
        break;
    }
  }

  render(): void {
    // Render the dashed outline showing printable area bounds
    const { shape, x, y, width, height } = this.printableArea;

    if (shape.type === 'rect') {
      this.overlay = new fabric.Rect({
        left: x,
        top: y,
        width,
        height,
        rx: shape.borderRadius ?? 0,
        ry: shape.borderRadius ?? 0,
        fill: 'transparent',
        stroke: '#3b82f6',
        strokeWidth: 1.5,
        strokeDashArray: [8, 4],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        data: { isPrintableAreaOverlay: true },
      });
    } else if (shape.type === 'ellipse') {
      this.overlay = new fabric.Ellipse({
        left: x,
        top: y,
        rx: width / 2,
        ry: height / 2,
        fill: 'transparent',
        stroke: '#3b82f6',
        strokeWidth: 1.5,
        strokeDashArray: [8, 4],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        data: { isPrintableAreaOverlay: true },
      });
    }

    if (this.overlay) {
      this.canvas.add(this.overlay);
    }
  }

  applyClipToObject(obj: fabric.FabricObject): void {
    if (this.clipPath) {
      obj.clipPath = this.clipPath;
    }
  }

  setVisible(visible: boolean): void {
    if (this.overlay) {
      this.overlay.visible = visible;
      this.canvas.renderAll();
    }
  }

  getOverlayCount(): number {
    return this.overlay ? 1 : 0;
  }

  getPrintableArea(): PrintableArea {
    return this.printableArea;
  }
}
