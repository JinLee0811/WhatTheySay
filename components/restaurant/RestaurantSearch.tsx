import { useEffect, useState } from "react";
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

  const [searchValue, setSearchValue] = useState("");
  const handleSearch = () => {
    console.log("Search triggered with:", searchValue);
  };

  const handleRestaurantSelect = (placeId: string, name: string, url: string) => {
    console.log("Restaurant selected:", placeId, name);
  };

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
    const address = place.name;

    if (!place.geometry?.location) {
      if (typeof address === "string" && address.trim()) {
        try {
          setIsSearching(true);
          const coords = await geocodeLocation(address);
          searchNearby(coords);
        } catch (error) {
          setError("Could not find the location. Please try a different search.");
          setIsSearching(false);
        }
      } else {
        setError("Could not determine location from the selected place.");
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
      <SearchInput value={searchValue} onChange={setSearchValue} onSearch={handleSearch} />
      <SearchFilters filters={filters} onFilterChange={handleFilterChange} />

      {isSearching && <div className='text-center py-4'>Loading restaurants...</div>}
      {error && <div className='text-center py-4 text-red-600'>{error}</div>}
      {!isSearching && !error && hasSearched && restaurants.length > 0 && (
        <RestaurantList restaurants={restaurants} onRestaurantSelect={handleRestaurantSelect} />
      )}
      {!isSearching && !error && hasSearched && restaurants.length === 0 && (
        <div className='text-center py-4 text-gray-500'>
          No restaurants found matching criteria.
        </div>
      )}
    </div>
  );
}
