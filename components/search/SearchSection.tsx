import React from "react";
import NearbySearch from "./NearbySearch";
import LocationSearch from "./LocationSearch";
import FilterBar from "../common/FilterBar";

interface SearchSectionProps {
  onNearbySearch: () => void;
  onLocationSearch: (location: string) => void;
  isSearching: boolean;
  isCurrentLocation: boolean;
  searchInput: string;
  onInputChange: (value: string) => void;
  onPlaceSelect: () => void;
  onAutocompleteLoad: (autocomplete: google.maps.places.Autocomplete) => void;
  hasSearched: boolean;
  filters: {
    rating: number;
    distance: number;
    priceLevel: string;
  };
  onFilterChange: (filters: { rating: number; distance: number; priceLevel: string }) => void;
}

export default function SearchSection({
  onNearbySearch,
  onLocationSearch,
  isSearching,
  isCurrentLocation,
  searchInput,
  onInputChange,
  onPlaceSelect,
  onAutocompleteLoad,
  hasSearched,
  filters,
  onFilterChange,
}: SearchSectionProps) {
  return (
    <div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
      <h2 className='text-2xl font-bold mb-4'>Find Your Perfect Restaurant</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <NearbySearch
          onSearch={onNearbySearch}
          isSearching={isSearching}
          isCurrentLocation={isCurrentLocation}
        />
        <LocationSearch
          onSearch={onLocationSearch}
          isSearching={isSearching}
          searchInput={searchInput}
          onInputChange={onInputChange}
          onPlaceSelect={onPlaceSelect}
          onAutocompleteLoad={onAutocompleteLoad}
        />
      </div>
      {hasSearched && (
        <div className='mt-6'>
          <h3 className='text-lg font-medium text-gray-700 mb-2'>Filter Results</h3>
          <FilterBar filters={filters} onFilterChange={onFilterChange} />
        </div>
      )}
    </div>
  );
}
