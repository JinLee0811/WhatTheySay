import React from "react";

interface FilterBarProps {
  filters: {
    rating: number;
    distance: number;
    priceLevel: string;
  };
  onFilterChange: (filters: { rating: number; distance: number; priceLevel: string }) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className='bg-white p-4 rounded-lg shadow mb-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Minimum Rating</label>
          <select
            value={filters.rating}
            onChange={(e) => onFilterChange({ ...filters, rating: Number(e.target.value) })}
            className='w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'>
            <option value={0}>Any Rating</option>
            <option value={3}>3+ Stars</option>
            <option value={4}>4+ Stars</option>
            <option value={4.5}>4.5+ Stars</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Distance (km)</label>
          <select
            value={filters.distance}
            onChange={(e) => onFilterChange({ ...filters, distance: Number(e.target.value) })}
            className='w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'>
            <option value={1}>1 km</option>
            <option value={2}>2 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Price Level</label>
          <select
            value={filters.priceLevel}
            onChange={(e) => onFilterChange({ ...filters, priceLevel: e.target.value })}
            className='w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'>
            <option value='all'>All Prices</option>
            <option value='1'>$</option>
            <option value='2'>$$</option>
            <option value='3'>$$$</option>
            <option value='4'>$$$$</option>
          </select>
        </div>
      </div>
    </div>
  );
}
