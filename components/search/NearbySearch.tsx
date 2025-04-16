import React from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";

interface NearbySearchProps {
  onSearch: () => void;
  isSearching: boolean;
  isCurrentLocation: boolean;
}

export default function NearbySearch({
  onSearch,
  isSearching,
  isCurrentLocation,
}: NearbySearchProps) {
  return (
    <div className='flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg'>
      <h3 className='text-xl font-semibold mb-3 text-center'>Discover Nearby Restaurants</h3>
      <button
        onClick={onSearch}
        disabled={isSearching}
        className={`w-full flex items-center justify-center px-6 py-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed ${isSearching ? "animate-pulse" : ""}`}>
        <MapPinIcon className='h-5 w-5 mr-2' />
        {isSearching && isCurrentLocation ? "Finding..." : "Find Near Me"}
      </button>
    </div>
  );
}
