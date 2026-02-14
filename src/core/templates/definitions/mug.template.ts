import type { ProductTemplate } from '@/types/product';

export const mugTemplate: ProductTemplate = {
  id: 'mug-classic',
  type: 'mug',
  name: 'Classic Mug',
  description: '11oz ceramic mug with wrap-around print area',
  defaultViewId: 'wrap',
  metadata: {},
  views: [
    {
      id: 'wrap',
      label: 'Wrap',
      mockupImageUrl: '/templates/mug-wrap.svg',
      mockupWidth: 900,
      mockupHeight: 400,
      printableArea: {
        shape: { type: 'rect' },
        x: 100,
        y: 50,
        width: 700,
        height: 300,
        physicalWidthInches: 8.5,
        physicalHeightInches: 3.5,
        minDPI: 150,
      },
    },
  ],
};
