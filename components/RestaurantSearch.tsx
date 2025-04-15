import React, { useState, useCallback } from "react";
import { GoogleMap, LoadScript, Autocomplete } from "@react-google-maps/api";

interface RestaurantSearchProps {
  onRestaurantSelect: (placeId: string, name: string, url: string) => void;
}

const RestaurantSearch: React.FC<RestaurantSearchProps> = ({ onRestaurantSelect }) => {
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const onLoad = (ref: google.maps.places.Autocomplete) => {
    setSearchBox(ref);
  };

  const onPlaceChanged = () => {
    if (searchBox) {
      const place = searchBox.getPlace();

      // Check if place object and required properties exist
      if (place && place.place_id && place.name) {
        // Google Maps URL 생성
        const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;

        setSelectedRestaurant({ name: place.name, url: mapsUrl });
        onRestaurantSelect(place.place_id, place.name, mapsUrl);
      }
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedRestaurant(null);
    // Find and clear the input element
    const inputElement = document.querySelector(
      'input[placeholder="Enter restaurant name..."]'
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = "";
    }
    if (searchBox) {
      searchBox.set("place", null);
    }
  };

  // API 키가 없는 경우 처리
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
    <div className='w-full max-w-md mx-auto'>
      <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md'>
        <h3 className='font-medium text-blue-800 mb-2'>How to use:</h3>
        <ol className='list-decimal list-inside text-blue-700 text-sm'>
          <li>Enter a restaurant name in the search box</li>
          <li>Select a restaurant from the dropdown suggestions</li>
          <li>The app will automatically analyze reviews for the selected restaurant</li>
          <li>Use the reset button to start a new search</li>
        </ol>
      </div>

      <div className='relative'>
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          libraries={["places"]}
          language='en'>
          <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
              types: ["restaurant", "food"],
              componentRestrictions: { country: "au" }, // Restrict to Sydney area
            }}>
            <input
              type='text'
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter restaurant name...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Autocomplete>
        </LoadScript>

        {selectedRestaurant && (
          <div className='mt-2 flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              Selected: <span className='font-medium'>{selectedRestaurant.name}</span>
            </div>
            <button
              onClick={handleReset}
              className='px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors'>
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSearch;
