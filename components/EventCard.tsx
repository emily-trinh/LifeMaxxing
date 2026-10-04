import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Chip } from './Chip';
import { colors, fonts, radius, spacing, type } from '../constants/theme';
import { categoryEmoji, distanceKm, formatDistance, formatEventDate } from '../lib/format';
import type { Event } from '../types';

type EventCardProps = { event: Event; onPress: () => void };

export function EventCard({ event, onPress }: EventCardProps) {
  const { width } = useWindowDimensions();
  const emoji = categoryEmoji[event.category];
  const chips = [
    `${emoji ? `${emoji} ` : ''}${event.category}`,
    event.is_free ? 'Free' : `$${event.price}`,
    ...(event.is_outdoor ? ['Outdoor'] : []),
    event.is_group_activity ? 'Group' : 'Solo',
  ];

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {event.image_url ? (
        <Image source={{ uri: event.image_url }} style={[styles.image, { width, height: width * 0.75 }]} resizeMode="cover" />
      ) : null}
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>{formatEventDate(event.start_time)} · {formatDistance(distanceKm(event.latitude, event.longitude))}</Text>
        <View style={styles.chips}>
          {chips.map((chip) => <Chip key={chip} label={chip} />)}
        </View>
      </View>
      <View style={styles.divider} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  image: { borderRadius: radius.sm, backgroundColor: colors.surface },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 },
  meta: { ...type.label, color: colors.muted, marginTop: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
});