import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { colors, spacing } from '../constants/theme';
import { generateWeeklyActivity } from '../services/gemini';
import type { CandidateEvent, EventRecommendation, UserPreferences } from '../types/recommendation';

const preferences: UserPreferences = {
  interests: ['art', 'fitness', 'outdoors'],
  likes: ['creative activities', 'group activities'],
  dislikes: ['running'],
  radiusKm: 10,
  minPrice: 0,
  maxPrice: 30,
  groupMode: 'group',
};

const events: CandidateEvent[] = [
  { id: 'test-1', title: 'Sunset Beach Volleyball', description: 'A casual group game for beginners.', category: 'fitness', price: 0, isFree: true, distanceKm: 3.2, groupMode: 'group' },
  { id: 'test-2', title: 'Beginner Pottery Workshop', description: 'Make a small planter while meeting other first-timers.', category: 'art', price: 24, isFree: false, distanceKm: 5.1, groupMode: 'group' },
  { id: 'test-3', title: 'Riverfront 5K Run', description: 'A timed community running event.', category: 'running', price: 10, isFree: false, distanceKm: 2.8, groupMode: 'group' },
  { id: 'test-4', title: 'Chef\'s Tasting Menu', description: 'A six-course dinner in a private dining room.', category: 'food', price: 95, isFree: false, distanceKm: 4.6, groupMode: 'group' },
  { id: 'test-5', title: 'Quiet Gallery Walk', description: 'A self-guided afternoon viewing local art.', category: 'art', price: 0, isFree: true, distanceKm: 1.9, groupMode: 'solo' },
];

export default function AiTestScreen() {
  const [result, setResult] = useState<EventRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleTest() {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await generateWeeklyActivity(preferences, events);
      console.log('generateWeeklyActivity result:', response);
      setResult(response);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unknown request error.';
      console.error('generateWeeklyActivity error:', requestError);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>AI Integration Test</Text>
      <Text style={styles.description}>Tests the deployed weekly activity Edge Function with five local events.</Text>
      <Button onPress={handleTest}>{isLoading ? 'Testing...' : 'Test Weekly Activity'}</Button>
      {isLoading && <Text style={styles.status}>Loading recommendation...</Text>}
      {result && <View style={styles.result}><Text style={styles.label}>Event ID</Text><Text style={styles.value}>{result.eventId ?? 'No matching event'}</Text><Text style={styles.label}>Reason</Text><Text style={styles.value}>{result.reason}</Text></View>}
      {error && <View style={styles.error}><Text style={styles.label}>Error</Text><Text style={styles.errorText}>{error}</Text></View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800' },
  description: { color: colors.mutedText, fontSize: 16, lineHeight: 23 },
  status: { color: colors.mutedText },
  result: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  label: { color: colors.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  value: { color: colors.text, fontSize: 16 },
  error: { backgroundColor: '#FDECEC', borderColor: colors.danger, borderRadius: 12, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  errorText: { color: colors.danger, fontSize: 16 },
});