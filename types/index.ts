export interface Review {
  text: string;
  rating: number;
  date: string;
}

export interface AnalysisResult {
  sentiment: "positive" | "negative" | "mixed";
  positive_keywords: string[];
  negative_keywords: string[];
  summary: string;
  mentioned_menu_items: string[];
  recommended_dishes: string[];
  average_rating: number;
  photoUrls?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
