export const GARMENT_CATALOG = {
  Shirt: 49,
  Pants: 59,
  Saree: 149,
  Suit: 199,
  Jacket: 129,
  Kurta: 79,
  Dress: 99,
  Bedsheet: 119,
  Curtain: 139,
  Woolen: 169,
} as const;

export type GarmentName = keyof typeof GARMENT_CATALOG;

export const GARMENT_NAMES = Object.keys(GARMENT_CATALOG) as GarmentName[];
