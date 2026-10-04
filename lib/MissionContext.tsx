import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useProfile } from './ProfileContext';
import { generateWeeklyActivity } from '../services/gemini';
import { getEvent, getEvents } from '../services/events';
import { getPostsByUser } from '../services/postService';
import type { Event } from '../types';
import type { CandidateEvent, EventRecommendation, UserPreferences } from '../types/recommendation';

type MissionContextValue = {
  activeEventId: string;
  activeEvent: Event;
  recommendation: EventRecommendation | null;
  recommendationLoading: boolean;
  recommendationError: string | null;
  setActiveEventId: (id: string) => void;
  refreshMission: () => Promise<void>;
  chooseFreeEvent: () => void;
  isCompleted: boolean;
  completeMission: (eventId?: string, completedAt?: string) => Promise<void>;
  simulatedDate: Date;
  setSimulatedDate: (date: Date) => void;
  isSwapped: boolean;
};

const MissionContext = createContext<MissionContextValue | null>(null);
let simulatedDateOverride: Date | null = null;

export function MissionProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useProfile();
  const [activeEventId, setActiveEventId] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [recommendation, setRecommendation] = useState<EventRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [completedEventId, setCompletedEventId] = useState<string | null>(null);
  const [simulatedDate, setSimulatedDateState] = useState(() => simulatedDateOverride ?? new Date());
  const [missionDate, setMissionDate] = useState(() => simulatedDateOverride ?? new Date());
  const recommendationRequestRef = useRef(0);
  const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0];
  const setSimulatedDate = useCallback((date: Date) => {
    const nextDate = new Date(date);
    if (!Number.isFinite(nextDate.getTime())) throw new Error('The simulated date is invalid.');
    const previousWeek = getWeekKey(simulatedDateOverride ?? new Date());
    simulatedDateOverride = nextDate;
    setSimulatedDateState(nextDate);
    if (getWeekKey(nextDate) !== previousWeek) setMissionDate(nextDate);
  }, []);
  function getWeekStart(date: Date): Date {
    const weekStart = new Date(date);
    weekStart.setHours(0, 0, 0, 0);
    const daysSinceMonday = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - daysSinceMonday);
    return weekStart;
  }

  function getWeekEnd(date: Date): Date {
    const weekEnd = getWeekStart(date);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return weekEnd;
  }

  function getDayStart(date: Date): Date {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    return dayStart;
  }

  function getWeekKey(date: Date): string {
    return getWeekStart(date).toISOString().slice(0, 10);
  }

  function weeksBetween(earlierWeek: string, laterWeek: string): number {
    const earlier = Date.parse(`${earlierWeek}T00:00:00Z`);
    const later = Date.parse(`${laterWeek}T00:00:00Z`);
    return Math.round((later - earlier) / (7 * 24 * 60 * 60 * 1000));
  }

  const requestRecommendation = useCallback(async () => {
    const requestId = ++recommendationRequestRef.current;
    const isCurrent = () => requestId === recommendationRequestRef.current;
    setRecommendationLoading(true);
    setRecommendationError(null);

    const preferences: UserPreferences = {
      interests: profile.preferences.interests,
      likes: profile.preferences.interests,
      dislikes: [],
      radiusKm: profile.preferences.radius_km,
      minPrice: profile.preferences.min_price,
      maxPrice: profile.preferences.max_price,
      groupMode: profile.preferences.group_mode,
    };
    const currentDayStart = getDayStart(missionDate);
    const currentWeekStart = getWeekStart(missionDate);
    const currentWeekEnd = getWeekEnd(missionDate);
    const recentPosts = await getPostsByUser(profile.id);
    if (!isCurrent()) return;
    const availableEvents = await getEvents(currentDayStart, currentWeekEnd);
    if (!isCurrent()) return;
    const currentWeekKey = getWeekKey(missionDate);
    const weeksSinceCompletion = profile.last_completed_week
      ? weeksBetween(profile.last_completed_week, currentWeekKey)
      : null;
    const hasCompletedPost = recentPosts.some((post) => post.event_id);
    if (!hasCompletedPost && (profile.current_streak !== 0 || profile.last_completed_week !== null)) {
      void updateProfile({
        current_streak: 0,
        last_completed_week: null,
      }).catch((error: unknown) => {
        console.error('Unable to clear streak without a completed post:', error);
      });
    } else if (weeksSinceCompletion !== null && weeksSinceCompletion > 1 && profile.current_streak !== 0) {
      void updateProfile({ current_streak: 0 }).catch((error: unknown) => {
        console.error('Unable to persist missed-week streak reset:', error);
      });
    }
    const completedPost = recentPosts.find((post) => (
      post.event_id
      && availableEvents.some((event) => (
        event.id === post.event_id
        && (new Date(post.created_at) >= currentWeekStart && new Date(post.created_at) < currentWeekEnd
          || (event.start_time !== null && event.start_time >= currentWeekStart.toISOString()))
      ))
    ));
    if (completedPost?.event_id) {
      const completedEvent = await getEvent(completedPost.event_id);
      if (!isCurrent()) return;
      if (!completedEvent) throw new Error('The completed mission event could not be found.');
      setEvents([completedEvent, ...availableEvents.filter((event) => event.id !== completedEvent.id)]);
      setActiveEventId(completedPost.event_id);
      setCompletedEventId(completedPost.event_id);
      setRecommendation({
        eventId: completedPost.event_id,
        reason: 'You completed this week\'s mission.',
      });
      setRecommendationLoading(false);
      return;
    }
    if (!availableEvents.length) throw new Error('No events are available for this week.');
    setEvents(availableEvents);
    setActiveEventId((currentId) => currentId && availableEvents.some((event) => event.id === currentId) ? currentId : availableEvents[0].id);
    setCompletedEventId(null);
    const candidates: CandidateEvent[] = availableEvents.map((event) => ({
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

    try {
      const result = await generateWeeklyActivity(preferences, candidates);
      if (!isCurrent()) return;
      const eligible = candidates.filter((candidate) => (
        candidate.price >= preferences.minPrice
        && candidate.price <= preferences.maxPrice
        && (preferences.groupMode === 'either' || !candidate.groupMode || candidate.groupMode === preferences.groupMode)
        && !preferences.dislikes.some((dislike) => (
          candidate.title.toLowerCase().includes(dislike.toLowerCase())
          || candidate.description?.toLowerCase().includes(dislike.toLowerCase())
          || candidate.category.toLowerCase().includes(dislike.toLowerCase())
        ))
      ));
      const selectedEventId = result.eventId ?? eligible.find((candidate) => candidate.id !== activeEventId)?.id ?? eligible[0]?.id ?? null;
      const recommendationResult = selectedEventId
        ? { eventId: selectedEventId, reason: result.eventId ? result.reason : 'This activity matches your preferences.' }
        : result;
      setRecommendation(recommendationResult);
      if (selectedEventId) setActiveEventId(selectedEventId);
    } catch (error: unknown) {
      if (isCurrent()) {
        setRecommendationError(error instanceof Error ? error.message : 'Could not load a weekly activity.');
      }
    } finally {
      if (isCurrent()) setRecommendationLoading(false);
    }
  }, [profile, missionDate, updateProfile]);

  useEffect(() => {
    void requestRecommendation();
  }, [requestRecommendation]);

  const refreshMission = async () => {
    setCompletedEventId(null);
    await requestRecommendation();
  };
  const chooseFreeEvent = () => {
    const freeAlternatives = events.filter((event) => event.is_free && event.id !== activeEventId);
    const nextEvent = freeAlternatives[0];
    if (!nextEvent) return;
    setCompletedEventId(null);
    setActiveEventId(nextEvent.id);
    setRecommendation({
      eventId: nextEvent.id,
      reason: 'Here is a free activity you may enjoy this week.',
    });
  };
  const completeMission = async (eventId = activeEventId, completedAt?: string) => {
    setActiveEventId(eventId);
    setCompletedEventId(eventId);
    const completedWeek = getWeekKey(missionDate);
    const weeksSinceCompletion = profile.last_completed_week
      ? weeksBetween(profile.last_completed_week, completedWeek)
      : null;
    const streak = weeksSinceCompletion === 0
      ? profile.current_streak
      : weeksSinceCompletion === 1
        ? profile.current_streak + 1
        : 1;
    await updateProfile({
      current_streak: streak,
      last_completed_week: completedWeek,
    });
  };
  const value = useMemo(
    () => ({
      activeEventId,
      activeEvent: activeEvent as Event,
      recommendation,
      recommendationLoading,
      recommendationError,
      setActiveEventId,
      refreshMission,
      chooseFreeEvent,
      isCompleted: completedEventId === activeEventId,
      completeMission,
      simulatedDate,
      setSimulatedDate,
      isSwapped: false,
    }),
    [activeEventId, activeEvent, completedEventId, recommendation, recommendationLoading, recommendationError, refreshMission, chooseFreeEvent, completeMission, simulatedDate, missionDate],
  );

  if (!activeEvent && recommendationLoading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }
  if (!activeEvent && recommendationError) {
    return <View style={styles.center}><Text style={styles.error}>{recommendationError}</Text></View>;
  }

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission(): MissionContextValue {
  const context = useContext(MissionContext);
  if (!context) throw new Error('useMission must be used within MissionProvider');
  return context;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: '#8B2E2E', textAlign: 'center' },
});
