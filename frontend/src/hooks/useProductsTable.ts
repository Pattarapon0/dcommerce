import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  ColumnFiltersState,
  SortingState,
  PaginationState,
} from '@tanstack/react-table'
import { productColumns } from '@/lib/table/productColumns'
import { useSellerProducts, type ServerSideTableParams } from './useSellerProducts'

// Custom debounce hook - the "boring" but correct React way
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useProductsTable() {
  // Server-side state managed by TanStack Table
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // 0-based for TanStack Table
    pageSize: 10, // same as backend
  })
  
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'CreatedAt', desc: true } // Default sort by newest first
  ])
  
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  
  // Debounce search with 500ms delay - prevents excessive API calls
  const debouncedSearchTerm = useDebounce(globalFilter, 500)

  // Convert TanStack Table state to API parameters
  const serverParams: ServerSideTableParams = useMemo(() => ({
    page: pagination.pageIndex + 1, // Convert to 1-based for API
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id || 'CreatedAt',
    ascending: sorting[0] ? !sorting[0].desc : false,
    searchTerm: debouncedSearchTerm || undefined,
    category: columnFilters.find(f => f.id === 'Category')?.value as string,
    // Add more filters as needed
  }), [pagination, sorting, columnFilters, debouncedSearchTerm])

  // Fetch data from server with all parameters
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
    isPreviousData
  } = useSellerProducts(serverParams)

  const products = apiResponse?.Items || []
  const totalCount = apiResponse?.TotalCount || 0
  const totalPages = Math.ceil(totalCount / pagination.pageSize)

  // Create TanStack Table instance with server-side configuration
  const table = useReactTable({
    data: products,
    columns: productColumns,
    getCoreRowModel: getCoreRowModel(),
    
    // All operations are server-side
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    
    // Row count for pagination
    rowCount: totalCount,
    pageCount: totalPages,
    
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
    },
    
    // State change handlers
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
  })

  // Helper functions for UI components
  const getSortDirection = useCallback((columnId: string) => {
    const sort = sorting.find(s => s.id === columnId)
    if (!sort) return null
    return sort.desc ? 'desc' : 'asc'
  }, [sorting])

  const toggleSort = useCallback((columnId: string) => {
    const currentSort = sorting.find(s => s.id === columnId)
    if (!currentSort) {
      setSorting([{ id: columnId, desc: false }])
    } else if (!currentSort.desc) {
      setSorting([{ id: columnId, desc: true }])
    } else {
      setSorting([])
    }
  }, [sorting])

  const setFilter = useCallback((columnId: string, value: any) => {
    setColumnFilters(prev => {
      const otherFilters = prev.filter(f => f.id !== columnId)
      if (value === undefined || value === null || value === '') {
        return otherFilters
      }
      return [...otherFilters, { id: columnId, value }]
    })
  }, [])

  const getFilter = useCallback((columnId: string) => {
    return columnFilters.find(f => f.id === columnId)?.value
  }, [columnFilters])

  const clearFilters = useCallback(() => {
    setColumnFilters([])
    setGlobalFilter('')
  }, [])

  // Table state object for UI components
  const tableState = useMemo(() => ({
    // Data
    currentPageData: products,
    
    // Sorting
    getSortDirection,
    toggleSort,
    
    // Filtering  
    setFilter,
    getFilter,
    setGlobalFilter,
    globalFilter,
    clearFilters,
    
    // Pagination info
    pagination: {
      currentPage: pagination.pageIndex + 1, // Convert to 1-based for UI
      totalPages,
      pageSize: pagination.pageSize,
      totalItems: totalCount,
      hasNextPage: table.getCanNextPage(),
      hasPreviousPage: table.getCanPreviousPage(),
    },
  }), [
    products,
    getSortDirection,
    toggleSort,
    setFilter,
    getFilter,
    setGlobalFilter,
    globalFilter,
    clearFilters,
    pagination,
    totalPages,
    totalCount,
    table
  ])

  return {
    tableState,
    
    // TanStack Table's pagination functions
    goToPage: table.setPageIndex,
    setPageSize: table.setPageSize,
    
    // Loading states
    isLoading,
    isError,
    error,
    isPreviousData, // Shows if we're showing old data while fetching new
    isSearching: globalFilter !== debouncedSearchTerm, // Shows if search is being debounced
    
    // API data
    totalCount,
    totalPages,
    
    // Simple flags for UI
    isReady: !isLoading && !isError,
    hasData: products.length > 0,
  }
}