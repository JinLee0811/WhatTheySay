import React from "react";
import { AnalysisResult } from "../types";
import { StarIcon } from "@heroicons/react/24/solid";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  FireIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

interface ReviewResultCardProps {
  result: AnalysisResult;
}

// Helper function to generate star icons based on rating
const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className='flex items-center'>
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon key={`full-${i}`} className='w-5 h-5 text-yellow-400' />
      ))}
      {/* Render half star if applicable */}
      {halfStar && <StarIcon key='half' className='w-5 h-5 text-yellow-400 opacity-50' />}
      {[...Array(emptyStars)].map((_, i) => (
        <StarIcon key={`empty-${i}`} className='w-5 h-5 text-gray-300' />
      ))}
      <span className='ml-2 text-sm font-medium text-gray-600'>({rating.toFixed(1)})</span>
    </div>
  );
};

export default function ReviewResultCard({ result }: ReviewResultCardProps) {
  const getSentimentClasses = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-300";
      case "negative":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  const formatSentimentText = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "Positive";
      case "negative":
        return "Negative";
      case "mixed":
        return "Mixed";
      default:
        return "Neutral";
    }
  };

  return (
    <div className='bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100'>
      <div className='p-4 sm:p-6 md:p-10'>
        <h2 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center'>
          AI Analysis Report
        </h2>

        <div className='space-y-6 sm:space-y-8'>
          {/* Average Rating */}
          {result.average_rating !== undefined && (
            <div className='p-4 sm:p-5 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 flex items-center justify-between'>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-700 flex items-center'>
                <StarIcon className='w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-500' />
                Average Rating
              </h3>
              {renderStars(result.average_rating)}
            </div>
          )}

          {/* Sentiment Analysis */}
          <div className='p-4 sm:p-5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-between'>
            <h3 className='text-lg sm:text-xl font-semibold text-gray-700 flex items-center'>
              <ChatBubbleLeftRightIcon className='w-5 h-5 sm:w-6 sm:h-6 mr-2 text-indigo-500' />
              Overall Sentiment
            </h3>
            <span
              className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-sm sm:text-md font-bold border shadow-sm ${getSentimentClasses(result.sentiment)}`}>
              {formatSentimentText(result.sentiment)}
            </span>
          </div>

          {/* Keywords */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
            {/* Positive Keywords */}
            <div className='p-4 sm:p-5 rounded-lg bg-green-50 border border-green-200'>
              <h3 className='text-lg sm:text-xl font-semibold text-green-800 mb-3 sm:mb-4 flex items-center'>
                <HandThumbUpIcon className='w-5 h-5 sm:w-6 sm:h-6 mr-2' />
                Positive Keywords
              </h3>
              {result.positive_keywords && result.positive_keywords.length > 0 ? (
                <div className='flex flex-wrap gap-2 sm:gap-2.5'>
                  {result.positive_keywords.map((keyword, index) => (
                    <span
                      key={`pos-${index}`}
                      className='px-3 py-1 sm:px-3.5 sm:py-1.5 bg-white text-green-800 rounded-full text-xs sm:text-sm font-medium border border-green-300 shadow-sm hover:bg-green-100 transition-colors'>
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className='text-xs sm:text-sm text-gray-500 italic'>
                  No specific positive keywords identified.
                </p>
              )}
            </div>
            {/* Negative Keywords */}
            <div className='p-4 sm:p-5 rounded-lg bg-red-50 border border-red-200'>
              <h3 className='text-lg sm:text-xl font-semibold text-red-800 mb-3 sm:mb-4 flex items-center'>
                <HandThumbDownIcon className='w-5 h-5 sm:w-6 sm:h-6 mr-2' />
                Negative Keywords
              </h3>
              {result.negative_keywords && result.negative_keywords.length > 0 ? (
                <div className='flex flex-wrap gap-2 sm:gap-2.5'>
                  {result.negative_keywords.map((keyword, index) => (
                    <span
                      key={`neg-${index}`}
                      className='px-3 py-1 sm:px-3.5 sm:py-1.5 bg-white text-red-800 rounded-full text-xs sm:text-sm font-medium border border-red-300 shadow-sm hover:bg-red-100 transition-colors'>
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className='text-xs sm:text-sm text-gray-500 italic'>
                  No specific negative keywords identified.
                </p>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
            {/* Mentioned Menu Items */}
            <div className='p-4 sm:p-5 rounded-lg bg-blue-50 border border-blue-200'>
              <h3 className='text-lg sm:text-xl font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center'>
                <ListBulletIcon className='w-5 h-5 sm:w-6 sm:h-6 mr-2' />
                Mentioned Menu Items
              </h3>
              {result.mentioned_menu_items && result.mentioned_menu_items.length > 0 ? (
                <div className='flex flex-wrap gap-2 sm:gap-2.5'>
                  {result.mentioned_menu_items.map((item, index) => (
                    <span
                      key={`menu-${index}`}
                      className='px-3 py-1 sm:px-3.5 sm:py-1.5 bg-white text-blue-800 rounded-full text-xs sm:text-sm font-medium border border-blue-300 shadow-sm hover:bg-blue-100 transition-colors'>
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className='text-xs sm:text-sm text-gray-500 italic'>
                  No specific menu items mentioned in reviews.
                </p>
              )}
            </div>
            {/* Recommended Dishes */}
            <div className='p-4 sm:p-5 rounded-lg bg-amber-50 border border-amber-200'>
              <h3 className='text-lg sm:text-xl font-semibold text-amber-800 mb-3 sm:mb-4 flex items-center'>
                <FireIcon className='w-5 h-5 sm:w-6 sm:h-6 mr-2' />
                Recommended Dishes
              </h3>
              {result.recommended_dishes && result.recommended_dishes.length > 0 ? (
                <div className='flex flex-wrap gap-2 sm:gap-2.5'>
                  {result.recommended_dishes.map((dish, index) => (
                    <span
                      key={`dish-${index}`}
                      className='px-3 py-1 sm:px-3.5 sm:py-1.5 bg-white text-amber-800 rounded-full text-xs sm:text-sm font-medium border border-amber-300 shadow-sm hover:bg-amber-100 transition-colors'>
                      {dish}
                    </span>
                  ))}
                </div>
              ) : (
                <p className='text-xs sm:text-sm text-gray-500 italic'>
                  No specific dishes recommended in reviews.
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className='p-4 sm:p-5 rounded-lg bg-gray-50 border border-gray-200'>
            <h3 className='text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center'>
              <DocumentTextIcon className='w-5 h-5 sm:w-6 sm:h-6 mr-2 text-gray-500' />
              Summary
            </h3>
            <p className='text-sm sm:text-base text-gray-700 whitespace-pre-line'>
              {result.summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
