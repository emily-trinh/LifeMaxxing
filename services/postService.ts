import { supabase } from '../lib/supabase';
import type { Post } from '../types';

const postColumns = 'id, user_id, event_id, media_url, media_type, caption, created_at';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAllPosts(): Promise<Post[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(`Unable to get the signed-in user: ${userError.message}`);
  if (!userData.user) throw new Error('No signed-in user is available.');

  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userData.user.id);

  if (friendshipsError) throw new Error(`Unable to load your friends: ${friendshipsError.message}`);

  const userIds = [
    userData.user.id,
    ...(friendships ?? []).map(({ friend_id }) => friend_id),
  ];
  const { data, error } = await supabase
    .from('posts')
    .select(postColumns)
    .in('user_id', userIds)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Unable to load posts: ${error.message}`);
  return data as Post[];
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(postColumns)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Unable to load your posts: ${error.message}`);
  return data as Post[];
}

export async function createPost({
  userId,
  eventId,
  mediaUri,
  mediaBase64,
  caption,
}: {
  userId: string;
  eventId: string;
  mediaUri: string;
  mediaBase64: string | null;
  caption: string;
}): Promise<Post> {
  const filePath = `${userId}/${Date.now()}.jpg`;
  let image: ArrayBuffer;
  if (mediaBase64) {
    const binary = globalThis.atob(mediaBase64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    image = bytes.buffer;
  } else {
    const response = await fetch(mediaUri);
    if (!response.ok) throw new Error('Unable to read the selected image.');
    image = await response.arrayBuffer();
  }

  const { error: uploadError } = await supabase.storage
    .from('posts')
    .upload(filePath, image, { contentType: 'image/jpeg', upsert: false });
  if (uploadError) throw new Error(`Unable to upload your image: ${uploadError.message}`);

  const { data: publicUrl } = supabase.storage.from('posts').getPublicUrl(filePath);
  const databaseEventId = uuidPattern.test(eventId) ? eventId : null;
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      event_id: databaseEventId,
      media_url: publicUrl.publicUrl,
      media_type: 'image',
      caption,
    })
    .select(postColumns)
    .single();

  if (error) throw new Error(`Unable to save your post: ${error.message}`);
  return data as Post;
}
