import React from "react";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  priceLevel: number;
  photos: string[];
  vicinity: string;
  placeId: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  isFirst?: boolean;
}

export default function RestaurantCard({ restaurant, isFirst = false }: RestaurantCardProps) {
  const { name, rating, priceLevel, photos, vicinity } = restaurant;
  const priceText = "$".repeat(priceLevel);

  return (
    <div className='bg-white rounded-lg overflow-hidden'>
      <div className='relative h-48 w-full'>
        {photos && photos.length > 0 ? (
          <Image
            src={photos[0]}
            alt={name}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            priority={isFirst}
          />
        ) : (
          <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
            <span className='text-gray-400'>No image available</span>
          </div>
        )}
      </div>
      <div className='p-4'>
        <h3 className='text-lg font-semibold mb-2 line-clamp-1'>{name}</h3>
        <div className='flex items-center gap-2 mb-2'>
          <div className='flex items-center'>
            <StarIcon className='h-5 w-5 text-yellow-400' />
            <span className='ml-1 text-sm'>{rating.toFixed(1)}</span>
          </div>
          <span className='text-sm text-gray-500'>{priceText}</span>
        </div>
        <p className='text-sm text-gray-600 line-clamp-2'>{vicinity}</p>
      </div>
    </div>
  );
}
