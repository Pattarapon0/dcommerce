"use client";

import { ProductDto } from "@/lib/api/products";
import { formatDate } from "@/lib/utils/date";
import Image from "next/image";
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
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
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useState } from "react";

interface ProductsTableProps {
  products: ProductDto[];
  isLoading: boolean;
  onEdit: (productId: string) => void;
  onEditWithData: (product: ProductDto) => void;
  onDelete: (productId: string) => void;
  onToggleStatus: (productId: string) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  filteredItems?: number; // Show filtered count for info
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  // New sorting props
  onSort?: (columnId: string) => void;
  getSortDirection?: (columnId: string) => 'asc' | 'desc' | null;
  canSort?: boolean;
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

// Sortable header component
const SortableHeader = ({ 
  children, 
  columnId, 
  onSort, 
  getSortDirection, 
  canSort 
}: { 
  children: React.ReactNode; 
  columnId: string; 
  onSort?: (columnId: string) => void;
  getSortDirection?: (columnId: string) => 'asc' | 'desc' | null;
  canSort?: boolean;
}) => {
  const sortDirection = getSortDirection?.(columnId);
  const isClickable = canSort && onSort;
  if (!isClickable) {
    return (
      <th className="text-left p-4 font-medium text-sm text-gray-500">
        {children}
      </th>
    );
  }

  return (
    <th className="text-left p-4 font-medium text-sm">
      <button
        onClick={() => onSort(columnId)}
        className="flex items-center gap-1 hover:text-blue-600 transition-colors group"
        disabled={!canSort}
      >
        {children}
        <span className="text-gray-400 group-hover:text-blue-600">
          {sortDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : sortDirection === 'desc' ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3" />
          )}
        </span>
      </button>
    </th>
  );
};

export default function ProductsTable({
  products,
  isLoading,
  onEdit,
  onEditWithData,
  onDelete,
  onToggleStatus,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  filteredItems,
  onPageChange,
  onItemsPerPageChange,
  onSort,
  getSortDirection,
  canSort = true,
}: ProductsTableProps) {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const closeDropdown = (productId: string) => {
    setOpenDropdowns(prev => ({ ...prev, [productId]: false }));
  };
  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white">
        <div className="p-4 border-b">
          <div className="h-4 bg-muted rounded animate-pulse w-32" />
        </div>
        <div className="divide-y">
          {[...Array(itemsPerPage)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-48" />
                <div className="h-3 bg-muted rounded animate-pulse w-32" />
              </div>
              <div className="flex gap-4">
                <div className="h-4 bg-muted rounded animate-pulse w-16" />
                <div className="h-4 bg-muted rounded animate-pulse w-16" />
                <div className="h-4 bg-muted rounded animate-pulse w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border rounded-lg bg-white p-12 text-center">
        <div className="text-4xl mb-4">📦</div>
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your filters to see more results.
        </p>
        <Button asChild>
          <Link href="/seller/products/add">Add Product</Link>
        </Button>
      </div>
    );
  }

  const getStockWidthClass = (stock: number) => {
    if (stock === 0) return "w-0";
    if (stock < 10) return "w-25";
    if (stock < 50) return "w-60";
    return "w-full";
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return "bg-red-500";
    if (stock < 10) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              <tr>
                <SortableHeader columnId="Name" onSort={onSort} getSortDirection={getSortDirection} canSort={canSort}>
                  Product
                </SortableHeader>
                <th className="text-left p-4 font-medium text-sm text-gray-500">
                  Status
                </th>
                <SortableHeader columnId="Stock" onSort={onSort} getSortDirection={getSortDirection} canSort={canSort}>
                  Stock
                </SortableHeader>
                <SortableHeader columnId="Price" onSort={onSort} getSortDirection={getSortDirection} canSort={canSort}>
                  Price
                </SortableHeader>
                <SortableHeader columnId="SalesCount" onSort={onSort} getSortDirection={getSortDirection} canSort={canSort}>
                  Sales
                </SortableHeader>
                <SortableHeader columnId="UpdatedAt" onSort={onSort} getSortDirection={getSortDirection} canSort={canSort}>
                  Updated
                </SortableHeader>
                <th className="text-right p-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => {
                const status = getProductStatus(product);
                const statusColor = getStatusColor(status);
                const stockProgress = getStockWidthClass(product.Stock || 0);
                const stockColor = getStockColor(product.Stock || 0);

                return (
                  <tr
                    key={product.Id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    {/* Product Column */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-muted">
                          {product.MainImage ? (
                            <Image
                              src={product.MainImage}
                              alt={product.Name || 'Product'}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">
                            {product.Name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {product.Description}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="p-4">
                      <Badge
                        variant="secondary"
                        className={`${statusColor} text-xs`}
                      >
                        {status}
                      </Badge>
                    </td>

                    {/* Stock Column */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{product.Stock || 0}</span>
                          <span className="text-xs text-muted-foreground">units</span>
                        </div>
                        <div className="w-16">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${stockColor} transition-all duration-300 ${stockProgress}`}
                            />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price Column */}
                    <td className="p-4">
                      <div className="text-sm font-medium">
                        {formatCurrency(product.Price || 0, 'THB')}
                      </div>
                    </td>

                    {/* Sales Column */}
                    <td className="p-4">
                      <div className="text-sm font-medium">
                        {(product.SalesCount || 0).toLocaleString()}
                      </div>
                    </td>

                    {/* Updated Column */}
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">
                        {product.UpdatedAt ? formatDate(product.UpdatedAt) : 'Unknown'}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="p-4">
                      <div className="flex justify-end">
                        <DropdownMenu 
                          open={openDropdowns[product.Id || ''] || false}
                          onOpenChange={(open) => setOpenDropdowns(prev => ({ ...prev, [product.Id || '']: open }))}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open actions menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onSelect={() => {
                                onEditWithData(product);
                                onEdit(product.Id || '');
                                closeDropdown(product.Id || '');
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Product
                            </DropdownMenuItem>
                            
                            <ConfirmationDialog
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
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
                              }
                              title={product.IsActive ? "Hide product" : "Show product"}
                              description={
                                product.IsActive 
                                  ? `Hide "${product.Name}" from customers? You can make it active again later.`
                                  : `Show "${product.Name}" to customers?`
                              }
                              confirmText={product.IsActive ? "Hide" : "Show"}
                              onConfirm={() => {
                                onToggleStatus(product.Id || '');
                                closeDropdown(product.Id || '');
                              }}
                            />

                            <DropdownMenuSeparator />
                            
                            <ConfirmationDialog
                              trigger={
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              }
                              title={`Delete "${product.Name}"`}
                              description="This action cannot be undone. All product data will be permanently deleted."
                              confirmText="Delete"
                              confirmVariant="destructive"
                              onConfirm={() => {
                                onDelete(product.Id || '');
                                closeDropdown(product.Id || '');
                              }}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show</span>
          <select
            aria-label="Items per page"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>
            of {totalItems} products
            {filteredItems !== undefined && filteredItems < totalItems && (
              <span className="text-blue-600"> ({filteredItems} filtered)</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}