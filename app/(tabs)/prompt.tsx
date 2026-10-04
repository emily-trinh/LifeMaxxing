import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Confetti } from '../../components/Confetti';
import { colors, fonts, radius, spacing, type } from '../../constants/theme';
import { mockEvents } from '../../lib/mockData';
import { categoryEmoji, formatEventDate } from '../../lib/format';
import { bookEvent, getAttendanceStatus, rsvpToEvent } from '../../services/eventService';
import type { AttendanceStatus } from '../../services/eventService';
import { useMission } from '../../lib/MissionContext';

export default function PromptScreen() {
  const { activeEvent, activeEventId, setActiveEventId } = useMission();
  const [attendance, setAttendance] = useState<AttendanceStatus | 'loading'>('loading');
  const [booking, setBooking] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const { width } = useWindowDimensions();
  const event = activeEvent;
  const chips = [
    `${categoryEmoji[event.category] ? `${categoryEmoji[event.category]} ` : ''}${event.category}`,
    event.is_free ? 'Free' : `$${event.price}`,
    ...(event.is_outdoor ? ['Outdoor'] : []),
    event.is_group_activity ? 'Group' : 'Solo',
  ];

  useEffect(() => {
    let isActive = true;
    setAttendance('loading');
    setBooking(false);

    async function loadAttendance() {
      try {
        const status = await getAttendanceStatus(event.id);
        if (!isActive) return;
        if (event.is_free && status === 'none') {
          await rsvpToEvent(event.id);
          if (isActive) setAttendance('going');
          return;
        }
        setAttendance(status);
      } catch {
        if (isActive) setAttendance('none');
      }
    }

    void loadAttendance();
    return () => { isActive = false; };
  }, [activeEventId, event.id, event.is_free]);

  async function bookCurrentEvent() {
    if (booking) return;
    setBooking(true);
    try {
      await bookEvent(event.id);
      setAttendance('booked');
    } finally {
      setBooking(false);
    }
  }

  function chooseFreeActivity() {
    const alternatives = mockEvents.filter((item) => item.is_free && item.id !== event.id);
    if (alternatives.length === 0) return;
    setActiveEventId(alternatives[Math.floor(Math.random() * alternatives.length)].id);
  }

  const handleConfettiDone = useCallback(() => {
    setConfettiVisible(false);
    router.push({ pathname: '/post/create', params: { eventId: event.id } });
  }, [event.id]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headingBlock}>
          <Text style={styles.screenTitle}>Your mission</Text>
          <Text style={styles.subtitle}>something new to try this week</Text>
        </View>
        <View style={styles.missionDivider} />
        <View style={styles.missionText}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>
        </View>
        {event.image_url ? <Image source={{ uri: event.image_url }} style={[styles.image, { width, height: width * 0.75 }]} resizeMode="cover" /> : null}
        <View style={styles.textSection}>
          <View style={styles.chips}>
            {chips.map((chip) => <Chip key={chip} label={chip} />)}
          </View>
          <View style={styles.details}>
            <DetailRow icon="◷" label="Date" value={formatEventDate(event.start_time)} />
            <DetailRow icon="⌖" label="Where" value={event.address} />
          </View>
          <View style={styles.attendanceSection}>
            {attendance === 'going' ? <AttendanceRow label="You're in 🎉" /> : null}
            {attendance === 'booked' ? <AttendanceRow label="Booked 🎟️" /> : null}
            {!event.is_free && attendance === 'none' ? (
              <>
                <Button label={booking ? 'Booking...' : `Book · $${event.price}`} onPress={bookCurrentEvent} disabled={booking} />
                <Button label="See a free event instead" onPress={chooseFreeActivity} variant="outline" />
                <Text style={styles.bookingNote}>Booking confirms your spot and adds it to your calendar.</Text>
              </>
            ) : null}
            {attendance === 'going' || attendance === 'booked' ? (
              <Button label="I did it" onPress={() => setConfettiVisible(true)} />
            ) : null}
          </View>
        </View>
      </ScrollView>
      <Confetti visible={confettiVisible} onDone={handleConfettiDone} />
    </SafeAreaView>
  );
}

function AttendanceRow({ label }: { label: string }) {
  return (
    <View style={styles.attendanceRow}>
      <Text style={styles.statusIcon}>✓</Text>
      <Text style={styles.statusLabel}>{label}</Text>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelGroup}>
        <Text style={styles.detailIcon}>{icon}</Text>
        <Text style={styles.detailLabel} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xl },
  textSection: { paddingHorizontal: spacing.md },
  headingBlock: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  screenTitle: { ...type.title },
  subtitle: { ...type.label, color: colors.muted, marginTop: spacing.xs },
  missionDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md, marginTop: spacing.xl, marginBottom: spacing.lg },
  missionText: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  eventTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  eventDescription: { ...type.body, color: colors.muted, marginTop: spacing.sm },
  image: { borderRadius: radius.sm, backgroundColor: colors.surface },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  details: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabelGroup: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm - spacing.xs / 2 },
  detailIcon: { ...type.icon, color: colors.muted },
  detailLabel: { ...type.label, flexShrink: 0 },
  detailValue: { ...type.body, flex: 1, flexShrink: 1, textAlign: 'right' },
  attendanceSection: { gap: spacing.sm, marginTop: spacing.lg },
  attendanceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  statusIcon: { ...type.icon, color: colors.accent, fontFamily: fonts.bold },
  statusLabel: { ...type.status },
  bookingNote: { ...type.meta, textAlign: 'center', marginTop: spacing.xs },
});