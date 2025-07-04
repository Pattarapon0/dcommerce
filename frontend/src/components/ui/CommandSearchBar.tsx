"use client"

import * as React from "react"
import { Package, Tag, Store } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { mockProducts } from "@/lib/data/mockProducts"
import { mockCategories } from "@/lib/data/mockCategories"
import { mockSellers } from "@/lib/data/mockSellers"

export function CommandSearchBar() {
  const [search, setSearch] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)

  // Filter data based on search
  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description.toLowerCase().includes(search.toLowerCase()) ||
    (product.tags && product.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
  ).slice(0, 5) // Limit to 5 results

  const filteredCategories = mockCategories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    category.description.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 3) // Limit to 3 results

  const filteredSellers = mockSellers.filter((seller) =>
    seller.name.toLowerCase().includes(search.toLowerCase()) ||
    seller.description?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 3) // Limit to 3 results

  const hasResults = filteredProducts.length > 0 || filteredCategories.length > 0 || filteredSellers.length > 0
  const showResults = isFocused && (search.length > 0 || hasResults)

  return (
    <div className="w-full max-w-sm ">
      <Command className="rounded-lg border shadow-sm bg-background w-full max-w-sm ">
        <CommandInput
          placeholder="Search products, categories, sellers..."
          value={search}
          onValueChange={setSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="h-10"
        />

        {showResults && (
          <CommandList className="max-h-80 border-t">
            <CommandEmpty>
              {search ? "No results found." : "Start typing to search..."}
            </CommandEmpty>

            {/* Products */}
            {filteredProducts.length > 0 && (
              <CommandGroup heading="Products">
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={() => {
                      console.log("Selected product:", product.name)
                      setSearch(product.name)
                      setIsFocused(false)
                    }}
                    className="flex items-center gap-3"
                  >
                    <Package className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ${product.price} • {product.category}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Categories */}
            {filteredCategories.length > 0 && (
              <CommandGroup heading="Categories">
                {filteredCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      console.log("Selected category:", category.name)
                      setSearch(category.name)
                      setIsFocused(false)
                    }}
                    className="flex items-center gap-3"
                  >
                    <Tag className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {category.productCount} products
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Sellers */}
            {filteredSellers.length > 0 && (
              <CommandGroup heading="Sellers">
                {filteredSellers.map((seller) => (
                  <CommandItem
                    key={seller.id}
                    value={seller.name}
                    onSelect={() => {
                      console.log("Selected seller:", seller.name)
                      setSearch(seller.name)
                      setIsFocused(false)
                    }}
                    className="flex items-center gap-3"
                  >
                    <Store className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{seller.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {seller.location} • {seller.rating}⭐
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  )
}
