import { mockPosts } from '../lib/mockData';
import type { Post } from '../types';

export async function getFeed(): Promise<Post[]> {
  // TODO: Fetch the social feed from Supabase.
  return mockPosts;
}

export async function createPost(input: Omit<Post, 'id' | 'created_at'>): Promise<Post> {
  // TODO: Upload media to Storage and insert the post in Supabase.
  return { ...input, id: `post-${Date.now()}`, created_at: new Date().toISOString() };
}