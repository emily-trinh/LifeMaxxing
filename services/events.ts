import { supabase } from '../lib/supabase';
import type { Event, EventParticipant } from '../types';

export async function getEvents(fromDate?: Date, toDate?: Date): Promise<Event[]> {
  let query = supabase
    .from('events')
    .select('id, title, description, category, price, is_free, start_time, end_time, address, latitude, longitude, capacity, image_url, is_group_activity, is_outdoor')
    .order('start_time', { ascending: true });
  if (fromDate) query = query.gte('start_time', fromDate.toISOString());
  if (toDate) query = query.lt('start_time', toDate.toISOString());

  const { data, error } = await query;
  if (error) throw new Error(`Unable to load events: ${error.message}`);
  return data as Event[];
}

export async function getEvent(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, description, category, price, is_free, start_time, end_time, address, latitude, longitude, capacity, image_url, is_group_activity, is_outdoor')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Unable to load the event: ${error.message}`);
  return data as Event | null;
}

export async function joinEvent(eventId: string): Promise<EventParticipant> {
  // TODO: Persist the current user's participation in Supabase.
  return { event_id: eventId, user_id: 'user-1', joined_at: new Date().toISOString() };
}

export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  // TODO: Return participants from Supabase.
  return [{ event_id: eventId, user_id: 'user-2', joined_at: '2026-10-01T12:00:00Z' }];
}