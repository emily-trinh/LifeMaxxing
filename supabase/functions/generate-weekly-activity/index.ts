import { GoogleGenAI } from 'npm:@google/genai';
import type { CandidateEvent, EventRecommendation, UserPreferences } from '../../../types/recommendation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
const defaultModel = 'gemini-3.5-flash-lite';
const noMatchReason = 'No available event is a strong match for this week\'s preferences.';

const recommendationSchema = (eventIds: string[]) => ({
  type: 'object',
  properties: {
    eventId: { type: ['string', 'null'], enum: [null, ...eventIds] },
    reason: { type: 'string' },
  },
  required: ['eventId', 'reason'],
  additionalProperties: false,
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function isPreferences(value: unknown): value is UserPreferences {
  if (!value || typeof value !== 'object') return false;
  const preferences = value as Record<string, unknown>;
  const isStringArray = (items: unknown) => Array.isArray(items) && items.every((item) => typeof item === 'string');
  return isStringArray(preferences.interests)
    && isStringArray(preferences.likes)
    && isStringArray(preferences.dislikes)
    && typeof preferences.radiusKm === 'number'
    && Number.isFinite(preferences.radiusKm)
    && typeof preferences.minPrice === 'number'
    && Number.isFinite(preferences.minPrice)
    && typeof preferences.maxPrice === 'number'
    && Number.isFinite(preferences.maxPrice)
    && preferences.minPrice <= preferences.maxPrice
    && ['solo', 'group', 'either'].includes(preferences.groupMode as string);
}

function isCandidateEvent(value: unknown): value is CandidateEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Record<string, unknown>;
  return typeof event.id === 'string'
    && typeof event.title === 'string'
    && (event.description === undefined || typeof event.description === 'string')
    && typeof event.category === 'string'
    && typeof event.price === 'number'
    && Number.isFinite(event.price)
    && typeof event.isFree === 'boolean'
    && typeof event.distanceKm === 'number'
    && Number.isFinite(event.distanceKm)
    && (event.groupMode === undefined || ['solo', 'group', 'either'].includes(event.groupMode as string));
}

function isRecommendation(value: unknown): value is EventRecommendation {
  if (!value || typeof value !== 'object') return false;
  const result = value as Record<string, unknown>;
  return (typeof result.eventId === 'string' || result.eventId === null)
    && typeof result.reason === 'string'
    && result.reason.length > 0;
}

function buildPrompt(preferences: UserPreferences, events: CandidateEvent[]) {
  return [
    'Select the single best available event to become this user\'s personalized weekly activity.',
    'The selected event is the weekly prompt. Do not create a separate challenge or generic prompt.',
    'Use the user\'s explicit dislikes as exclusion constraints and prioritize them over weaker positive matches.',
    'Treat radiusKm, minPrice, and maxPrice as hard constraints. Consider interests, likes, group preference, category, description, distance, and general suitability.',
    'You must select only one event ID from the supplied candidates, or null if no event is a strong match.',
    'Never invent or modify an event ID, name, price, location, date, time, availability, or other event fact.',
    `If no event is a strong match, return eventId null and exactly this reason: ${noMatchReason}`,
    'Write the reason directly to the person in a warm, welcoming, natural tone.',
    'Use "you" and "your" when helpful. Do not say "the user", "the user\'s", "the customer", or refer to preferences as constraints, criteria, limits, or requirements.',
    'Do not mention internal matching logic, the selection process, or technical terms such as "maximum price constraint".',
    'Mention one or two specific positive details from the event and preferences, such as the activity, shared interests, welcoming group setting, or comfortable price.',
    'Return only JSON matching the provided schema. Keep reason to one friendly sentence.',
    `User preferences:\n${JSON.stringify(preferences)}`,
    `Available events:\n${JSON.stringify(events)}`,
  ].join('\n\n');
}

async function handleRequest(request: Request) {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Only POST requests are supported.' }, 405);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Request body must contain valid JSON.' }, 400);
  }

  if (!body || typeof body !== 'object') return jsonResponse({ error: 'Request body must be a JSON object.' }, 400);
  const input = body as Record<string, unknown>;
  if (!isPreferences(input.preferences)) return jsonResponse({ error: 'Missing or invalid preferences.' }, 400);
  if (!Array.isArray(input.events) || !input.events.every(isCandidateEvent)) return jsonResponse({ error: 'Missing or invalid events.' }, 400);

  const events = input.events as CandidateEvent[];
  if (events.length === 0) return jsonResponse({ eventId: null, reason: noMatchReason });

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return jsonResponse({ error: 'GEMINI_API_KEY is not configured.' }, 500);

  const eventIds = events.map((event) => event.id);
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: Deno.env.get('GEMINI_MODEL') ?? defaultModel,
      contents: buildPrompt(input.preferences, events),
      config: { responseMimeType: 'application/json', responseSchema: recommendationSchema(eventIds) },
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(response.text ?? '');
    } catch {
      return jsonResponse({ error: 'Gemini returned invalid JSON.' }, 502);
    }

    if (!isRecommendation(parsed)) return jsonResponse({ error: 'Gemini returned an invalid weekly activity.' }, 502);
    if (parsed.eventId !== null && !eventIds.includes(parsed.eventId)) return jsonResponse({ error: 'Gemini selected an event outside the supplied candidates.' }, 502);
    return jsonResponse(parsed.eventId === null ? { eventId: null, reason: noMatchReason } : parsed);
  } catch (error) {
    console.error('Gemini weekly activity generation failed:', error);
    return jsonResponse({ error: 'Gemini weekly activity request failed.' }, 502);
  }
}

Deno.serve(handleRequest);