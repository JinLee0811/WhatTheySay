import React from "react";
import { StarIcon, MapPinIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { SearchFilters } from "../../types/restaurant";

interface SearchFiltersProps {
  filters: SearchFilters;
  onFilterChange: (newFilters: SearchFilters) => void;
}

const ratingOptions = [4.5, 4.0, 3.5, 3.0];
const distanceOptions = [1, 3, 5, 10, 20]; // in km
const priceOptions = [
  { value: "all", label: "Any Price" },
  { value: "1", label: "$" },
  { value: "2", label: "$$" },
  { value: "3", label: "$$$" },
  { value: "4", label: "$$$$" },
];

export default function SearchFiltersComponent({ filters, onFilterChange }: SearchFiltersProps) {
  const handleFilterChange = (key: keyof SearchFilters, value: number | string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className='flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg'>
      {/* Rating Filter */}
      <div className='flex items-center gap-2'>
        <StarIcon className='w-5 h-5 text-gray-500' />
        <label htmlFor='rating-filter' className='text-sm font-medium text-gray-700'>
          Min Rating:
        </label>
        <select
          id='rating-filter'
          value={filters.rating}
          onChange={(e) => handleFilterChange("rating", parseFloat(e.target.value))}
          className='p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'>
          {ratingOptions.map((r) => (
            <option key={r} value={r}>
              {r.toFixed(1)}+
            </option>
          ))}
        </select>
      </div>

      {/* Distance Filter */}
      <div className='flex items-center gap-2'>
        <MapPinIcon className='w-5 h-5 text-gray-500' />
        <label htmlFor='distance-filter' className='text-sm font-medium text-gray-700'>
          Max Distance:
        </label>
        <select
          id='distance-filter'
          value={filters.distance}
          onChange={(e) => handleFilterChange("distance", parseInt(e.target.value))}
          className='p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'>
          {distanceOptions.map((d) => (
            <option key={d} value={d}>
              {d} km
            </option>
          ))}
        </select>
      </div>

      {/* Price Level Filter */}
      <div className='flex items-center gap-2'>
        <CurrencyDollarIcon className='w-5 h-5 text-gray-500' />
        <label htmlFor='price-filter' className='text-sm font-medium text-gray-700'>
          Price:
        </label>
        <select
          id='price-filter'
          value={filters.priceLevel}
          onChange={(e) => handleFilterChange("priceLevel", e.target.value)}
          className='p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'>
          {priceOptions.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
