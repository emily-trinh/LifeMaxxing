import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { colors, fonts, radius, spacing, type } from '../../constants/theme';
import { categoryEmoji, distanceKm, formatDistance, formatEventDate } from '../../lib/format';
import { getEvent } from '../../lib/mockData';
import { getAttendanceStatus, rsvpToEvent } from '../../services/eventService';
import { addEventToCalendar, getEntryBySourceEventId } from '../../services/calendarService';
import type { AttendanceStatus } from '../../services/eventService';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = getEvent(id);
  const { width } = useWindowDimensions();
  const [attendance, setAttendance] = useState<AttendanceStatus | 'loading'>('loading');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setAttendance('loading');

    async function loadAttendance() {
      if (!event) {
        setAttendance('none');
        return;
      }
      try {
        const calendarEntry = await getEntryBySourceEventId(event.id);
        if (!active) return;
        if (!event.is_free) {
          setAttendance(calendarEntry?.status === 'booked' ? 'booked' : 'none');
          return;
        }
        if (calendarEntry?.status === 'going') {
          setAttendance('going');
          return;
        }
        const status = await getAttendanceStatus(event.id);
        if (!active) return;
        setAttendance(status);
        if (event.is_free && status === 'going') {
          void addEventToCalendar(event, 'going').catch((error: unknown) => {
            Alert.alert("Couldn't update your calendar", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      } catch (error) {
        if (active) {
          setAttendance('none');
          Alert.alert('Unable to load event', error instanceof Error ? error.message : 'Please try again.');
        }
      }
    }

    void loadAttendance();
    return () => { active = false; };
  }, [event]);

  async function joinOrBook() {
    if (!event || submitting) return;
    setSubmitting(true);
    try {
      if (event.is_free) {
        await rsvpToEvent(event.id);
        setAttendance('going');
        void addEventToCalendar(event, 'going').catch((error: unknown) => {
          Alert.alert("Couldn't update your calendar", error instanceof Error ? error.message : 'Please try again.');
        });
      } else {
        await addEventToCalendar(event, 'booked');
        setAttendance('booked');
      }
    } catch (error) {
      if (event.is_free) {
        Alert.alert("Couldn't update your calendar", error instanceof Error ? error.message : 'Please try again.');
      } else {
        Alert.alert("Couldn't book", error instanceof Error ? error.message : 'Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.screen}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.notFound}>Event not found.</Text>
      </SafeAreaView>
    );
  }

  const emoji = categoryEmoji[event.category];
  const chips = [
    `${emoji ? `${emoji} ` : ''}${event.category}`,
    event.is_free ? 'Free' : `$${event.price}`,
    ...(event.is_outdoor ? ['Outdoor'] : []),
    event.is_group_activity ? 'Group' : 'Solo',
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={24} color={colors.ink} />
      </Pressable>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {event.image_url ? <Image source={{ uri: event.image_url }} style={[styles.image, { width, height: width * 0.75 }]} resizeMode="cover" /> : null}
        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.description}>{event.description}</Text>
          <View style={styles.chips}>
            {chips.map((chip) => <Chip key={chip} label={chip} />)}
          </View>
          <View style={styles.details}>
            <DetailRow icon="time-outline" label="Date" value={formatEventDate(event.start_time)} />
            <DetailRow icon="location-outline" label="Where" value={`${event.address} · ${formatDistance(distanceKm(event.latitude, event.longitude))}`} />
          </View>
          <View style={styles.actions}>
            {attendance === 'going' ? <AttendanceRow label="You're in 🎉" /> : null}
            {attendance === 'booked' ? <AttendanceRow label="Booked 🎟️" /> : null}
            {attendance === 'none' ? (
              <Button
                label={submitting ? (event.is_free ? 'Joining...' : 'Booking...') : (event.is_free ? 'Join (free)' : Number.isFinite(event.price) && event.price > 0 ? `Book it · $${event.price}` : 'Book it')}
                onPress={joinOrBook}
                disabled={submitting}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: { icon: 'time-outline' | 'location-outline'; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelGroup}>
        <Ionicons name={icon} size={18} color={colors.muted} />
        <Text style={styles.detailLabel} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function AttendanceRow({ label }: { label: string }) {
  return (
    <View style={styles.attendanceRow}>
      <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
      <Text style={styles.attendanceLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  backButton: { alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  scrollContent: { paddingBottom: spacing.xl },
  image: { borderRadius: radius.sm, backgroundColor: colors.surface },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 26, lineHeight: 32 },
  description: { ...type.body, color: colors.muted, marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  details: { marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabelGroup: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm - spacing.xs / 2 },
  detailLabel: { ...type.label, flexShrink: 0 },
  detailValue: { ...type.body, flex: 1, flexShrink: 1, textAlign: 'right' },
  actions: { marginTop: spacing.lg },
  attendanceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  attendanceLabel: { ...type.status },
  notFound: { ...type.body, color: colors.muted, padding: spacing.md },
});