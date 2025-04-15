import React, { useState, useRef } from "react";
import Head from "next/head";
import { StarIcon } from "@heroicons/react/24/solid";
import {
  MapPinIcon,
  ClipboardDocumentIcon,
  BoltIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  ArrowUpCircleIcon,
} from "@heroicons/react/24/outline";
import ReviewInput from "../components/ReviewInput";
import ReviewResultCard from "../components/ReviewResultCard";
import RestaurantSearch from "../components/RestaurantSearch";
import { AnalysisResult } from "../types";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const topRef = useRef<HTMLDivElement>(null);

  const handleRestaurantSelect = (placeId: string, name: string, url: string) => {
    setSelectedRestaurant({ name, url });
    handleSubmit(url);
  };

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      // 1. Crawl Reviews
      const crawlResponse = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const crawlData = await crawlResponse.json();
      if (!crawlData.success) {
        throw new Error(
          crawlData.error || "Failed to fetch reviews. Please check the URL or try again later."
        );
      }
      if (!crawlData.data || crawlData.data.length === 0) {
        throw new Error("No reviews found for this location, or failed to parse them.");
      }

      // 2. Analyze Reviews
      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: crawlData.data }),
      });

      const analyzeData = await analyzeResponse.json();
      if (!analyzeData.success) {
        throw new Error(analyzeData.error || "Failed to analyze reviews. Please try again later.");
      }

      setResult(analyzeData.data);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = () => {
    setResult(null);
    setError(null);
    setSelectedRestaurant(null);

    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className='flex flex-col min-h-screen bg-gray-50' ref={topRef}>
      <Head>
        <title>What They Say? - AI Review Summaries for Sydney Restaurants</title>
        <meta
          name='description'
          content='Get quick AI-powered summaries of Google Maps reviews for restaurants in Sydney.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='flex-grow container mx-auto px-4 py-12 sm:py-16 md:py-24'>
        <div className='relative text-center mb-12 sm:mb-16 md:mb-20 overflow-hidden'>
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
            <h1 className='text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 mb-4 sm:mb-5 tracking-tight'>
              What They Say?
            </h1>
            <p className='text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
              Unlock instant insights from customer reviews. AI-powered summaries for{" "}
              <span className='font-bold text-indigo-700'>Sydney Restaurants</span> using Google
              Maps data.
            </p>
          </div>
        </div>

        <div className='max-w-4xl mx-auto'>
          {showInstructions && (
            <div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-bold flex items-center'>
                  <InformationCircleIcon className='h-6 w-6 mr-2 text-indigo-600' />
                  How to Use This App
                </h2>
                <button
                  onClick={() => setShowInstructions(false)}
                  className='text-gray-500 hover:text-gray-700'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'>
                    <path
                      fillRule='evenodd'
                      d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              </div>
              <div className='space-y-4'>
                <div className='flex items-start'>
                  <div className='flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center'>
                    <span className='text-indigo-600 font-bold'>1</span>
                  </div>
                  <div className='ml-4'>
                    <h3 className='text-lg font-medium text-gray-900'>Search for a Restaurant</h3>
                    <p className='mt-1 text-gray-600'>
                      Use the search box to find a restaurant in Sydney. Type the name and select
                      from the dropdown suggestions.
                    </p>
                  </div>
                </div>
                <div className='flex items-start'>
                  <div className='flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center'>
                    <span className='text-indigo-600 font-bold'>2</span>
                  </div>
                  <div className='ml-4'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Or Enter a Google Maps URL
                    </h3>
                    <p className='mt-1 text-gray-600'>
                      Alternatively, you can paste a Google Maps URL directly into the input field
                      below.
                    </p>
                  </div>
                </div>
                <div className='flex items-start'>
                  <div className='flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center'>
                    <span className='text-indigo-600 font-bold'>3</span>
                  </div>
                  <div className='ml-4'>
                    <h3 className='text-lg font-medium text-gray-900'>View Analysis Results</h3>
                    <p className='mt-1 text-gray-600'>
                      The app will automatically analyze reviews and provide insights about the
                      restaurant, including sentiment, keywords, and menu recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
            <h2 className='text-2xl font-bold mb-4'>Search Restaurant</h2>
            <RestaurantSearch onRestaurantSelect={handleRestaurantSelect} />

            {selectedRestaurant && !result && !isLoading && (
              <div className='mt-4 p-4 bg-gray-50 rounded-md'>
                <h3 className='font-semibold'>Selected Restaurant: {selectedRestaurant.name}</h3>
              </div>
            )}
          </div>

          <div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
            <h2 className='text-2xl font-bold mb-4'>Or Enter URL Directly</h2>
            <ReviewInput onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {error && (
            <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-8'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-red-500'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className='text-center py-12'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500'></div>
              <p className='mt-4 text-gray-600'>Analyzing reviews...</p>
            </div>
          )}

          {result && (
            <div className='mt-12'>
              <ReviewResultCard result={result} />
              <div className='mt-8 text-center'>
                <button
                  onClick={handleNewSearch}
                  className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'>
                  <ArrowUpCircleIcon className='-ml-1 mr-3 h-5 w-5' aria-hidden='true' />
                  Start New Search
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className='text-center py-8 bg-gray-100 border-t border-gray-200'>
        <p className='text-sm text-gray-600'>
          <StarIcon className='w-4 h-4 inline-block text-yellow-500 mr-1' />
          AI-Powered Review Analysis | What They Say? &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
