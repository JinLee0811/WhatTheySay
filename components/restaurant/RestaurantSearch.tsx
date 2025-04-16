import { useEffect } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useRestaurantSearch } from "@/hooks/useRestaurantSearch";
import RestaurantList from "./RestaurantList";
import SearchFilters from "./SearchFilters";
import SearchInput from "./SearchInput";

export function RestaurantSearch() {
  const {
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
  } = useRestaurantSearch();

  const {
    autocompleteInstance: autocomplete,
    isLoaded,
    loadError,
    onAutocompleteLoad,
    getPlaceDetails,
    geocodeLocation,
  } = useGoogleMaps();

  useEffect(() => {
    if (isLoaded && !loadError) {
      const input = document.getElementById("location-search") as HTMLInputElement;
      if (input) {
        const autocomplete = new google.maps.places.Autocomplete(input, {
          types: ["geocode", "establishment"],
        });
        onAutocompleteLoad(autocomplete);
      }
    }
  }, [isLoaded, loadError]);

  const handlePlaceSelect = async () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place.geometry?.location) {
      const address = place.name;
      try {
        setIsSearching(true);
        const coords = await geocodeLocation(address);
        searchNearby(coords);
      } catch (error) {
        setError("Could not find the location. Please try a different search.");
        setIsSearching(false);
      }
      return;
    }

    const coords = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    searchNearby(coords);
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (loadError) return <div>Error loading Google Maps</div>;

  return (
    <div className='w-full max-w-4xl mx-auto p-4 space-y-6'>
      <SearchInput onPlaceSelect={handlePlaceSelect} />
      <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
      <RestaurantList
        restaurants={restaurants}
        isLoading={isSearching}
        hasSearched={hasSearched}
        error={error}
      />
    </div>
  );
}
