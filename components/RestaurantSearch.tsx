import React, { useState, useCallback } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface RestaurantSearchProps {
  onRestaurantSelect: (placeId: string, name: string, url: string) => void;
}

export default function RestaurantSearch({ onRestaurantSelect }: RestaurantSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [autocompleteInstance, setAutocompleteInstance] =
    useState<google.maps.places.Autocomplete | null>(null);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setAutocompleteInstance(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocompleteInstance !== null) {
      const place = autocompleteInstance.getPlace();
      if (place.place_id && place.name) {
        const url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
        setSelectedRestaurant({ name: place.name, url: url });
        onRestaurantSelect(place.place_id, place.name, url);
      }
    }
  };

  const handleReset = useCallback(() => {
    setSearchQuery("");
    setSelectedRestaurant(null);
  }, []);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className='w-full p-4 bg-red-50 border border-red-200 rounded-md'>
        <p className='text-red-700'>
          Google Maps API key is missing. Please check your environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className='relative'>
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            types: ["restaurant"],
            componentRestrictions: { country: "au" },
          }}>
          <div className='relative group'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <MagnifyingGlassIcon className='h-5 w-5 text-gray-400 group-focus-within:text-indigo-500' />
            </div>
            <input
              type='text'
              className='w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200 ease-in-out'
              placeholder='Enter the name of the restaurant you want to analyze'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={handleReset}
                className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                <XMarkIcon className='h-5 w-5 text-gray-400 hover:text-gray-600' />
              </button>
            )}
          </div>
        </Autocomplete>

        {selectedRestaurant && (
          <div className='mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-md flex items-center justify-between shadow-sm'>
            <div className='text-sm text-indigo-700'>
              Selected: <span className='font-medium'>{selectedRestaurant.name}</span>
            </div>
            <button
              onClick={handleReset}
              className='px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors'>
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
