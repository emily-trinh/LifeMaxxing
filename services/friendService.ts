import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

export { getFriends } from './profile';

type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  current_streak: number | null;
  last_completed_week: string | null;
};

const defaultPreferences: Profile['preferences'] = {
  interests: [],
  radius_km: 10,
  min_price: 0,
  max_price: 50,
  group_mode: 'either',
};

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username ?? 'User',
    avatar_url: row.avatar_url,
    current_streak: row.current_streak ?? 0,
    last_completed_week: row.last_completed_week,
    preferences: { ...defaultPreferences },
  };
}

export async function getSuggestions(userId: string, query = ''): Promise<Profile[]> {
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId);

  if (friendshipsError) {
    throw new Error(`Unable to load friend suggestions: ${friendshipsError.message}`);
  }

  const excluded = [userId, ...((friendships ?? []).map(({ friend_id }) => friend_id))];
  const trimmedQuery = query.trim().replace(/[%_,]/g, '').trim();

  let request = supabase
    .from('profiles')
    .select('id, username, avatar_url, current_streak, last_completed_week')
    .not('id', 'in', `(${excluded.join(',')})`)
    .order('username', { ascending: true })
    .limit(30);

  if (trimmedQuery) {
    request = request.ilike('username', `%${trimmedQuery}%`);
  }

  const { data: profiles, error: profilesError } = await request;

  if (profilesError) {
    throw new Error(`Unable to load friend suggestions: ${profilesError.message}`);
  }

  return (profiles as ProfileRow[] | null ?? []).map(toProfile);
}

export async function addFriend(userId: string, friendId: string): Promise<void> {
  if (userId === friendId) {
    return;
  }

  const { error } = await supabase.rpc('add_friend', { friend: friendId });

  if (error) {
    throw new Error(`Unable to add friend: ${error.message}`);
  }
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_friend', { friend: friendId });

  if (error) {
    throw new Error(`Unable to remove friend: ${error.message}`);
  }
}
