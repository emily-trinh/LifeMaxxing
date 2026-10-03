import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import type { Event } from '../types';

interface EventCardProps { event: Event; onPress?: () => void; }

export function EventCard({ event, onPress }: EventCardProps) {
  return <Pressable onPress={onPress} style={styles.card}>{event.image_url && <Image source={{ uri: event.image_url }} style={styles.image} />}<View style={styles.content}><Text style={styles.category}>{event.category}</Text><Text style={styles.title}>{event.title}</Text><Text style={styles.detail}>{event.is_free ? 'Free' : `$${event.price}`} · {event.address}</Text></View></Pressable>;
}

const styles = StyleSheet.create({ card: { backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }, image: { width: '100%', aspectRatio: 4 / 3 }, content: { padding: spacing.md }, category: { color: colors.muted, fontFamily: fonts.sansMedium, fontSize: 11, textTransform: 'uppercase' }, title: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 20, lineHeight: 27, marginTop: spacing.xs }, detail: { color: colors.muted, fontFamily: fonts.sans, marginTop: spacing.sm } });