import { mockProfiles } from '../lib/mockData';
import type { Profile } from '../types';

export async function getProfile(): Promise<Profile> {
  // TODO: Read the authenticated user's profile from Supabase.
  return mockProfiles[0];
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  // TODO: Update the authenticated user's profile in Supabase.
  return { ...mockProfiles[0], ...updates };
}