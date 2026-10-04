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
