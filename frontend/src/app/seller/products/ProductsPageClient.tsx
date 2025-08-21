"use client";

import ProductsTable from "@/components/features/products/ProductsTable";
import ProductCard from "@/components/features/products/ProductCard";
import ProductsFilters from "@/components/features/products/ProductsFilters";
import { useProductsTable } from "@/hooks/useProductsTable";
import { ProductDto } from "@/lib/api/products";

export default function ProductsPageClient() {
  const {
    tableState,
    goToPage,
    setPageSize,
    isLoading,
    isError,
    error,
    totalCount,
    totalPages,
    isReady,
    hasData,
    isSearching, // New: indicates if search is being debounced
  } = useProductsTable();

  // Get current filters for empty state logic
  const hasActiveFilters = tableState.globalFilter || 
    (tableState.getFilter("Category") && tableState.getFilter("Category") !== "all") ||
    (tableState.getFilter("IsActive") !== undefined);

  // Mock action handlers (will be replaced with real API calls)
  const handleEditProduct = (productId: string) => {
    console.log("Edit product:", productId);
  };

  const handleDeleteProduct = (productId: string) => {
    console.log("Delete product:", productId);
  };

  const handleToggleStatus = (productId: string) => {
    console.log("Toggle status for product:", productId);
  };

  const handleDuplicateProduct = (productId: string) => {
    console.log("Duplicate product:", productId);
  };

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
        <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">My Products</h1>
            <p className="text-muted-foreground">
              Manage your product catalog and inventory
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2 text-red-900">Failed to load products</h3>
            <p className="text-red-700 mb-4">
              {error?.message || "Unable to load your product data. Please check your connection and try again."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">My Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>

        {/* Filters */}
        <ProductsFilters
          onFiltersChange={(filters) => {
            // Server-side global search
            if (filters.search !== undefined) {
              tableState.setGlobalFilter(filters.search);
            }
            
            // Server-side category filter
            if (filters.category && filters.category !== "all") {
              tableState.setFilter("Category", filters.category);
            } else {
              tableState.setFilter("Category", undefined);
            }
            
            // Server-side status filter (convert to boolean for IsActive field)
            if (filters.status && filters.status !== "all") {
              tableState.setFilter("IsActive", filters.status === "active");
            } else {
              tableState.setFilter("IsActive", undefined);
            }
          }}
          totalProducts={tableState.pagination.totalItems} // Now shows total across all pages
          isLoading={isLoading} // Only show loading for actual API calls
          canUseFilters={true} // Always enabled for server-side filtering
          loadingMessage={isSearching ? "Searching..." : undefined}
        />

        {/* Products Content */}
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <ProductsTable
              products={tableState.currentPageData as ProductDto[]}
              isLoading={isLoading}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onToggleStatus={handleToggleStatus}
              currentPage={tableState.pagination.currentPage}
              totalPages={tableState.pagination.totalPages}
              itemsPerPage={tableState.pagination.pageSize}
              totalItems={tableState.pagination.totalItems}
              onPageChange={(page) => goToPage(page - 1)} // Convert to 0-based for TanStack Table
              onItemsPerPageChange={setPageSize}
              // Sorting props - always enabled for server-side sorting
              onSort={tableState.toggleSort}
              getSortDirection={tableState.getSortDirection}
              canSort={true}
            />
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {isLoading ? (
              // Loading skeleton for mobile
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg border animate-pulse"
                  />
                ))}
              </div>
            ) : !hasData ? (
              // Empty state
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results."
                    : "Start by adding your first product to your catalog."}
                </p>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Add Product
                </button>
              </div>
            ) : (
              // Product cards
              <div className="space-y-3">
                {tableState.currentPageData.map((product: ProductDto) => (
                  <ProductCard
                    key={product.Id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            )}

            {/* Mobile Pagination */}
            {isReady && hasData && (
              <div className="flex flex-col items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(Math.max(0, tableState.pagination.currentPage - 2))} // Previous page: (currentPage-1) - 1 in 0-based
                    disabled={!tableState.pagination.hasPreviousPage}
                    className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {tableState.pagination.currentPage} of {tableState.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(tableState.pagination.currentPage)} // Next page: (currentPage-1) + 1 in 0-based = currentPage
                    disabled={!tableState.pagination.hasNextPage}
                    className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                  >
                    Next
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Showing {tableState.currentPageData.length} of {tableState.pagination.pageSize} per page
                  <br />
                  Page {tableState.pagination.currentPage} of {tableState.pagination.totalPages} ({tableState.pagination.totalItems} total products)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}