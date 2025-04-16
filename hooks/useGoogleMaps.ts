import { useState } from "react";
import { useLoadScript } from "@react-google-maps/api";

const libraries: "places"[] = ["places"];

export function useGoogleMaps() {
  const [autocompleteInstance, setAutocompleteInstance] =
    useState<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
    language: "en",
  });

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setAutocompleteInstance(autocomplete);
  };

  const getPlaceDetails = (placeId: string): Promise<google.maps.places.PlaceResult> => {
    return new Promise((resolve, reject) => {
      if (!isLoaded) {
        reject(new Error("Google Maps not loaded"));
        return;
      }

      const service = new google.maps.places.PlacesService(document.createElement("div"));
      service.getDetails(
        {
          placeId: placeId,
          fields: ["name", "rating", "formatted_address", "photos", "price_level"],
        },
        (result, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error("Failed to get place details"));
          }
        }
      );
    });
  };

  const geocodeLocation = async (locationText: string): Promise<{ lat: number; lng: number }> => {
    if (!isLoaded) {
      throw new Error("Google Maps not loaded");
    }

    const geocoder = new google.maps.Geocoder();
    const addressToGeocode = locationText.toLowerCase().includes("sydney")
      ? locationText
      : `${locationText}, Sydney, Australia`;

    const response = await geocoder.geocode({ address: addressToGeocode });
    if (response.results.length > 0) {
      return {
        lat: response.results[0].geometry.location.lat(),
        lng: response.results[0].geometry.location.lng(),
      };
    }
    throw new Error(`Could not find coordinates for "${locationText}"`);
  };

  return {
    isLoaded,
    loadError,
    autocompleteInstance,
    onAutocompleteLoad,
    getPlaceDetails,
    geocodeLocation,
  };
}
