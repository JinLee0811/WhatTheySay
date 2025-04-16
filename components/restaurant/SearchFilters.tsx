import { FilterOptions } from "@/types/restaurant";

interface SearchFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filterName: keyof FilterOptions, value: number | string) => void;
}

export default function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  return (
    <div className='flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow-sm'>
      <div className='flex flex-col'>
        <label htmlFor='rating' className='text-sm font-medium text-gray-700'>
          최소 평점
        </label>
        <select
          id='rating'
          value={filters.rating}
          onChange={(e) => onFilterChange("rating", Number(e.target.value))}
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'>
          <option value='0'>전체</option>
          {[1, 2, 3, 4, 5].map((rating) => (
            <option key={rating} value={rating}>
              {rating}점 이상
            </option>
          ))}
        </select>
      </div>

      <div className='flex flex-col'>
        <label htmlFor='distance' className='text-sm font-medium text-gray-700'>
          거리
        </label>
        <select
          id='distance'
          value={filters.distance}
          onChange={(e) => onFilterChange("distance", Number(e.target.value))}
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'>
          <option value='500'>500m</option>
          <option value='1000'>1km</option>
          <option value='2000'>2km</option>
          <option value='5000'>5km</option>
        </select>
      </div>

      <div className='flex flex-col'>
        <label htmlFor='price' className='text-sm font-medium text-gray-700'>
          가격대
        </label>
        <select
          id='price'
          value={filters.priceLevel}
          onChange={(e) => onFilterChange("priceLevel", Number(e.target.value))}
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'>
          <option value='0'>전체</option>
          <option value='1'>₩</option>
          <option value='2'>₩₩</option>
          <option value='3'>₩₩₩</option>
          <option value='4'>₩₩₩₩</option>
        </select>
      </div>
    </div>
  );
}
