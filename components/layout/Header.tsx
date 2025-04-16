import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";

export default function Header() {
  return (
    <div className='relative text-center py-8 sm:py-12 overflow-hidden'>
      <div className='absolute inset-0 opacity-5 pointer-events-none'>
        {[...Array(15)].map((_, i) => (
          <StarIcon
            key={i}
            className={`absolute w-8 h-8 sm:w-12 sm:h-12 text-yellow-400 animate-pulse`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <div className='relative z-10 px-2'>
        <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight'>
          Before You Go
        </h1>
        <p className='text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed'>
          Discover the best restaurants in Sydney with AI-powered review analysis
        </p>
      </div>
    </div>
  );
}
