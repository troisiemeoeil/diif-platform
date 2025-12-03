"use client";
import React, { useCallback, useState, forwardRef, useEffect, useMemo } from "react";

// shadcn
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

// utils
import { cn } from "@/lib/utils";

// assets
import { ChevronDown, CheckIcon, Globe } from "lucide-react";
import { CircleFlag } from "react-circle-flags";

// data
import { countries } from "country-data-list";

const normalizeCountries = (countryList) =>
  countryList.filter(
    (country) =>
      country &&
      country.name &&
      country.alpha2 &&
      country.emoji &&
      country.status !== "deleted" &&
      country.ioc !== "PRK"
  );

const DEFAULT_COUNTRY_OPTIONS = normalizeCountries(countries.all);

const CountryDropdownComponent = (
  {
    options = DEFAULT_COUNTRY_OPTIONS,
    onChange,
    defaultValue,
    disabled = false,
    placeholder = "Select a country",
    slim = false,
    ...props
  },
  ref
) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(undefined);

  const availableOptions = useMemo(
    () => normalizeCountries(options),
    [options]
  );

  useEffect(() => {
    if (defaultValue) {
      const initialCountry = availableOptions.find(
        (country) => country.alpha3 === defaultValue
      );
      if (initialCountry) {
        setSelectedCountry(initialCountry);
      } else {
        // Reset selected country if defaultValue is not found
        setSelectedCountry(undefined);
      }
    } else {
      // Reset selected country if defaultValue is undefined or null
      setSelectedCountry(undefined);
    }
  }, [defaultValue, availableOptions]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return availableOptions;
    }
    return availableOptions.filter(
      (option) => option.name && option.name.toLowerCase().includes(query)
    );
  }, [availableOptions, searchTerm]);

  const handleSelect = useCallback(
    (country) => {
      console.log("🌍 CountryDropdown value: ", country);
      setSelectedCountry(country);
      onChange?.(country);
      setOpen(false);
    },
    [onChange]
  );

  const triggerClasses = cn(
    "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
    slim === true && "w-20"
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        ref={ref}
        disabled={disabled}
      >
        <button
          type="button"
          className={triggerClasses}
          {...props}
        >
          {selectedCountry ? (
            <div className="flex items-center flex-grow w-0 gap-2 overflow-hidden">
              <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                <CircleFlag
                  countryCode={selectedCountry.alpha2.toLowerCase()}
                  height={20}
                />
              </div>
              {slim === false && (
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {selectedCountry.name}
                </span>
              )}
            </div>
          ) : (
            <span>
              {slim === false ? (
                placeholder || setSelectedCountry.name
              ) : (
                <Globe size={20} />
              )}
            </span>
          )}
          <ChevronDown size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        collisionPadding={10}
        side="bottom"
        className="min-w-[--radix-popper-anchor-width] p-0"
        align="center"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Command className="w-full max-h-[260px]" shouldFilter={false}>
          <div className="sticky top-0 z-10 bg-popover">
            <CommandInput
              placeholder="Search country..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
          </div>
          <CommandList className="max-h-[inherit] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <CommandEmpty>No country found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    className="flex items-center w-full gap-2"
                    key={option.alpha3 ?? option.alpha2 ?? option.name}
                    value={option.alpha3 ?? option.alpha2 ?? option.name}
                    onSelect={() => handleSelect(option)}
                  >
                    <div className="flex flex-grow w-0 space-x-2 overflow-hidden">
                      <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                        <CircleFlag
                          countryCode={option.alpha2.toLowerCase()}
                          height={20}
                        />
                      </div>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {option.name}
                      </span>
                    </div>
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        option.alpha3 === selectedCountry?.alpha3
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

CountryDropdownComponent.displayName = "CountryDropdownComponent";

export const CountryDropdown = forwardRef(CountryDropdownComponent);