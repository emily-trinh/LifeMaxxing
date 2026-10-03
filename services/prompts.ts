import { mockWeeklyPrompt } from '../lib/mockData';
import type { WeeklyPrompt } from '../types';

export async function getWeeklyPrompt(): Promise<WeeklyPrompt> {
  // TODO: Fetch the current prompt from Supabase or Gemini-generated content.
  return mockWeeklyPrompt;
}