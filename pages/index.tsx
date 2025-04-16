import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import {
  StarIcon,
  MapPinIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  ArrowUpCircleIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import ReviewResultCard from "../components/ReviewResultCard";
import { AnalysisResult } from "../types";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import RestaurantList from "../components/restaurant/RestaurantList";
import RestaurantSearch from "../components/RestaurantSearch";
import { Restaurant } from "@/types/restaurant";
import { supabase } from "../lib/supabaseClient";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

function HomeContent() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    placeId: string;
    name: string;
    url: string;
  } | null>(null);
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
  const [directUrlInput, setDirectUrlInput] = useState("");

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
          let message = "Could not get your location. Please ensure location services are enabled.";
          if (geoError.code === geoError.PERMISSION_DENIED) {
            message = "Location permission denied. Please enable it in your browser settings.";
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            message = "Location information is unavailable.";
          } else if (geoError.code === geoError.TIMEOUT) {
            message = "Getting location timed out. Please try again.";
          }
          setError(message);
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
      setError("Geolocation is not supported by this browser.");
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
      const addressToGeocode = locationText.toLowerCase().includes("australia")
        ? locationText
        : `${locationText}, Australia`;
      const response = await geocoder.geocode({
        address: addressToGeocode,
        language: "en",
      });

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
      if (!isLoaded) {
        setError("Map service not ready, please wait a moment.");
        setIsSearching(false);
        return;
      }
      const service = new google.maps.places.PlacesService(document.createElement("div"));
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(coords.lat, coords.lng),
        type: "restaurant",
        rankBy: google.maps.places.RankBy.DISTANCE,
        language: "en",
      };

      console.log("Search request:", request);

      service.nearbySearch(request, (results, status) => {
        console.log("Places API response:", status, results);

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const filteredResults = results
            .filter((place) => place.rating && place.rating >= 4.0 && place.place_id)
            .map((place): Restaurant => {
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
                id: place.place_id!,
                name: place.name || "",
                rating: place.rating || 0,
                reviewCount: place.user_ratings_total || 0,
                priceLevel: (place.price_level || 0).toString(),
                imageUrl: place.photos
                  ? place.photos[0].getUrl({ maxWidth: 400 })
                  : "/placeholder-restaurant.jpg",
                location: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0,
                },
                address: place.vicinity || "",
                categories: place.types || [],
                distance,
                isOpenNow: isOpenNow,
              };
            })
            .sort((a, b) => {
              if (Math.abs(b.rating - a.rating) >= 0.1) {
                return b.rating - a.rating;
              }
              return a.distance - b.distance;
            })
            .slice(0, 20);

          setRestaurants(filteredResults);
          if (filteredResults.length === 0) {
            setError("No restaurants found nearby with 4.0+ rating. Try a different location?");
          } else {
            setError(null);
          }
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setRestaurants([]);
          setError("No restaurants found nearby. Try searching a different location.");
        } else {
          setError("Error searching restaurants. Please try again later.");
          console.error("Places API error:", status);
        }
        setIsSearching(false);
      });
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setError("An unexpected error occurred while searching. Please try again.");
      setIsSearching(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    console.log("Filters changed:", newFilters);
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
      setDirectUrlInput(url);
    }

    if (!url || !url.startsWith("https://")) {
      setError("Please enter a valid Google Maps URL starting with https://");
      setIsLoading(false);
      return;
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
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
      setResult(null);
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
    setDirectUrlInput("");
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
      } else {
        setError("Could not get location details from selected place.");
      }
    }
  };

  if (loadError) {
    return (
      <div className='text-center py-12 text-red-600'>Error loading maps: {loadError.message}</div>
    );
  }
  if (!isLoaded) {
    return <div className='text-center py-12'>Loading map services...</div>;
  }

  return (
    <>
      <Head>
        <title>Before You Go | AI Restaurant Insights for Travelers</title>
        <meta
          name='description'
          content='Find the best local restaurants anywhere. AI analyzes reviews, so you dine like a local, not a tourist. Perfect for your next trip!'
        />
      </Head>

      {isLoading && selectedRestaurant && (
        <div className='fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl text-center'>
            <ChartBarIcon className='w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse' />
            <h3 className='text-xl font-semibold mb-2'>Analyzing Reviews</h3>
            <p className='text-gray-600 mb-4'>
              Our AI is reading reviews for{" "}
              <span className='font-medium'>{selectedRestaurant.name}</span>...
            </p>
            <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto'></div>
          </div>
        </div>
      )}

      <div ref={topRef}>
        <div className='text-center mb-12 md:mb-16'>
          <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight'>
            Dine Smarter, Not Harder
          </h1>
          <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8'>
            Stop scrolling endless reviews! <strong className='text-blue-600'>Before You Go</strong>{" "}
            uses AI to instantly summarize what locals *really* think, helping you find authentic
            dining experiences anywhere in Australia.
          </p>
        </div>

        <div className='bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12 max-w-3xl mx-auto'>
          <div className='flex flex-col sm:flex-row gap-4 mb-4'>
            <button
              onClick={findNearby}
              disabled={isSearching}
              className='flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap'>
              <MapPinIcon className='w-5 h-5 mr-2' />
              {isSearching ? "Searching Near You..." : "Find Restaurants Near Me"}
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
                  className='w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm'
                  placeholder='Or enter a suburb or city'
                  value={searchLocationInput}
                  onChange={(e) => setSearchLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchByLocationText(searchLocationInput);
                  }}
                  disabled={isSearching}
                />
              </Autocomplete>
              <button
                onClick={() => searchByLocationText(searchLocationInput)}
                disabled={isSearching || !searchLocationInput.trim()}
                className='absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500'
                aria-label='Search location'>
                <MagnifyingGlassIcon className='w-5 h-5' />
              </button>
            </div>
          </div>
          {isSearching && !error && (
            <p className='text-sm text-center text-gray-600 pt-2'>
              Searching for top-rated restaurants...
            </p>
          )}
          {error && (
            <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-center gap-2'>
              <InformationCircleIcon className='w-5 h-5' />
              <span>{error}</span>
            </div>
          )}
        </div>

        {hasSearched && !isSearching && restaurants.length > 0 && (
          <div className='mb-12'>
            <div className='flex flex-col sm:flex-row items-center justify-between mb-6 gap-4'>
              <h2 className='text-2xl font-semibold text-gray-900'>Top Restaurants Found</h2>
              <p className='text-gray-600 text-sm'>
                Showing {restaurants.length} results (Rating 4.0+)
              </p>
            </div>
            <RestaurantList restaurants={restaurants} onRestaurantSelect={handleRestaurantSelect} />
          </div>
        )}

        {!result && !isLoading && (
          <div className='bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-6 md:p-8 mb-12 text-center'>
            <SparklesIcon className='w-10 h-10 text-indigo-600 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-3'>Already Know the Restaurant?</h2>
            <p className='text-gray-600 mb-6 max-w-xl mx-auto'>
              Get instant AI insights by searching its name or pasting its Google Maps URL.
            </p>
            <div className='max-w-lg mx-auto'>
              <div className='mb-4'>
                <RestaurantSearch
                  onRestaurantSelect={(placeId, name, url) => handleSubmit(url, placeId)}
                />
              </div>
              <details className='text-sm'>
                <summary className='cursor-pointer text-indigo-600 hover:underline'>
                  Or paste Google Maps URL
                </summary>
                <div className='mt-3 flex gap-2'>
                  <input
                    type='url'
                    className='flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                    placeholder='https://maps.app.goo.gl/...'
                    value={directUrlInput}
                    onChange={(e) => setDirectUrlInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSubmit(directUrlInput)}
                    disabled={isLoading || !directUrlInput.trim()}
                    className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-sm whitespace-nowrap'>
                    Analyze URL
                  </button>
                </div>
              </details>
            </div>
          </div>
        )}

        {result && !isLoading && (
          <div className='mt-12 md:mt-16' ref={reviewResultRef}>
            {selectedRestaurant && (
              <h2 className='text-3xl font-bold mb-6 text-center'>
                AI Analysis: <span className='text-blue-600'>{selectedRestaurant.name}</span>
              </h2>
            )}
            {!selectedRestaurant && directUrlInput && (
              <h2 className='text-3xl font-bold mb-6 text-center'>
                AI Analysis: <span className='text-blue-600'>Entered URL</span>
              </h2>
            )}
            <ReviewResultCard result={result} onWishlistClick={() => {}} onReviewClick={() => {}} />
            <div className='mt-10 text-center'>
              <button
                onClick={handleNewSearch}
                className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'>
                <ArrowUpCircleIcon className='-ml-1 mr-3 h-5 w-5' aria-hidden='true' />
                Search Another Location or Restaurant
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function Home() {
  return <HomeContent />;
}
