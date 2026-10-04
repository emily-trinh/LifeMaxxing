import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getFriends, getProfile, updateProfile as persistProfile } from '../services/profile';
import type { Profile } from '../types';

type ProfileContextValue = {
  profile: Profile;
  friends: Profile[];
  friendsError: string | null;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [friendsError, setFriendsError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfile(null);
      setFriends([]);
      setError(null);
      setFriendsError(null);
      return;
    }

    let mounted = true;
    setProfile(null);
    setFriends([]);
    setError(null);
    setFriendsError(null);
    void getProfile()
      .then((loadedProfile) => {
        if (mounted) setProfile(loadedProfile);
      })
      .catch((loadError: unknown) => {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load your profile.');
      });
    void getFriends(user.id)
      .then((loadedFriends) => {
        if (mounted) setFriends(loadedFriends);
      })
      .catch((loadError: unknown) => {
        if (mounted) setFriendsError(loadError instanceof Error ? loadError.message : 'Unable to load your friends.');
      });

    return () => {
      mounted = false;
    };
  }, [authLoading, user]);

  const value = useMemo(() => ({
    profile: profile as Profile,
    friends,
    friendsError,
    updateProfile: async (patch: Partial<Profile>) => {
      const savedProfile = await persistProfile(patch);
      setProfile(savedProfile);
    },
  }), [friends, friendsError, profile]);

  if (!user) {
    return <>{children}</>;
  }
  if (authLoading || (!profile && !error)) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: '#8B2E2E', textAlign: 'center' },
});