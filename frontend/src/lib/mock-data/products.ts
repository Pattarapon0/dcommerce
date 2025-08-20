// Mock data for Products page UI development
// Based on ProductDto structure from backend

export enum ProductCategory {
  Electronics = 0,
  Clothing = 1,
  Books = 2,
  Home = 3,
  Sports = 4,
  Other = 5
}

export interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  baseCurrency: string;
  category: ProductCategory;
  stock: number;
  images: string[];
  mainImage: string;
  isActive: boolean;
  sellerId: string;
  sellerName: string;
  createdAt: string;
  updatedAt: string;
  salesCount: number;
}

// Helper to generate random product data
function createMockProduct(overrides: Partial<MockProduct> = {}): MockProduct {
  const categories = Object.values(ProductCategory).filter(v => typeof v === 'number') as ProductCategory[];
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  const baseProduct: MockProduct = {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    price: Math.floor(Math.random() * 10000) + 100,
    baseCurrency: 'THB',
    category,
    stock: Math.floor(Math.random() * 100),
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
    ],
    mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    isActive: Math.random() > 0.2, // 80% active
    sellerId: 'seller-123',
    sellerName: 'Demo Seller',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    salesCount: Math.floor(Math.random() * 500),
    ...overrides
  };

  return baseProduct;
}

// Realistic product data
export const mockProducts: MockProduct[] = [
  createMockProduct({
    name: 'iPhone 15 Pro Max',
    description: 'Latest Apple iPhone with titanium design and advanced camera system',
    category: ProductCategory.Electronics,
    price: 45900,
    stock: 12,
    salesCount: 156,
    mainImage: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with air cushioning technology',
    category: ProductCategory.Clothing,
    price: 4500,
    stock: 45,
    salesCount: 89,
    mainImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'MacBook Pro 16"',
    description: 'Professional laptop with M3 chip and stunning Retina display',
    category: ProductCategory.Electronics,
    price: 89900,
    stock: 3,
    salesCount: 67,
    mainImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'Vintage Denim Jacket',
    description: 'Classic blue denim jacket with comfortable fit',
    category: ProductCategory.Clothing,
    price: 1290,
    stock: 0, // Out of stock
    salesCount: 234,
    mainImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'The Art of War',
    description: 'Classic strategy book by Sun Tzu - English translation',
    category: ProductCategory.Books,
    price: 350,
    stock: 89,
    salesCount: 145,
    mainImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'Smart Home Hub',
    description: 'Control all your smart devices from one central hub',
    category: ProductCategory.Electronics,
    price: 2890,
    stock: 23,
    salesCount: 78,
    isActive: false, // Inactive product
    mainImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat with carrying case included',
    category: ProductCategory.Sports,
    price: 890,
    stock: 67,
    salesCount: 312,
    mainImage: 'https://images.unsplash.com/photo-1506629905607-d13b4d8e1beb?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'Coffee Maker Deluxe',
    description: 'Programmable coffee maker with built-in grinder',
    category: ProductCategory.Home,
    price: 3450,
    stock: 15,
    salesCount: 89,
    mainImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'Wireless Earbuds Pro',
    description: 'Noise-cancelling wireless earbuds with 24h battery life',
    category: ProductCategory.Electronics,
    price: 2990,
    stock: 34,
    salesCount: 178,
    mainImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'Leather Wallet',
    description: 'Genuine leather bifold wallet with RFID protection',
    category: ProductCategory.Other,
    price: 1250,
    stock: 56,
    salesCount: 92,
    mainImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'Gaming Mouse RGB',
    description: 'High-precision gaming mouse with customizable RGB lighting',
    category: ProductCategory.Electronics,
    price: 1890,
    stock: 78,
    salesCount: 156,
    mainImage: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'Cotton T-Shirt Pack',
    description: 'Pack of 3 premium cotton t-shirts in assorted colors',
    category: ProductCategory.Clothing,
    price: 890,
    stock: 123,
    salesCount: 267,
    mainImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'Cooking Essentials',
    description: 'Complete cookbook for beginner home chefs',
    category: ProductCategory.Books,
    price: 450,
    stock: 45,
    salesCount: 123,
    mainImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'Desk Lamp LED',
    description: 'Adjustable LED desk lamp with USB charging port',
    category: ProductCategory.Home,
    price: 1690,
    stock: 29,
    salesCount: 87,
    mainImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop'
  }),
  createMockProduct({
    name: 'Tennis Racket Pro',
    description: 'Professional tennis racket with carbon fiber frame',
    category: ProductCategory.Sports,
    price: 4590,
    stock: 8,
    salesCount: 34,
    mainImage: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop'
  })
];

// Helper functions for filtering and sorting
export const getCategoryName = (category: ProductCategory): string => {
  return ProductCategory[category];
};

export const getProductStatus = (product: MockProduct): string => {
  if (!product.isActive) return 'Inactive';
  if (product.stock === 0) return 'Out of Stock';
  if (product.stock < 10) return 'Low Stock';
  return 'Active';
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Active': return 'text-green-600';
    case 'Low Stock': return 'text-yellow-600';
    case 'Out of Stock': return 'text-red-600';
    case 'Inactive': return 'text-gray-500';
    default: return 'text-gray-600';
  }
};

export const formatPrice = (price: number, currency: string = 'THB'): string => {
  return `${price.toLocaleString()} ${currency}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};