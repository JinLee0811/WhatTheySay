import React, { useState } from "react";

interface ReviewInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function ReviewInput({ onSubmit, isLoading }: ReviewInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className='w-full max-w-2xl mx-auto'>
      <div className='flex flex-col gap-2'>
        <label htmlFor='url' className='text-lg font-semibold text-gray-700 mb-1'>
          Enter Google Maps Restaurant URL (Sydney)
        </label>
        <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center'>
          <input
            type='url'
            id='url'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='e.g., https://www.google.com/maps/place/RestaurantName/...'
            className='flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-base w-full sm:w-auto'
            required
            aria-label='Google Maps Restaurant URL Input'
          />
          <button
            type='submit'
            disabled={isLoading}
            className='px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out flex-shrink-0 w-full sm:w-auto'>
            {isLoading ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-5 w-5 text-white inline'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                Analyzing...
              </>
            ) : (
              "Analyze Reviews"
            )}
          </button>
        </div>
        <p className='text-sm text-gray-500 mt-1'>
          Paste the full Google Maps URL of a restaurant located in Sydney.
        </p>
      </div>
    </form>
  );
}
