import { useState } from "react";

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  priceLevel: number;
  photos: string[];
  vicinity: string;
  placeId: string;
}

interface SearchFilters {
  rating: number;
  distance: number;
  priceLevel: string;
}

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
      minPriceLevel: filters.priceLevel === "all" ? 0 : parseInt(filters.priceLevel),
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const filteredResults = results
          .filter((place) => place.rating && place.rating >= filters.rating)
          .map((place) => ({
            id: place.place_id || "",
            name: place.name || "",
            rating: place.rating || 0,
            priceLevel: place.price_level || 0,
            photos: place.photos ? [place.photos[0].getUrl({ maxWidth: 400 })] : [],
            vicinity: place.vicinity || "",
            placeId: place.place_id || "",
          }));
        setRestaurants(filteredResults);
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        setRestaurants([]);
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
