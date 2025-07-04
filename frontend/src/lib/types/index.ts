export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images?: string[];
  category: string;
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  stockCount?: number;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
}

export interface Seller {
  id: string;
  name: string;
  description: string;
  avatar: string;
  rating: number;
  productCount: number;
  location?: string;
}
