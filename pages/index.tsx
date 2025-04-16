import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { StarIcon } from "@heroicons/react/24/solid";
import {
  MapPinIcon,
  ClipboardDocumentIcon,
  BoltIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  ArrowUpCircleIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import ReviewInput from "../components/ReviewInput";
import ReviewResultCard from "../components/ReviewResultCard";
import { AnalysisResult } from "../types";
import { Autocomplete } from "@react-google-maps/api";
import RestaurantList from "../components/restaurant/RestaurantList";
import FilterBar from "../components/common/FilterBar";
import { createClient } from "@supabase/supabase-js";
import RestaurantSearch from "../components/RestaurantSearch";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { Restaurant } from "@/types/restaurant";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface HomeContentProps {
  isLoaded: boolean;
  loadError: Error | undefined;
}

function HomeContent({ isLoaded, loadError }: HomeContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    placeId: string;
    name: string;
    url: string;
  } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const topRef = useRef<HTMLDivElement>(null);
  const reviewResultRef = useRef<HTMLDivElement>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchLocationInput, setSearchLocationInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | { lat: number; lng: number } | null>(
    null
  );
  const [hasSearched, setHasSearched] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [autocompleteInstance, setAutocompleteInstance] =
    useState<google.maps.places.Autocomplete | null>(null);

  const findNearby = () => {
    setError(null);
    setIsSearching(true);
    setRestaurants([]);
    setHasSearched(true);
    setSearchQuery(null);
    setSearchLocationInput("");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          console.log("Current location:", coords);
          setSearchQuery(coords);
          fetchRestaurants(coords);
        },
        (geoError) => {
          console.error("Geolocation error:", geoError);
          setError("위치 정보를 가져올 수 없습니다. 위치 서비스가 활성화되어 있는지 확인해주세요.");
          setIsSearching(false);
          setHasSearched(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setError("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
      setIsSearching(false);
      setHasSearched(false);
    }
  };

  const searchByLocationText = async (locationText: string) => {
    if (!locationText.trim()) {
      setError("Please enter a location to search.");
      return;
    }
    setIsSearching(true);
    setRestaurants([]);
    setError(null);
    setHasSearched(true);
    setSearchQuery(locationText);

    try {
      const geocoder = new google.maps.Geocoder();
      const addressToGeocode = locationText.toLowerCase().includes("sydney")
        ? locationText
        : `${locationText}, Sydney, Australia`;
      const response = await geocoder.geocode({ address: addressToGeocode });

      if (response.results.length > 0) {
        const coords = {
          lat: response.results[0].geometry.location.lat(),
          lng: response.results[0].geometry.location.lng(),
        };
        fetchRestaurants(coords);
      } else {
        setError(
          `Could not find coordinates for "${locationText}". Please try a different location.`
        );
        setIsSearching(false);
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
      setError("Failed to geocode location. Please try again.");
      setIsSearching(false);
    }
  };

  const fetchRestaurants = (coords: { lat: number; lng: number }) => {
    try {
      const service = new google.maps.places.PlacesService(document.createElement("div"));
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(coords.lat, coords.lng),
        type: "restaurant",
        rankBy: google.maps.places.RankBy.DISTANCE,
      };

      console.log("Search request:", request);

      service.nearbySearch(request, (results, status) => {
        console.log("Places API response:", status, results);

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const filteredResults = results
            .filter((place) => place.rating && place.rating >= 4.0)
            .map((place) => {
              let distance = 0;
              try {
                if (place.geometry?.location && google.maps.geometry?.spherical) {
                  distance = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(coords.lat, coords.lng),
                    place.geometry.location
                  );
                }
              } catch (error) {
                console.error("Error calculating distance:", error);
              }

              const isOpenNow = place.opening_hours?.open_now;

              return {
                id: place.place_id || "",
                name: place.name || "",
                rating: place.rating || 0,
                priceLevel: (place.price_level || 0).toString(),
                imageUrl: place.photos ? place.photos[0].getUrl({ maxWidth: 400 }) : "",
                location: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0,
                },
                address: place.vicinity || "",
                categories: place.types || [],
                reviewCount: place.user_ratings_total || 0,
                distance,
                isOpenNow: isOpenNow,
              };
            })
            .sort((a, b) => {
              if (Math.abs(b.rating - a.rating) < 0.1) {
                return a.distance - b.distance;
              }
              return b.rating - a.rating;
            })
            .slice(0, 20);

          setRestaurants(filteredResults);
          if (filteredResults.length === 0) {
            setError("주변에 별점 4.0 이상의 맛집이 없습니다. 다른 위치에서 시도해보세요.");
          }
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setRestaurants([]);
          setError("주변에서 음식점을 찾을 수 없습니다. 다른 위치에서 시도해보세요.");
        } else {
          setError("음식점 검색 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
        setIsSearching(false);
      });
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setError("음식점 검색 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsSearching(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    if (hasSearched && searchQuery) {
      setIsSearching(true);
      if (typeof searchQuery === "string") {
        searchByLocationText(searchQuery);
      } else {
        fetchRestaurants(searchQuery);
      }
    }
  };

  const handleRestaurantSelect = (placeId: string, name: string, url: string) => {
    setSelectedRestaurant({ placeId, name, url });
    handleSubmit(url, placeId);
  };

  const handleSubmit = async (url: string, placeId?: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    if (!placeId) {
      setSelectedRestaurant(null);
      setRestaurants([]);
      setHasSearched(false);
      setSearchLocationInput("");
      setSearchQuery(null);
    }

    try {
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
      const analyzePayload: { reviews: any[]; placeId?: string } = { reviews: crawlData.data };
      if (placeId) {
        analyzePayload.placeId = placeId;
      }
      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analyzePayload),
      });
      const analyzeData = await analyzeResponse.json();
      if (!analyzeData.success) {
        throw new Error(analyzeData.error || "Failed to analyze reviews. Please try again later.");
      }
      setResult(analyzeData.data);
      setTimeout(() => {
        reviewResultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
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
    setRestaurants([]);
    setSearchLocationInput("");
    setSearchQuery(null);
    setHasSearched(false);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setAutocompleteInstance(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocompleteInstance !== null) {
      const place = autocompleteInstance.getPlace();
      const locationName = place.name || place.formatted_address || "";
      if (locationName) {
        setSearchLocationInput(locationName);
        searchByLocationText(locationName);
      }
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Head>
        <title>Before You Go - Restaurant Review Analysis</title>
        <meta
          name='description'
          content='Discover the best restaurants with AI-powered review analysis before you go'
        />
      </Head>

      {isLoading && selectedRestaurant && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl'>
            <div className='flex flex-col items-center'>
              <div className='mb-4'>
                <ChartBarIcon className='w-12 h-12 text-blue-600 animate-bounce' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Analyzing Reviews</h3>
              <p className='text-gray-600 text-center mb-4'>
                We're analyzing reviews for {selectedRestaurant.name}. This might take a few
                seconds...
              </p>
              <div className='w-full bg-gray-200 rounded-full h-2 mb-4'>
                <div className='bg-blue-600 h-2 rounded-full animate-[loading_1s_ease-in-out_infinite]'></div>
              </div>
              <p className='text-sm text-gray-500'>Our AI is reading and summarizing all reviews</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes loading {
          0% {
            width: 0%;
          }
          50% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
      `}</style>

      <main className='container mx-auto px-4 py-8'>
        {/* Find Near Me and Location Search Section */}
        <div className='flex flex-col items-center gap-4 mb-8'>
          <div className='flex gap-4 w-full max-w-xl'>
            <button
              onClick={findNearby}
              disabled={isSearching}
              className='flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
              <MapPinIcon className='w-5 h-5 mr-2' />
              {isSearching ? "Searching..." : "Find Near Me"}
            </button>

            <div className='flex-1 relative'>
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
                options={{
                  types: ["geocode"],
                  componentRestrictions: { country: "au" },
                }}>
                <input
                  ref={locationInputRef}
                  type='text'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Or enter location'
                  value={searchLocationInput}
                  onChange={(e) => setSearchLocationInput(e.target.value)}
                  disabled={isSearching}
                />
              </Autocomplete>
              <button
                onClick={() => searchByLocationText(searchLocationInput)}
                disabled={isSearching || !searchLocationInput.trim()}
                className='absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'>
                <MagnifyingGlassIcon className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className='max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>
            <p className='flex items-center'>
              <InformationCircleIcon className='w-5 h-5 mr-2' />
              {error}
            </p>
          </div>
        )}

        {hasSearched && restaurants.length > 0 && (
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-semibold text-gray-900'>Top Restaurants Near You</h2>
              <p className='text-gray-600'>Showing {restaurants.length} results</p>
            </div>
            <RestaurantList restaurants={restaurants} onRestaurantSelect={handleRestaurantSelect} />
          </div>
        )}

        {!result && !isLoading && !isSearching && (
          <div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
            <h2 className='text-2xl font-bold mb-4'>Search Restaurant Directly</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg'>
                <h3 className='text-xl font-semibold mb-3 text-center'>Enter Google Maps URL</h3>
                <div className='w-full'>
                  <input
                    type='text'
                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    placeholder='Paste Google Maps URL'
                  />
                  <button className='w-full mt-2 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'>
                    <PaperAirplaneIcon className='h-5 w-5 mr-2' />
                    Analyze Reviews
                  </button>
                  <a
                    href='https://www.google.com/maps'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-3 text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center'>
                    <MagnifyingGlassIcon className='h-4 w-4 mr-1' />
                    Find restaurant on Google Maps
                  </a>
                </div>
              </div>

              <div className='flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg'>
                <h3 className='text-xl font-semibold mb-3 text-center'>Search Restaurant Name</h3>
                <div className='w-full'>
                  <p className='text-gray-600 mb-4 text-center text-sm'>
                    Enter the name of the restaurant you want to analyze
                  </p>
                  <div className='max-w-md mx-auto'>
                    <RestaurantSearch
                      onRestaurantSelect={(placeId, name, url) => handleSubmit(url, placeId)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className='text-center py-12'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500'></div>
            <p className='mt-4 text-gray-600'>Analyzing reviews...</p>
          </div>
        ) : (
          result && (
            <div className='mt-12' ref={reviewResultRef}>
              {selectedRestaurant && (
                <h2 className='text-2xl font-bold mb-4 text-center'>
                  Analysis for: {selectedRestaurant.name}
                </h2>
              )}
              {!selectedRestaurant && (
                <h2 className='text-2xl font-bold mb-4 text-center'>Analysis Result</h2>
              )}
              <ReviewResultCard
                result={result}
                onWishlistClick={() => {}}
                onReviewClick={() => {}}
              />
              <div className='mt-8 text-center'>
                <button
                  onClick={handleNewSearch}
                  className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'>
                  <ArrowUpCircleIcon className='-ml-1 mr-3 h-5 w-5' aria-hidden='true' />
                  Start New Search or Location
                </button>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default function Home() {
  const { isLoaded, loadError } = useGoogleMaps();

  if (loadError) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-600'>Error loading Google Maps: {loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className='text-center py-12'>
        <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500'></div>
        <p className='mt-4 text-gray-600'>Loading Map Interface...</p>
      </div>
    );
  }

  return <HomeContent isLoaded={isLoaded} loadError={loadError} />;
}
