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
}

export interface FilterOptions {
  minRating: number | null;
  maxDistance: number | null;
  priceLevel: number | null;
}
