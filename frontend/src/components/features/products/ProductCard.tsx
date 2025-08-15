"use client";

import { Product } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (productId: string) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-t-lg">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {hasDiscount && (
          <Badge 
            variant="destructive" 
            className="absolute top-2 left-2 bg-red-500 hover:bg-red-600"
          >
            -{discountPercentage}%
          </Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="bg-gray-800 text-white">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              by {product.seller.name}
            </div>
            {product.rating && (
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium">{product.rating}</span>
                {product.reviewCount && (
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice!.toFixed(2)}
              </span>
            )}
          </div>
          
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={() => onViewDetails?.(product.id)}
          disabled={!product.inStock}
        >
          {product.inStock ? 'View Details' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
