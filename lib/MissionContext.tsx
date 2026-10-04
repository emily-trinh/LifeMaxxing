import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getEvent, mockEvents, mockWeeklyPrompt } from './mockData';
import type { Event } from '../types';

type MissionContextValue = {
  activeEventId: string;
  activeEvent: Event;
  setActiveEventId: (id: string) => void;
  isSwapped: boolean;
};

const initialEventId = mockWeeklyPrompt.event_id ?? mockEvents[0].id;
const MissionContext = createContext<MissionContextValue | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [activeEventId, setActiveEventId] = useState(initialEventId);
  const activeEvent = getEvent(activeEventId) ?? mockEvents[0];
  const value = useMemo(
    () => ({
      activeEventId,
      activeEvent,
      setActiveEventId,
      isSwapped: activeEventId !== mockWeeklyPrompt.event_id,
    }),
    [activeEventId, activeEvent],
  );

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission(): MissionContextValue {
  const context = useContext(MissionContext);
  if (!context) throw new Error('useMission must be used within MissionProvider');
  return context;
}
