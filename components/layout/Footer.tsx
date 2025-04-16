import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";

export default function Footer() {
  return (
    <footer className='text-center py-8 bg-gray-100 border-t border-gray-200'>
      <p className='text-sm text-gray-600'>
        <StarIcon className='w-4 h-4 inline-block text-yellow-500 mr-1' />
        AI-Powered Restaurant Discovery | Before You Go &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
}
