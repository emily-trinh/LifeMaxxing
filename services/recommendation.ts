import { GoogleGenAI } from '@google/genai';
import type { CandidateEvent, EventRecommendation, UserPreferences } from '../types/recommendation';

const defaultModel = 'gemini-3.5-flash-lite';

const recommendationSchema = (eventIds: string[]) => ({
  type: 'object',
  properties: {
    eventId: {
      type: ['string', 'null'],
      enum: [null, ...eventIds],
    },
    reason: { type: 'string' },
  },
  required: ['eventId', 'reason'],
  additionalProperties: false,
});

function isRecommendation(value: unknown): value is EventRecommendation {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (typeof candidate.eventId === 'string' || candidate.eventId === null) && typeof candidate.reason === 'string' && candidate.reason.length > 0;
}

export async function recommendEvent(preferences: UserPreferences, events: CandidateEvent[]): Promise<EventRecommendation> {
  if (events.length === 0) {
    return { eventId: null, reason: 'No candidate events were supplied.' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY. Set it before calling recommendEvent.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL ?? defaultModel;
  const eventIds = events.map((event) => event.id);
  const prompt = [
    'Choose the single best event for this user from the supplied candidates.',
    'You must select only one supplied event ID, or null if none is a reasonable match.',
    'Never invent or alter an event, ID, price, location, date, or other event fact.',
    'Treat radiusKm and maxPrice as hard limits. Consider interests, free versus paid, distance, group suitability, and overall fit.',
    'Return only JSON matching the provided schema. Keep reason to one concise sentence.',
    `User preferences:\n${JSON.stringify(preferences)}`,
    `Candidate events:\n${JSON.stringify(events)}`,
  ].join('\n\n');

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: recommendationSchema(eventIds),
    },
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(response.text ?? '');
  } catch {
    throw new Error('Gemini returned invalid JSON for the event recommendation.');
  }

  if (!isRecommendation(parsed)) {
    throw new Error('Gemini returned an invalid event recommendation shape.');
  }

  if (parsed.eventId !== null && !eventIds.includes(parsed.eventId)) {
    return { eventId: null, reason: 'Gemini returned an event outside the supplied candidates.' };
  }

  return parsed;
}