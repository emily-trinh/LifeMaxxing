import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../../components/Chip';
import { EventCard } from '../../components/EventCard';
import { colors, spacing, type } from '../../constants/theme';
import { categoryEmoji, distanceKm } from '../../lib/format';
import { mockEvents } from '../../lib/mockData';
import { useProfile } from '../../lib/ProfileContext';

export default function ExploreScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { profile } = useProfile();
  const categories = Array.from(new Set(mockEvents.map((event) => event.category)));
  const filters = [
    { value: 'All', label: 'All' },
    { value: 'Free', label: 'Free' },
    { value: 'Paid', label: 'Paid' },
    ...categories.map((category) => ({
      value: category,
      label: `${categoryEmoji[category] ? `${categoryEmoji[category]} ` : ''}${category}`,
    })),
  ];
  const events = mockEvents
    .filter((event) => distanceKm(event.latitude, event.longitude) <= profile.radius_km)
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
        data={events}
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
        ListEmptyComponent={(
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