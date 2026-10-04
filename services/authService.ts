import { supabase } from '../lib/supabase';

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Unable to log out: ${error.message}`);
  }
}
