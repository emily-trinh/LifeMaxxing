import type { Event, WeeklyPrompt } from '../types';

export async function generateWeeklyPrompt(): Promise<WeeklyPrompt> {
  throw new Error('TODO: Connect Gemini prompt generation.');
}

export async function recommendEvent(_prompt: WeeklyPrompt): Promise<Event | null> {
  throw new Error('TODO: Connect Gemini event ranking.');
}