import { Product } from '@/lib/types';

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Handcrafted Wooden Watch",
    description: "Beautiful minimalist wooden watch made from sustainable bamboo with leather strap.",
    price: 89.99,
    originalPrice: 119.99,
    imageUrl: "/images/products/wooden-watch.jpg",
    images: ["/images/products/wooden-watch.jpg", "/images/products/wooden-watch-2.jpg"],
    category: "Accessories",
    seller: {
      id: "seller-1",
      name: "WoodCraft Studio",
      avatar: "/images/sellers/woodcraft.jpg"
    },
    rating: 4.8,
    reviewCount: 127,
    inStock: true,
    stockCount: 23,
    tags: ["handmade", "eco-friendly", "sustainable"]
  },
  {
    id: "2",
    name: "Artisan Ceramic Mug Set",
    description: "Set of 4 handmade ceramic mugs with unique glazing patterns. Perfect for coffee lovers.",
    price: 45.00,
    imageUrl: "/images/products/ceramic-mugs.jpg",
    images: ["/images/products/ceramic-mugs.jpg"],
    category: "Home & Kitchen",
    seller: {
      id: "seller-2",
      name: "Clay & Fire Pottery",
      avatar: "/images/sellers/clayfire.jpg"
    },
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    stockCount: 15,
    tags: ["handmade", "ceramic", "gift-set"]
  },
  {
    id: "3",
    name: "Vintage Leather Messenger Bag",
    description: "Premium full-grain leather messenger bag with brass hardware. Ages beautifully with use.",
    price: 199.99,
    originalPrice: 249.99,
    imageUrl: "/images/products/leather-bag.jpg",
    images: ["/images/products/leather-bag.jpg", "/images/products/leather-bag-2.jpg"],
    category: "Bags & Luggage",
    seller: {
      id: "seller-3",
      name: "Heritage Leather Co.",
      avatar: "/images/sellers/heritage.jpg"
    },
    rating: 4.9,
    reviewCount: 203,
    inStock: true,
    stockCount: 8,
    tags: ["leather", "vintage", "professional"]
  },
  {
    id: "4",
    name: "Hand-knitted Wool Scarf",
    description: "Cozy merino wool scarf hand-knitted with traditional cable pattern. Available in multiple colors.",
    price: 67.50,
    imageUrl: "/images/products/wool-scarf.jpg",
    category: "Fashion",
    seller: {
      id: "seller-4",
      name: "Yarn & Needles",
      avatar: "/images/sellers/yarn.jpg"
    },
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    stockCount: 31,
    tags: ["handmade", "wool", "winter"]
  },
  {
    id: "5",
    name: "Custom Portrait Illustration",
    description: "Personalized digital portrait illustration from your photo. Perfect gift for loved ones.",
    price: 75.00,
    imageUrl: "/images/products/portrait.jpg",
    category: "Art & Collectibles",
    seller: {
      id: "seller-5",
      name: "Digital Art Studio",
      avatar: "/images/sellers/digitalart.jpg"
    },
    rating: 5.0,
    reviewCount: 94,
    inStock: true,
    tags: ["custom", "digital-art", "portrait"]
  },
  {
    id: "6",
    name: "Organic Honey Gift Set",
    description: "Collection of 3 organic honey varieties: wildflower, clover, and orange blossom.",
    price: 32.99,
    imageUrl: "/images/products/honey-set.jpg",
    category: "Food & Beverages",
    seller: {
      id: "seller-6",
      name: "Golden Hive Apiary",
      avatar: "/images/sellers/goldenhive.jpg"
    },
    rating: 4.8,
    reviewCount: 78,
    inStock: true,
    stockCount: 42,
    tags: ["organic", "honey", "natural"]
  },
  {
    id: "7",
    name: "Macrame Wall Hanging",
    description: "Beautiful bohemian macrame wall hanging made with natural cotton cord.",
    price: 54.00,
    imageUrl: "/images/products/macrame.jpg",
    category: "Home Decor",
    seller: {
      id: "seller-2",
      name: "Boho Craft Collective",
      avatar: "/images/sellers/boho.jpg"
    },
    rating: 4.5,
    reviewCount: 67,
    inStock: true,
    stockCount: 19,
    tags: ["macrame", "bohemian", "wall-art"]
  },
  {
    id: "8",
    name: "Artisan Soap Collection",
    description: "Set of 6 handmade soaps with natural ingredients: lavender, mint, oatmeal, and more.",
    price: 28.50,
    imageUrl: "/images/products/soap-collection.jpg",
    category: "Beauty & Personal Care",
    seller: {
      id: "seller-7",
      name: "Pure Essence Soaps",
      avatar: "/images/sellers/pureessence.jpg"
    },
    rating: 4.6,
    reviewCount: 112,
    inStock: true,
    stockCount: 35,
    tags: ["handmade", "natural", "skincare"]
  },
  {
    id: "9",
    name: "Wooden Cutting Board Set",
    description: "Set of 3 bamboo cutting boards in different sizes with juice grooves.",
    price: 59.99,
    originalPrice: 79.99,
    imageUrl: "/images/products/cutting-boards.jpg",
    category: "Home & Kitchen",
    seller: {
      id: "seller-1",
      name: "WoodCraft Studio",
      avatar: "/images/sellers/woodcraft.jpg"
    },
    rating: 4.7,
    reviewCount: 145,
    inStock: true,
    stockCount: 27,
    tags: ["bamboo", "kitchen", "eco-friendly"]
  },
  {
    id: "10",
    name: "Handwoven Cotton Throw",
    description: "Soft cotton throw blanket with traditional geometric pattern. Perfect for any season.",
    price: 89.00,
    imageUrl: "/images/products/cotton-throw.jpg",
    category: "Home Decor",
    seller: {
      id: "seller-8",
      name: "Textile Traditions",
      avatar: "/images/sellers/textile.jpg"
    },
    rating: 4.8,
    reviewCount: 91,
    inStock: true,
    stockCount: 14,
    tags: ["handwoven", "cotton", "blanket"]
  },
  {
    id: "11",
    name: "Silver Wire Jewelry Set",
    description: "Delicate silver wire earrings and necklace set with semi-precious stones.",
    price: 125.00,
    imageUrl: "/images/products/silver-jewelry.jpg",
    category: "Jewelry",
    seller: {
      id: "seller-9",
      name: "Wire & Stone Jewelry",
      avatar: "/images/sellers/wireandstone.jpg"
    },
    rating: 4.9,
    reviewCount: 73,
    inStock: true,
    stockCount: 12,
    tags: ["silver", "handmade", "jewelry"]
  },
  {
    id: "12",
    name: "Succulent Garden Kit",
    description: "Complete kit with 5 small succulents, decorative pot, and care instructions.",
    price: 34.99,
    imageUrl: "/images/products/succulent-kit.jpg",
    category: "Plants & Garden",
    seller: {
      id: "seller-10",
      name: "Green Thumb Gardens",
      avatar: "/images/sellers/greenthumb.jpg"
    },
    rating: 4.4,
    reviewCount: 186,
    inStock: true,
    stockCount: 48,
    tags: ["plants", "succulents", "indoor-garden"]
  },
  {
    id: "13",
    name: "Handmade Scented Candles",
    description: "Set of 3 soy wax candles with essential oils: vanilla, eucalyptus, and sandalwood.",
    price: 42.00,
    imageUrl: "/images/products/scented-candles.jpg",
    category: "Home Decor",
    seller: {
      id: "seller-11",
      name: "Candlelight Creations",
      avatar: "/images/sellers/candlelight.jpg"
    },
    rating: 4.6,
    reviewCount: 134,
    inStock: true,
    stockCount: 22,
    tags: ["candles", "soy-wax", "aromatherapy"]
  },
  {
    id: "14",
    name: "Personalized Photo Album",
    description: "Custom leather-bound photo album with engraved names and dates. Holds 200 photos.",
    price: 95.00,
    imageUrl: "/images/products/photo-album.jpg",
    category: "Gifts & Occasions",
    seller: {
      id: "seller-3",
      name: "Heritage Leather Co.",
      avatar: "/images/sellers/heritage.jpg"
    },
    rating: 4.9,
    reviewCount: 87,
    inStock: true,
    stockCount: 16,
    tags: ["personalized", "leather", "photo-album"]
  },
  {
    id: "15",
    name: "Artisan Coffee Blend",
    description: "Small-batch roasted coffee blend with notes of chocolate and caramel. 12oz bag.",
    price: 18.99,
    imageUrl: "/images/products/coffee-blend.jpg",
    category: "Food & Beverages",
    seller: {
      id: "seller-12",
      name: "Mountain Peak Roasters",
      avatar: "/images/sellers/mountainpeak.jpg"
    },
    rating: 4.7,
    reviewCount: 241,
    inStock: true,
    stockCount: 67,
    tags: ["coffee", "small-batch", "artisan"]
  }
];
