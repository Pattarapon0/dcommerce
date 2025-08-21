import { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { ProductDto } from '@/lib/api/products'

// Custom filter function for date ranges
/*const dateRangeFilter: FilterFn<ProductDto> = (row, columnId, value) => {
  const date = new Date(row.getValue(columnId) as string)
  const [start, end] = value || []
  
  if (!start && !end) return true
  if (start && !end) return date >= new Date(start)
  if (!start && end) return date <= new Date(end)
  return date >= new Date(start) && date <= new Date(end) 
}*/

// Custom filter function for boolean status
const statusFilter: FilterFn<ProductDto> = (row, columnId, value) => {
  if (value === undefined || value === null || value === '') return true
  const cellValue = row.getValue(columnId) as boolean
  return cellValue === value
}

// Column definitions for TanStack Table data management
// Uses PascalCase accessorKey to match API schema
export const productColumns: ColumnDef<ProductDto>[] = [
  {
    accessorKey: 'MainImage',
    header: 'Image',
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'Name',
    header: 'Product Name',
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: true,
    sortingFn: 'text',
    filterFn: 'includesString',
  },
  {
    accessorKey: 'Description',
    header: 'Description',
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: true,
    sortingFn: 'text',
    filterFn: 'includesString',
  },
  {
    accessorKey: 'Price',
    header: 'Price',
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: false,
    sortingFn: 'alphanumeric',
    filterFn: 'inNumberRange',
  },
  {
    accessorKey: 'BaseCurrency',
    header: 'Currency',
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: false,
    sortingFn: 'text',
    filterFn: 'equals',
  },
  {
    accessorKey: 'Category',
    header: 'Category',
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: true,
    sortingFn: 'text',
    filterFn: 'equals',
  },
  {
    accessorKey: 'Stock',
    header: 'Stock',
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: false,
    sortingFn: 'alphanumeric',
    filterFn: 'inNumberRange',
  },
  {
    accessorKey: 'IsActive',
    header: 'Status',
    enableSorting: false,
    enableColumnFilter: true,
    enableGlobalFilter: false,
    sortingFn: 'basic',
    filterFn: statusFilter,
  },
  {
    accessorKey: 'SalesCount',
    header: 'Sales',
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: false,
    sortingFn: 'alphanumeric',
    filterFn: 'inNumberRange',
  },
  {
    accessorKey: 'UpdatedAt',
    header: 'Updated',
    enableSorting: true,
    enableColumnFilter: false, // Disable until we build custom date filter UI
    enableGlobalFilter: false,
    sortingFn: 'datetime',
  },
  {
    accessorKey: 'CreatedAt',
    header: 'Created',
    enableSorting: true,
    enableColumnFilter: false, // Disable until we build custom date filter UI
    enableGlobalFilter: false,
    sortingFn: 'datetime',
  },
]