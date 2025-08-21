"use client";

import { ProductDto } from "@/lib/api/products";
import { formatPrice, formatDate } from "@/lib/mock-data/products";
import Image from "next/image";
import { MoreHorizontal, Edit, Trash2, Copy, Eye, EyeOff, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {formatCurrency} from "@/lib/utils/currency";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/stores/profile";

interface ProductCardProps {
  product: ProductDto;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onToggleStatus: (productId: string) => void;
}

// Helper function to get product status from ProductDto
const getProductStatus = (product: ProductDto): string => {
  if (!product.IsActive) return "inactive";
  if ((product.Stock || 0) === 0) return "out of stock";
  if ((product.Stock || 0) < 10) return "low stock";
  return "active";
};

// Helper function to get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "out of stock":
      return "bg-red-100 text-red-800 border-red-200";
    case "low stock":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Helper function to get category display name
const getCategoryName = (category: string): string => {
  switch (category) {
    case "Electronics":
      return "Electronics";
    case "Clothing":
      return "Clothing";
    case "Books":
      return "Books";
    case "Home":
      return "Home & Garden";
    case "Sports":
      return "Sports & Outdoors";
    case "Other":
      return "Other";
    default:
      return category || "Unknown";
  }
};

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductCardProps) {
  const status = getProductStatus(product);
  const statusColor = getStatusColor(status);
  const user = useAtomValue(userProfileAtom);

  const getStockRibbon = () => {
    const stock = product.Stock || 0;
    if (stock === 0) {
      return { text: "Out of Stock", color: "bg-red-500 text-white" };
    }
    if (stock < 10) {
      return { text: "Low Stock", color: "bg-yellow-500 text-white" };
    }
    return null;
  };

  const stockRibbon = getStockRibbon();

  return (
    <div
      className="bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onEdit(product.Id || '')}
    >
      {/* Header with Image and Actions */}
      <div className="flex items-start gap-3 mb-3">
        {/* Product Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
          {product.MainImage ? (
            <Image
              src={product.MainImage}
              alt={product.Name || 'Product'}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
              No Image
            </div>
          )}
          
          {/* Stock Ribbon */}
          {stockRibbon && (
            <div className={`absolute top-0 left-0 right-0 text-xs py-0.5 px-1 text-center ${stockRibbon.color}`}>
              {stockRibbon.text}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm truncate">
                {product.Name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {product.Description}
              </p>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open actions menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(product.Id || '');
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(product.Id || '');
                  }}
                >
                  {product.IsActive ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Make Inactive
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Make Active
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(product.Id || '');
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Category and Status Row */}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {getCategoryName(product.Category || '')}
            </Badge>
            <Badge variant="secondary" className={`text-xs ${statusColor}`}>
              {status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Product Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* Price */}
        <div>
          <span className="text-muted-foreground">Price</span>
          <div className="font-semibold">
            {formatCurrency(product.Price || 0, user?.data?.PreferredCurrency || 'THB')}
          </div>
        </div>

        {/* Stock */}
        <div>
          <span className="text-muted-foreground">Stock</span>
          <div className="font-semibold flex items-center gap-1">
            <span>{product.Stock || 0}</span>
            <span className="text-xs text-muted-foreground">units</span>
          </div>
        </div>

        {/* Sales & Updated Row */}
        <div className="col-span-2 flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" />
            {(product.SalesCount || 0).toLocaleString()} sold
          </span>
          <span>Updated {product.UpdatedAt ? formatDate(product.UpdatedAt) : 'Unknown'}</span>
        </div>
      </div>
    </div>
  );
}

