export interface Location {
  lat: number;
  lng: number;
}

export interface SearchParams {
  query: string;
  location: Location;
  radius: number;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  priceLevel: string;
  imageUrl: string;
  location: Location;
  address: string;
  categories: string[];
  distance: number;
  isOpenNow?: boolean;
}

// Define SearchFilters centrally
export interface SearchFilters {
  rating: number;
  distance: number; // distance in km
  priceLevel: string; // e.g., "all", "1", "2", "3", "4"
}

export interface FilterOptions {
  minRating: number | null;
  maxDistance: number | null;
  priceLevel: number | null;
}
