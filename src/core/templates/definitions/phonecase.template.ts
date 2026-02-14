import type { ProductTemplate } from '@/types/product';

export const phonecaseTemplate: ProductTemplate = {
  id: 'phonecase-classic',
  type: 'phonecase',
  name: 'Phone Case',
  description: 'Slim phone case with back print area',
  defaultViewId: 'back',
  metadata: {},
  views: [
    {
      id: 'back',
      label: 'Back',
      mockupImageUrl: '/templates/phonecase-back.svg',
      mockupWidth: 400,
      mockupHeight: 800,
      printableArea: {
        shape: { type: 'rect', borderRadius: 20 },
        x: 50,
        y: 80,
        width: 300,
        height: 600,
        physicalWidthInches: 2.75,
        physicalHeightInches: 5.5,
        minDPI: 200,
      },
    },
  ],
};
