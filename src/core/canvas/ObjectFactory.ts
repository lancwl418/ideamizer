import * as fabric from 'fabric';
import type { DesignLayer } from '@/types/design';

export class ObjectFactory {
  static create(layer: DesignLayer): fabric.FabricObject | null {
    let obj: fabric.FabricObject | null = null;

    switch (layer.data.type) {
      case 'image':
        // Images are loaded asynchronously — create a placeholder rect
        // and replace it when the image loads
        obj = ObjectFactory.createImagePlaceholder(layer);
        ObjectFactory.loadImage(layer, obj);
        break;
      case 'text':
        obj = ObjectFactory.createText(layer);
        break;
      case 'shape':
        obj = ObjectFactory.createShape(layer);
        break;
    }

    if (obj) {
      ObjectFactory.applyCommonProps(obj, layer);
    }

    return obj;
  }

  private static createImagePlaceholder(layer: DesignLayer): fabric.Rect {
    return new fabric.Rect({
      width: layer.transform.width,
      height: layer.transform.height,
      fill: '#e5e7eb',
      stroke: '#d1d5db',
      strokeWidth: 1,
    });
  }

  private static loadImage(layer: DesignLayer, placeholder: fabric.FabricObject): void {
    if (layer.data.type !== 'image') return;

    fabric.FabricImage.fromURL(layer.data.src).then((img) => {
      const canvas = placeholder.canvas;
      if (!canvas) return;

      // Copy properties from placeholder
      img.set({
        left: placeholder.left,
        top: placeholder.top,
        angle: placeholder.angle,
        scaleX: placeholder.scaleX,
        scaleY: placeholder.scaleY,
        flipX: placeholder.flipX,
        flipY: placeholder.flipY,
        opacity: placeholder.opacity,
        clipPath: placeholder.clipPath,
        data: placeholder.data,
      });

      // Scale image to fit the specified dimensions
      const imgWidth = img.width ?? 1;
      const imgHeight = img.height ?? 1;
      img.scaleX = (layer.transform.width * (layer.transform.scaleX ?? 1)) / imgWidth;
      img.scaleY = (layer.transform.height * (layer.transform.scaleY ?? 1)) / imgHeight;

      // Replace placeholder with actual image
      const index = canvas.getObjects().indexOf(placeholder);
      canvas.remove(placeholder);
      canvas.insertAt(index, img);
      canvas.renderAll();
    });
  }

  private static createText(layer: DesignLayer): fabric.Textbox | null {
    if (layer.data.type !== 'text') return null;

    return new fabric.Textbox(layer.data.content, {
      fontFamily: layer.data.fontFamily,
      fontSize: layer.data.fontSize,
      fontWeight: layer.data.fontWeight as string | number,
      fontStyle: layer.data.fontStyle,
      textAlign: layer.data.textAlign,
      fill: layer.data.fill,
      stroke: layer.data.stroke ?? undefined,
      strokeWidth: layer.data.strokeWidth ?? 0,
      lineHeight: layer.data.lineHeight,
      charSpacing: layer.data.charSpacing,
      width: layer.transform.width,
    });
  }

  private static createShape(layer: DesignLayer): fabric.FabricObject | null {
    if (layer.data.type !== 'shape') return null;

    const { shapeType, fill, stroke, strokeWidth, borderRadius } = layer.data;
    const { width, height } = layer.transform;

    switch (shapeType) {
      case 'rect':
        return new fabric.Rect({
          width,
          height,
          fill,
          stroke,
          strokeWidth,
          rx: borderRadius ?? 0,
          ry: borderRadius ?? 0,
        });
      case 'circle':
        return new fabric.Circle({
          radius: Math.min(width, height) / 2,
          fill,
          stroke,
          strokeWidth,
        });
      case 'ellipse':
        return new fabric.Ellipse({
          rx: width / 2,
          ry: height / 2,
          fill,
          stroke,
          strokeWidth,
        });
      case 'triangle':
        return new fabric.Triangle({
          width,
          height,
          fill,
          stroke,
          strokeWidth,
        });
      default:
        return null;
    }
  }

  private static applyCommonProps(obj: fabric.FabricObject, layer: DesignLayer): void {
    obj.set({
      left: layer.transform.x,
      top: layer.transform.y,
      angle: layer.transform.rotation,
      scaleX: layer.transform.scaleX,
      scaleY: layer.transform.scaleY,
      flipX: layer.transform.flipX,
      flipY: layer.transform.flipY,
      opacity: layer.opacity,
      visible: layer.visible,
      selectable: !layer.locked,
      evented: !layer.locked,
      data: { layerId: layer.id, layerType: layer.type },
    });
  }
}
