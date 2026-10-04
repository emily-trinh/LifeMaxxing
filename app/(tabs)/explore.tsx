import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../../components/Chip';
import { EventCard } from '../../components/EventCard';
import { colors, spacing, type } from '../../constants/theme';
import { categoryEmoji, distanceKm } from '../../lib/format';
import { getEvents } from '../../services/events';
import type { Event } from '../../types';
import { useProfile } from '../../lib/ProfileContext';
import { useMission } from '../../lib/MissionContext';

export default function ExploreScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [events, setEvents] = useState<Event[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { profile } = useProfile();
  const { simulatedDate } = useMission();
  useEffect(() => {
    let mounted = true;
    const fromDate = new Date(simulatedDate);
    fromDate.setHours(0, 0, 0, 0);
    setLoadError(null);
    void getEvents(fromDate)
      .then((loadedEvents) => {
        if (mounted) setEvents(loadedEvents);
      })
      .catch((error: unknown) => {
        if (mounted) setLoadError(error instanceof Error ? error.message : 'Unable to load events.');
      });
    return () => { mounted = false; };
  }, [simulatedDate]);

  const categories = useMemo(() => Array.from(new Set(events.map((event) => event.category))), [events]);
  const filters = [
    { value: 'All', label: 'All' },
    { value: 'Free', label: 'Free' },
    { value: 'Paid', label: 'Paid' },
    ...categories.map((category) => ({
      value: category,
      label: `${categoryEmoji[category] ? `${categoryEmoji[category]} ` : ''}${category}`,
    })),
  ];
  const visibleEvents = events
    .filter((event) => distanceKm(event.latitude, event.longitude) <= profile.preferences.radius_km)
    .filter((event) => {
      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Free') return event.is_free;
      if (selectedFilter === 'Paid') return !event.is_free;
      return event.category === selectedFilter;
    })
    .sort((first, second) => new Date(first.start_time).getTime() - new Date(second.start_time).getTime());

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={visibleEvents}
        keyExtractor={(event) => event.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.id } })}
          />
        )}
        ListHeaderComponent={(
          <View>
            <View style={styles.headingBlock}>
              <Text style={styles.heading}>Explore</Text>
              <Text style={styles.subtitle}>things happening near you</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {filters.map(({ value, label }) => (
                <Chip key={value} label={label} selected={selectedFilter === value} onPress={() => setSelectedFilter(value)} />
              ))}
            </ScrollView>
          </View>
        )}
        ListEmptyComponent={loadError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{loadError}</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events nearby. Maybe start your own?</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  listContent: { flexGrow: 1, paddingBottom: spacing.xl },
  headingBlock: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  heading: { ...type.title },
  subtitle: { ...type.label, color: colors.muted, marginTop: spacing.xs },
  filters: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  emptyText: { ...type.body, color: colors.muted, textAlign: 'center' },
});