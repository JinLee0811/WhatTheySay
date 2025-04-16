import React, { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { MapPinIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Restaurant } from "@/types/restaurant";

interface RestaurantListProps {
  restaurants: Restaurant[];
  onRestaurantSelect: (placeId: string, name: string, url: string) => void;
}

export default function RestaurantList({ restaurants, onRestaurantSelect }: RestaurantListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(restaurants.length / itemsPerPage);

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === i ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
          }`}>
          {i}
        </button>
      );
    }

    return pages;
  };

  if (!restaurants.length) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-500'>No restaurants found matching your criteria.</p>
      </div>
    );
  }

  const currentRestaurants = restaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {currentRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() =>
              onRestaurantSelect(
                restaurant.id,
                restaurant.name,
                `https://www.google.com/maps/place/?q=place_id:${restaurant.id}`
              )
            }
            className='bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer overflow-hidden'>
            <div className='relative h-48'>
              <img
                src={restaurant.imageUrl || "/placeholder-restaurant.jpg"}
                alt={restaurant.name}
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center'>
                <span className='text-white text-lg font-medium'>View Details</span>
              </div>
              <div className='absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md'>
                <div className='flex items-center gap-1'>
                  <StarIcon className='w-5 h-5 text-yellow-400' />
                  <span className='font-semibold'>{restaurant.rating.toFixed(1)}</span>
                </div>
              </div>
              {restaurant.isOpenNow !== undefined && (
                <div
                  className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-xs font-medium text-white shadow-md ${restaurant.isOpenNow ? "bg-green-500" : "bg-red-500"}`}>
                  {restaurant.isOpenNow ? "Open" : "Closed"}
                </div>
              )}
            </div>
            <div className='p-4'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>{restaurant.name}</h3>
              <div className='flex items-center gap-2 text-gray-600 mb-2'>
                <MapPinIcon className='w-4 h-4' />
                <span className='text-sm'>{formatDistance(restaurant.distance)}</span>
              </div>
              <p className='text-sm text-gray-500 line-clamp-2'>{restaurant.address}</p>
              <div className='mt-3 flex items-center justify-between'>
                <span className='text-sm text-gray-600'>{restaurant.reviewCount} reviews</span>
                {restaurant.priceLevel && (
                  <span className='text-sm font-medium text-gray-700'>
                    {"$".repeat(parseInt(restaurant.priceLevel))}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-2 mt-8'>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className='p-2 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'>
            <ChevronLeftIcon className='w-5 h-5' />
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='p-2 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'>
            <ChevronRightIcon className='w-5 h-5' />
          </button>
        </div>
      )}
    </div>
  );
}
