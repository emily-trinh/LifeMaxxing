import { supabase } from '../lib/supabase';
import type { Event } from '../types';
import type { AppEvent, CalendarEntry, CalendarEventDetails } from '../types/activity';

const columns = 'id, user_id, title, starts_at, ends_at, all_day, kind, status, notes, source_event_id, event, created_at';
const entryCache = new Map<string, CalendarEntry[]>();

type CalendarRow = {
  id: string;
  user_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  kind: 'personal' | 'booking';
  status: 'going' | 'booked' | null;
  notes: string | null;
  source_event_id: string | null;
  event: CalendarEventDetails | null;
  created_at: string;
};

export type PersonalEntryPatch = Partial<{
  title: string;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
  notes: string | null;
}>;

function mapCalendarEntry(row: CalendarRow): CalendarEntry {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    allDay: row.all_day,
    kind: row.kind,
    status: row.status,
    notes: row.notes,
    sourceEventId: row.source_event_id,
    event: row.event,
    createdAt: row.created_at,
  };
}

function invalidateCalendarCache() {
  entryCache.clear();
}

function mapSupabaseError(message: string, error: { message: string }): Error {
  return new Error(`${message}: ${error.message}`);
}

function toAppEvent(event: Event): AppEvent {
  return {
    id: event.id,
    source: 'google_search_events',
    title: event.title,
    description: event.description,
    startTime: event.start_time,
    endTime: event.end_time || null,
    timeKnown: true,
    venueName: null,
    address: event.address,
    latitude: event.latitude,
    longitude: event.longitude,
    imageUrl: event.image_url,
    ticketUrl: event.ticket_url ?? null,
    sourceUrl: null,
    category: event.category,
    isFree: event.is_free,
    priceText: event.price > 0 ? `$${event.price}` : null,
  };
}

export async function getEntries(rangeStart: Date, rangeEnd: Date): Promise<CalendarEntry[]> {
  if (!Number.isFinite(rangeStart.getTime()) || !Number.isFinite(rangeEnd.getTime()) || rangeEnd < rangeStart) {
    throw new Error('Calendar range is invalid.');
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw mapSupabaseError('Unable to verify calendar user', userError);
  if (!userData.user) throw new Error('A signed-in user is required to load calendar entries.');

  const cacheKey = `${userData.user.id}|${rangeStart.toISOString()}|${rangeEnd.toISOString()}`;
  const cached = entryCache.get(cacheKey);
  if (cached) return cached.map((entry) => ({ ...entry }));

  const { data, error } = await supabase
    .from('calendar_entries')
    .select(columns)
    .lte('starts_at', rangeEnd.toISOString())
    .gte('ends_at', rangeStart.toISOString())
    .order('starts_at', { ascending: true });

  if (error) throw mapSupabaseError('Unable to load calendar entries', error);
  const entries = ((data ?? []) as CalendarRow[]).map(mapCalendarEntry);
  entryCache.set(cacheKey, entries);
  return entries.map((entry) => ({ ...entry }));
}

export async function getEntry(id: string): Promise<CalendarEntry | null> {
  const { data, error } = await supabase
    .from('calendar_entries')
    .select(columns)
    .eq('id', id)
    .maybeSingle();

  if (error) throw mapSupabaseError('Unable to load calendar entry', error);
  return data ? mapCalendarEntry(data as CalendarRow) : null;
}

export async function getEntryBySourceEventId(sourceEventId: string): Promise<CalendarEntry | null> {
  const { data, error } = await supabase
    .from('calendar_entries')
    .select(columns)
    .eq('source_event_id', sourceEventId)
    .eq('kind', 'booking')
    .maybeSingle();

  if (error) throw mapSupabaseError('Unable to load event booking', error);
  return data ? mapCalendarEntry(data as CalendarRow) : null;
}

export async function getMyBookings(): Promise<CalendarEntry[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw mapSupabaseError('Unable to verify calendar user', userError);
  if (!userData.user) throw new Error('A signed-in user is required to load bookings.');

  const { data, error } = await supabase
    .from('calendar_entries')
    .select(columns)
    .eq('user_id', userData.user.id)
    .eq('kind', 'booking')
    .order('starts_at', { ascending: true });

  if (error) throw mapSupabaseError('Unable to load bookings', error);
  return ((data ?? []) as CalendarRow[]).map(mapCalendarEntry);
}

export async function createPersonalEntry({
  title,
  startsAt,
  endsAt,
  allDay = false,
  notes,
}: {
  title: string;
  startsAt: Date;
  endsAt: Date;
  allDay?: boolean;
  notes?: string | null;
}): Promise<CalendarEntry> {
  if (!title.trim()) throw new Error('Calendar entry title is required.');
  if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || endsAt < startsAt) {
    throw new Error('Calendar entry time range is invalid.');
  }

  const { data, error } = await supabase
    .from('calendar_entries')
    .insert({
      title: title.trim(),
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      all_day: allDay,
      notes: notes?.trim() || null,
      kind: 'personal',
    })
    .select(columns)
    .single();

  if (error) throw mapSupabaseError('Unable to create calendar entry', error);
  invalidateCalendarCache();
  return mapCalendarEntry(data as CalendarRow);
}

export async function updatePersonalEntry(id: string, patch: PersonalEntryPatch): Promise<CalendarEntry> {
  const updates: Record<string, unknown> = {};
  if (patch.title !== undefined) {
    if (!patch.title.trim()) throw new Error('Calendar entry title is required.');
    updates.title = patch.title.trim();
  }
  if (patch.startsAt !== undefined) {
    if (!Number.isFinite(patch.startsAt.getTime())) throw new Error('Calendar entry start time is invalid.');
    updates.starts_at = patch.startsAt.toISOString();
  }
  if (patch.endsAt !== undefined) {
    if (!Number.isFinite(patch.endsAt.getTime())) throw new Error('Calendar entry end time is invalid.');
    updates.ends_at = patch.endsAt.toISOString();
  }
  if (patch.allDay !== undefined) updates.all_day = patch.allDay;
  if (patch.notes !== undefined) updates.notes = patch.notes?.trim() || null;

  if (Object.keys(updates).length === 0) throw new Error('No calendar entry changes were provided.');

  const { data, error } = await supabase
    .from('calendar_entries')
    .update(updates)
    .eq('id', id)
    .eq('kind', 'personal')
    .select(columns)
    .single();

  if (error) throw mapSupabaseError('Unable to update calendar entry', error);
  invalidateCalendarCache();
  return mapCalendarEntry(data as CalendarRow);
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('calendar_entries').delete().eq('id', id);
  if (error) throw mapSupabaseError('Unable to delete calendar entry', error);
  invalidateCalendarCache();
}

export function addEventToCalendar(event: AppEvent, status: 'going' | 'booked'): Promise<void>;
export function addEventToCalendar(event: Event, status: 'going' | 'booked'): Promise<void>;
export async function addEventToCalendar(eventInput: AppEvent | Event, status: 'going' | 'booked'): Promise<void> {
  const event = 'start_time' in eventInput ? toAppEvent(eventInput) : eventInput;
  const start = event.startTime ? new Date(event.startTime) : null;
  if (!start || !Number.isFinite(start.getTime())) throw new Error('This event has no valid start time.');
  const end = event.endTime ? new Date(event.endTime) : new Date(start.getTime() + 60 * 60 * 1000);
  if (!Number.isFinite(end.getTime()) || end < start) throw new Error('This event has an invalid end time.');

  const details: CalendarEventDetails = {
    venueName: event.venueName,
    address: event.address,
    imageUrl: event.imageUrl,
    ticketUrl: event.ticketUrl,
    sourceUrl: event.sourceUrl,
  };

  const { data: existing, error: lookupError } = await supabase
    .from('calendar_entries')
    .select('id')
    .eq('source_event_id', event.id)
    .eq('kind', 'booking')
    .maybeSingle();
  if (lookupError) throw mapSupabaseError('Unable to check calendar event', lookupError);

  if (existing) {
    const { error } = await supabase
      .from('calendar_entries')
      .update({ status })
      .eq('id', existing.id);
    if (error) throw mapSupabaseError('Unable to update calendar event', error);
    invalidateCalendarCache();
    return;
  }

  const { error: insertError } = await supabase.from('calendar_entries').insert({
    title: event.title,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    all_day: event.timeKnown === false,
    kind: 'booking',
    status,
    source_event_id: event.id,
    event: details,
  });

  if (insertError && insertError.code !== '23505') {
    throw mapSupabaseError('Unable to add event to calendar', insertError);
  }
  invalidateCalendarCache();
}

export async function removeEventFromCalendar(sourceEventId: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_entries')
    .delete()
    .eq('kind', 'booking')
    .eq('source_event_id', sourceEventId);
  if (error) throw mapSupabaseError('Unable to remove event from calendar', error);
  invalidateCalendarCache();
}

export function clearCalendarState(): void {
  invalidateCalendarCache();
}