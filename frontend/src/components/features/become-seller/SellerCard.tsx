"use client";

import { Seller } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface SellerCardProps {
  seller: Seller;
  onViewProfile?: (sellerId: string) => void;
}

export default function SellerCard({ seller, onViewProfile }: SellerCardProps) {
  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="text-center pb-2">
        <div className="relative w-20 h-20 mx-auto mb-3">
          <Image
            src={seller.avatar}
            alt={seller.name}
            width={80}
            height={80}
            className="w-full h-full object-cover rounded-full border-2 border-muted transition-transform duration-200 group-hover:scale-105"
          />
        </div>
        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
          {seller.name}
        </h3>
        {seller.location && (
          <p className="text-sm text-muted-foreground">
            {seller.location}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3 text-center">
          {seller.description}
        </p>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm font-medium">{seller.rating}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {seller.productCount} products
          </div>
        </div>
        
        <div className="flex justify-center">
          <Badge variant="outline" className="text-xs">
            Verified Seller
          </Badge>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onViewProfile?.(seller.id)}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
}
