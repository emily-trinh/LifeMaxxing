import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  current_streak: number | null;
  last_completed_week: string | null;
};

type PreferencesRow = {
  preference_id: string;
  interests: string[] | null;
  radius_km: number | null;
  min_price: number | null;
  max_price: number | null;
  group_pref: Profile['preferences']['group_mode'] | null;
};

export async function getFriends(userId: string): Promise<Profile[]> {
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId);

  if (friendshipsError) {
    throw new Error(`Unable to load your friends: ${friendshipsError.message}`);
  }

  const friendIds = (friendships ?? []).map(({ friend_id }) => friend_id);
  if (friendIds.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, current_streak, last_completed_week')
    .in('id', friendIds);

  if (profilesError) {
    throw new Error(`Unable to load your friends: ${profilesError.message}`);
  }

  return (profiles as ProfileRow[]).map((friend) => ({
    id: friend.id,
    username: friend.username ?? 'User',
    avatar_url: friend.avatar_url,
    current_streak: friend.current_streak ?? 0,
    last_completed_week: friend.last_completed_week,
    preferences: {
      interests: [],
      radius_km: 10,
      min_price: 0,
      max_price: 50,
      group_mode: 'either',
    },
  }));
}

export async function getProfile(): Promise<Profile> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(`Unable to get the signed-in user: ${userError.message}`);
  if (!userData.user) throw new Error('No signed-in user is available.');

  const [{ data: profile, error: profileError }, { data: preferences, error: preferencesError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, avatar_url, current_streak, last_completed_week')
      .eq('id', userData.user.id)
      .single<ProfileRow>(),
    supabase
      .from('preferences')
      .select('preference_id, interests, radius_km, min_price, max_price, group_pref')
      .eq('preference_id', userData.user.id)
      .maybeSingle<PreferencesRow>(),
  ]);

  if (profileError) throw new Error(`Unable to load your profile: ${profileError.message}`);
  if (preferencesError) throw new Error(`Unable to load your preferences: ${preferencesError.message}`);
  if (!profile) throw new Error('Your profile has not been created yet.');

  return {
    id: profile.id,
    username: profile.username ?? userData.user.email?.split('@')[0] ?? 'User',
    avatar_url: profile.avatar_url,
    current_streak: profile.current_streak ?? 0,
    last_completed_week: profile.last_completed_week,
    preferences: {
      interests: preferences?.interests ?? [],
      radius_km: preferences?.radius_km ?? 10,
      min_price: preferences?.min_price ?? 0,
      max_price: preferences?.max_price ?? 50,
      group_mode: preferences?.group_pref ?? 'either',
    },
  };
}

export async function getProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, current_streak, last_completed_week')
    .eq('id', userId)
    .maybeSingle<ProfileRow>();

  if (error) throw new Error(`Unable to load the post author: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    username: data.username ?? 'User',
    avatar_url: data.avatar_url,
    current_streak: data.current_streak ?? 0,
    last_completed_week: data.last_completed_week,
    preferences: {
      interests: [],
      radius_km: 10,
      min_price: 0,
      max_price: 50,
      group_mode: 'either',
    },
  };
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(`Unable to get the signed-in user: ${userError.message}`);
  if (!userData.user) throw new Error('No signed-in user is available.');

  const { preferences, ...profileUpdates } = updates;
  if (Object.keys(profileUpdates).length > 0) {
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userData.user.id)
      .select('id')
      .single();
    if (error) throw new Error(`Unable to update your profile: ${error.message}`);
    if (!updatedProfile) throw new Error('Unable to update your profile: no profile row was changed.');
  }

  if (preferences) {
    const { error } = await supabase.from('preferences').upsert({
      preference_id: userData.user.id,
      interests: preferences.interests,
      radius_km: preferences.radius_km,
      min_price: preferences.min_price,
      max_price: preferences.max_price,
      group_pref: preferences.group_mode,
    }, { onConflict: 'preference_id' });
    if (error) throw new Error(`Unable to update your preferences: ${error.message}`);
  }

  return getProfile();
}