"use client"

import * as React from "react"
import {  Search } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command"

export function CommandSearchBar() {
  const [search, setSearch] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)

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

        {isFocused && search && (
          <CommandList className="max-h-80 border-t">
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-4">
                <Search className="h-8 w-8 text-muted-foreground" />
                <span>Search functionality coming soon</span>
              </div>
            </CommandEmpty>
          </CommandList>
        )}
      </Command>
    </div>
  )
}
