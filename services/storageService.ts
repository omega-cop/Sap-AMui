import { Category, Product } from '../types';

const STORAGE_KEYS = {
  CATEGORIES: 'spc_categories',
  PRODUCTS: 'spc_products',
};

// Initial Seed Data
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Đồ uống' },
  { id: 'cat_2', name: 'Đồ ăn vặt' },
  { id: 'cat_3', name: 'Gia vị' },
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'prod_1', name: 'Coca Cola', categoryId: 'cat_1', price: 10000, brand: 'Coca-Cola', images: [] },
  { id: 'prod_2', name: 'Snack Khoai Tây', categoryId: 'cat_2', price: 15000, brand: 'Lay\'s', images: [] },
  { id: 'prod_3', name: 'Nước Tương', categoryId: 'cat_3', price: 22000, brand: 'Chin-su', images: [] },
];

export const StorageService = {
  // Categories
  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  },

  saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  addCategory: (name: string) => {
    const cats = StorageService.getCategories();
    const newCat: Category = { id: `cat_${Date.now()}`, name };
    StorageService.saveCategories([...cats, newCat]);
    return newCat;
  },

  deleteCategory: (id: string) => {
    const cats = StorageService.getCategories();
    StorageService.saveCategories(cats.filter((c) => c.id !== id));
  },

  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    const products = JSON.parse(data);
    // Migration helper: ensure 'images' array exists if loading old data
    return products.map((p: any) => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : (p.imageUrl ? [p.imageUrl] : [])
    }));
  },

  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  addProduct: (product: Omit<Product, 'id'>) => {
    const prods = StorageService.getProducts();
    const newProd: Product = { ...product, id: `prod_${Date.now()}` };
    StorageService.saveProducts([...prods, newProd]);
    return newProd;
  },

  updateProduct: (updatedProduct: Product) => {
    const prods = StorageService.getProducts();
    const index = prods.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      prods[index] = updatedProduct;
      StorageService.saveProducts(prods);
    }
  },

  deleteProduct: (id: string) => {
    const prods = StorageService.getProducts();
    StorageService.saveProducts(prods.filter((p) => p.id !== id));
  },
};
