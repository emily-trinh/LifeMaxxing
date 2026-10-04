import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getEvent, mockEvents, mockWeeklyPrompt } from './mockData';
import { useProfile } from './ProfileContext';
import { generateWeeklyActivity } from '../services/gemini';
import type { Event } from '../types';
import type { CandidateEvent, EventRecommendation } from '../types/recommendation';

type MissionContextValue = {
  activeEventId: string;
  activeEvent: Event;
  recommendation: EventRecommendation | null;
  recommendationLoading: boolean;
  recommendationError: string | null;
  setActiveEventId: (id: string) => void;
  isSwapped: boolean;
};

const initialEventId = mockWeeklyPrompt.event_id ?? mockEvents[0].id;
const MissionContext = createContext<MissionContextValue | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const [activeEventId, setActiveEventId] = useState(initialEventId);
  const [recommendation, setRecommendation] = useState<EventRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const activeEvent = getEvent(activeEventId) ?? mockEvents[0];

  useEffect(() => {
    let isCurrent = true;
    setRecommendationLoading(true);
    setRecommendationError(null);

    const preferences = {
      interests: profile.preferences.interests,
      likes: profile.preferences.interests,
      dislikes: [],
      radiusKm: profile.preferences.radius_km,
      minPrice: profile.preferences.min_price,
      maxPrice: profile.preferences.max_price,
      groupMode: profile.preferences.group_mode,
    };
    const candidates: CandidateEvent[] = mockEvents.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      price: event.price,
      isFree: event.is_free,
      // Location-based filtering is not available until device location is added.
      distanceKm: 0,
      groupMode: event.is_group_activity ? 'group' : 'solo',
    }));

    void generateWeeklyActivity(preferences, candidates)
      .then((result) => {
        if (!isCurrent) return;
        setRecommendation(result);
        if (result.eventId) setActiveEventId(result.eventId);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setRecommendationError(error instanceof Error ? error.message : 'Could not load a weekly activity.');
      })
      .finally(() => {
        if (isCurrent) setRecommendationLoading(false);
      });

    return () => { isCurrent = false; };
  }, [profile.preferences]);

  const value = useMemo(
    () => ({
      activeEventId,
      activeEvent,
      recommendation,
      recommendationLoading,
      recommendationError,
      setActiveEventId,
      isSwapped: activeEventId !== mockWeeklyPrompt.event_id,
    }),
    [activeEventId, activeEvent, recommendation, recommendationLoading, recommendationError],
  );

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission(): MissionContextValue {
  const context = useContext(MissionContext);
  if (!context) throw new Error('useMission must be used within MissionProvider');
  return context;
}
