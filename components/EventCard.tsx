import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors, radius, spacing, type } from '../constants/theme';
import { categoryEmoji } from '../lib/format';
import type { Event } from '../types';

interface EventCardProps { event: Event; onPress?: () => void; }

export function EventCard({ event, onPress }: EventCardProps) {
  const { width } = useWindowDimensions();
  const emoji = categoryEmoji[event.category];

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {event.image_url ? <Image source={{ uri: event.image_url }} style={[styles.image, { width, height: width * 0.75 }]} resizeMode="cover" /> : null}
      <View style={styles.content}>
        <Text style={styles.category}>{emoji ? `${emoji} ` : ''}{event.category}</Text>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.detail}>{event.is_free ? 'Free' : `$${event.price}`} · {event.address}</Text>
      </View>
      <View style={styles.divider} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  image: { borderRadius: radius.sm },
  content: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  category: { ...type.label, color: colors.muted },
  title: { ...type.heading, marginTop: spacing.xs },
  detail: { ...type.body, color: colors.muted, marginTop: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border },
});