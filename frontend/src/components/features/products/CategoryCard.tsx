"use client";

import { Category } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface CategoryCardProps {
  category: Category;
  onSelect?: (categoryId: string) => void;
}

export default function CategoryCard({ category, onSelect }: CategoryCardProps) {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
      onClick={() => onSelect?.(category.id)}
    >
      <div className="relative">
        <Image
          src={category.imageUrl}
          alt={category.name}
          width={300}
          height={200}
          className="w-full h-40 object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-foreground transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-gray-200 line-clamp-2">
            {category.description}
          </p>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            {category.productCount} products
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
