import { mockEvents } from '../lib/mockData';
import type { Event } from '../types';

export type AttendanceStatus = 'none' | 'going' | 'booked';

const goingEventIds = new Set<string>();
const bookedEventIds = new Set<string>();

// The backend will replace this mock with a Supabase call.
export async function rsvpToEvent(eventId: string): Promise<void> {
  goingEventIds.add(eventId);
}

// The backend will replace this mock with a Supabase call.
export async function bookEvent(eventId: string): Promise<void> {
  goingEventIds.delete(eventId);
  bookedEventIds.add(eventId);
}

// The backend will replace this mock with a Supabase call.
export async function getAttendanceStatus(eventId: string): Promise<AttendanceStatus> {
  if (bookedEventIds.has(eventId)) return 'booked';
  return goingEventIds.has(eventId) ? 'going' : 'none';
}

export async function getMyActivities(): Promise<{ event: Event; status: 'going' | 'booked' }[]> {
  return mockEvents
    .flatMap((event) => {
      const status: AttendanceStatus = bookedEventIds.has(event.id)
        ? 'booked'
        : goingEventIds.has(event.id)
          ? 'going'
          : 'none';
      return status === 'none' ? [] : [{ event, status }];
    })
    .sort((first, second) => new Date(first.event.start_time).getTime() - new Date(second.event.start_time).getTime());
}
