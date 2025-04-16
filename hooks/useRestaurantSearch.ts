import { useState } from "react";
import { Restaurant, SearchFilters } from "@/types/restaurant";

export function useRestaurantSearch() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    rating: 4.5,
    distance: 5,
    priceLevel: "all",
  });

  const searchNearby = (coords: { lat: number; lng: number }) => {
    setIsSearching(true);
    setRestaurants([]);
    setError(null);
    setHasSearched(true);

    const service = new google.maps.places.PlacesService(document.createElement("div"));
    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(coords.lat, coords.lng),
      radius: filters.distance * 1000,
      type: "restaurant",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const filteredResults = results
          .filter((place) => place.rating && place.rating >= filters.rating && place.place_id)
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
            return {
              id: place.place_id!,
              name: place.name || "",
              rating: place.rating || 0,
              reviewCount: place.user_ratings_total || 0,
              priceLevel: (place.price_level || 0).toString(),
              imageUrl: place.photos ? place.photos[0].getUrl({ maxWidth: 400 }) : "",
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
              address: place.vicinity || "",
              categories: place.types || [],
              distance: distance,
              isOpenNow: place.opening_hours?.open_now,
            };
          });

        const sortedResults = filteredResults
          .sort((a, b) => {
            if (Math.abs(b.rating - a.rating) < 0.1) {
              return a.distance - b.distance;
            }
            return b.rating - a.rating;
          })
          .slice(0, 20);

        setRestaurants(sortedResults);
        if (sortedResults.length === 0) {
          setError(
            `No restaurants found with rating >= ${filters.rating} within ${filters.distance}km.`
          );
        }
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        setRestaurants([]);
        setError(`No restaurants found within ${filters.distance}km.`);
      } else {
        setError("Could not fetch restaurants. Please try again.");
        console.error("Places API error:", status);
      }
      setIsSearching(false);
    });
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const resetSearch = () => {
    setRestaurants([]);
    setHasSearched(false);
    setError(null);
  };

  return {
    restaurants,
    isSearching,
    hasSearched,
    error,
    filters,
    searchNearby,
    handleFilterChange,
    resetSearch,
    setError,
    setIsSearching,
  };
}
