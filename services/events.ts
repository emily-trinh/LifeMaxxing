import { mockEvents } from '../lib/mockData';
import type { Event, EventParticipant } from '../types';

export async function getEvents(): Promise<Event[]> {
  // TODO: Replace with a Supabase query once the events schema is ready.
  return mockEvents;
}

export async function getEvent(id: string): Promise<Event | null> {
  return mockEvents.find((event) => event.id === id) ?? null;
}

export async function joinEvent(eventId: string): Promise<EventParticipant> {
  // TODO: Persist the current user's participation in Supabase.
  return { event_id: eventId, user_id: 'user-1', joined_at: new Date().toISOString() };
}

export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  // TODO: Return participants from Supabase.
  return [{ event_id: eventId, user_id: 'user-2', joined_at: '2026-10-01T12:00:00Z' }];
}