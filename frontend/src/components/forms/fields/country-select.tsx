"use client";

import * as React from "react";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import countries from "world-countries";

import { cn } from "@/lib/utils/util";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Transform countries data for easier use
const countryList = countries
  .map((country) => ({
    value: country.name.common,
    label: country.name.common,
    flag: country.flag,
    code: country.cca2,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

interface CountrySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean; // Add explicit error prop
}

export function CountrySelect({
  value,
  onValueChange,
  placeholder = "Select country...",
  className,
  disabled = false,
  error = false,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);

  const selectedCountry = countryList.find((country) => country.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10 px-3 py-2 text-sm",
            "border border-input bg-background",
            "hover:bg-accent hover:text-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          disabled={disabled}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2 text-left">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="truncate">{selectedCountry.label}</span>
            </span>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search countries..." className="h-9" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {countryList.map((country) => (
                <CommandItem
                  key={country.value}
                  value={country.value}
                  onSelect={() => {
                    onValueChange?.(country.value);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5"
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === country.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-lg">{country.flag}</span>
                  <span className="truncate">{country.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}