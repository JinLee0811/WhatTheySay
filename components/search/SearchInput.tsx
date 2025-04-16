import React, { useState } from "react";
import { SearchParams } from "@/types/restaurant";

interface SearchInputProps {
  onSearch: (params: SearchParams) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [radius, setRadius] = useState(5000); // 기본 반경 5km

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query,
      location,
      radius,
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className='w-full max-w-2xl mx-auto space-y-4 p-4'>
      <div className='flex gap-4'>
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='음식점 또는 음식 검색...'
          className='flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <button
          type='button'
          onClick={getCurrentLocation}
          className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200'>
          현재 위치
        </button>
      </div>
      <div className='flex gap-4'>
        <input
          type='range'
          min='1000'
          max='20000'
          step='1000'
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className='flex-1'
        />
        <span className='text-gray-600'>검색 반경: {radius / 1000}km</span>
      </div>
      <button
        type='submit'
        className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors'>
        검색
      </button>
    </form>
  );
};

export default SearchInput;
