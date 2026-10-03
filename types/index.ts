export type GroupMode = 'solo' | 'group' | 'either';
export type MediaType = 'image' | 'video';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  interests: string[];
  radius_km: number;
  min_price: number;
  max_price: number;
  group_mode: GroupMode;
  current_streak: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  is_free: boolean;
  start_time: string;
  end_time: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  image_url: string | null;
  is_group_activity?: boolean;
  is_outdoor?: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  event_id: string;
  media_url: string;
  media_type: MediaType;
  caption: string;
  created_at: string;
}

export interface WeeklyPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  event_id: string | null;
  week_start: string;
}

export interface EventParticipant {
  event_id: string;
  user_id: string;
  joined_at: string;
}