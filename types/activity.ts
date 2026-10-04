export interface AppEvent {
  id: string;
  source: 'google_search_events';
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  timeKnown?: boolean;
  venueName: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  ticketUrl: string | null;
  sourceUrl: string | null;
  category: string;
  isFree: boolean | null;
  priceText: string | null;
  distanceKm?: number;
}

export interface CalendarEventDetails {
  venueName: string | null;
  address: string;
  imageUrl: string | null;
  ticketUrl: string | null;
  sourceUrl: string | null;
}

export interface CalendarEntry {
  id: string;
  userId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  kind: 'personal' | 'booking';
  status: 'going' | 'booked' | null;
  notes: string | null;
  sourceEventId: string | null;
  event: CalendarEventDetails | null;
  createdAt: string;
}