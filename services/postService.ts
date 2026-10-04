import type { Post } from '../types';
import { mockPosts, mockUserPosts } from '../lib/mockData';

// The backend will replace this mock with Supabase; image uploads will move to Storage and use the public URL.
const posts: Post[] = [...mockPosts, ...mockUserPosts];

function newestFirst(items: Post[]): Post[] {
  return [...items].sort((first, second) => (
    new Date(second.created_at).getTime() - new Date(first.created_at).getTime()
  ));
}

export function getAllPosts(): Post[] {
  return newestFirst(posts);
}

export function getPostsByUser(userId: string): Post[] {
  return newestFirst(posts.filter((post) => post.user_id === userId));
}

export async function createPost({
  userId,
  eventId,
  mediaUri,
  caption,
}: {
  userId: string;
  eventId: string;
  mediaUri: string;
  caption: string;
}): Promise<Post> {
  const post: Post = {
    id: `post-${Date.now()}`,
    user_id: userId,
    event_id: eventId,
    media_url: mediaUri,
    media_type: 'image',
    caption,
    created_at: new Date().toISOString(),
  };
  posts.unshift(post);
  return post;
}