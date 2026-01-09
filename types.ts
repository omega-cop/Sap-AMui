export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  brand: string;
  images: string[]; // Array of base64 strings
}

export interface ScanResult {
  product: Product | null;
  confidence: number;
  message?: string;
}
