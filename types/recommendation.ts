export type RecommendationGroupMode = 'solo' | 'group' | 'either';

export interface UserPreferences {
  interests: string[];
  likes: string[];
  dislikes: string[];
  radiusKm: number;
  minPrice: number;
  maxPrice: number;
  groupMode: RecommendationGroupMode;
}

export interface CandidateEvent {
  id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  isFree: boolean;
  distanceKm: number;
  groupMode?: RecommendationGroupMode;
}

export interface EventRecommendation {
  eventId: string | null;
  reason: string;
}