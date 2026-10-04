import { getEvent } from './events';
import { addEventToCalendar, getEntryBySourceEventId, getMyBookings } from './calendarService';
import type { Event } from '../types';

export type AttendanceStatus = 'none' | 'going' | 'booked';

export async function rsvpToEvent(eventId: string): Promise<void> {
  const event = await getEvent(eventId);
  if (!event) throw new Error('Event not found.');
  await addEventToCalendar(event, 'going');
}

export async function bookEvent(eventId: string): Promise<void> {
  const event = await getEvent(eventId);
  if (!event) throw new Error('Event not found.');
  await addEventToCalendar(event, 'booked');
}

export async function getAttendanceStatus(eventId: string): Promise<AttendanceStatus> {
  const entry = await getEntryBySourceEventId(eventId);
  return entry?.status ?? 'none';
}

export async function getMyActivities(): Promise<{ event: Event; status: 'going' | 'booked' }[]> {
  const bookings = await getMyBookings();
  const activities = await Promise.all(bookings.flatMap((booking) => {
    if (!booking.sourceEventId || !booking.status) return [];
    return [getEvent(booking.sourceEventId).then((event) => event ? { event, status: booking.status as 'going' | 'booked' } : null)];
  }));
  return activities.filter((activity): activity is { event: Event; status: 'going' | 'booked' } => activity !== null)
    .sort((first, second) => new Date(first.event.start_time).getTime() - new Date(second.event.start_time).getTime());
}
