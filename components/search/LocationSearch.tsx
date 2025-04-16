import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Autocomplete } from "@react-google-maps/api";

interface LocationSearchProps {
  onSearch: (location: string) => void;
  isSearching: boolean;
  searchInput: string;
  onInputChange: (value: string) => void;
  onPlaceSelect: () => void;
  onAutocompleteLoad: (autocomplete: google.maps.places.Autocomplete) => void;
}

export default function LocationSearch({
  onSearch,
  isSearching,
  searchInput,
  onInputChange,
  onPlaceSelect,
  onAutocompleteLoad,
}: LocationSearchProps) {
  return (
    <div className='flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg'>
      <h3 className='text-xl font-semibold mb-3 text-center'>Search Specific Location</h3>
      <div className='w-full flex gap-2'>
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlaceSelect}
          options={{
            types: ["(regions)"],
            componentRestrictions: { country: "au" },
          }}
          className='flex-1'>
          <input
            type='text'
            className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            placeholder='Enter suburb or address'
            value={searchInput}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={isSearching}
          />
        </Autocomplete>
        <button
          onClick={() => onSearch(searchInput)}
          disabled={isSearching || !searchInput.trim()}
          className={`px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${isSearching ? "animate-pulse" : ""}`}
          aria-label='Search Location'>
          {isSearching ? (
            <div className='w-5 h-5 border-t-2 border-white rounded-full animate-spin'></div>
          ) : (
            <MagnifyingGlassIcon className='h-5 w-5' />
          )}
        </button>
      </div>
    </div>
  );
}
