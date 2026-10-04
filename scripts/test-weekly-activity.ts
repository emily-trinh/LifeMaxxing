import { testEvents, testPreferences } from './weeklyActivityData';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY before running this test.');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/generate-weekly-activity`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${supabaseAnonKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: testPreferences, events: testEvents }),
    });
    const result: unknown = await response.json();

    if (!response.ok) throw new Error(`Edge Function returned HTTP ${response.status}: ${JSON.stringify(result)}`);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Weekly activity test failed.');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();