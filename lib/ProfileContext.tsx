import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { currentUser } from './mockData';
import type { Profile } from '../types';

type ProfileContextValue = {
  profile: Profile;
  updateProfile: (patch: Partial<Profile>) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

// The backend will persist profile updates later.
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(currentUser);
  const value = useMemo(() => ({
    profile,
    updateProfile: (patch: Partial<Profile>) => setProfile((current) => ({ ...current, ...patch })),
  }), [profile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
}