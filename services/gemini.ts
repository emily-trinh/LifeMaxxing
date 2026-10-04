import { supabase } from '../lib/supabase';
import type { CandidateEvent, EventRecommendation, UserPreferences } from '../types/recommendation';

export async function generateWeeklyActivity(
  preferences: UserPreferences,
  events: CandidateEvent[],
): Promise<EventRecommendation> {
  const { data, error } = await supabase.functions.invoke<EventRecommendation>('generate-weekly-activity', {
    body: { preferences, events },
  });

  if (error) throw new Error(`Weekly activity generation failed: ${error.message}`);
  if (!data || typeof data.reason !== 'string' || (typeof data.eventId !== 'string' && data.eventId !== null)) {
    throw new Error('Weekly activity generation returned an invalid response.');
  }

  return data;
}