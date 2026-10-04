import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Confetti } from '../../components/Confetti';
import { colors, fonts, radius, spacing, type } from '../../constants/theme';
import { categoryEmoji, formatEventDate, formatEventTime } from '../../lib/format';
import { getAttendanceStatus, rsvpToEvent } from '../../services/eventService';
import { addEventToCalendar, getEntryBySourceEventId } from '../../services/calendarService';
import type { AttendanceStatus } from '../../services/eventService';
import { useMission } from '../../lib/MissionContext';

export default function PromptScreen() {
  const { activeEvent, activeEventId, chooseFreeEvent, isCompleted, recommendation, recommendationLoading, recommendationError } = useMission();
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
        const calendarEntry = await getEntryBySourceEventId(event.id);
        if (!isActive) return;
        if (!event.is_free) {
          setAttendance(calendarEntry?.status === 'booked' ? 'booked' : 'none');
          return;
        }
        if (calendarEntry?.status === 'going') {
          setAttendance('going');
          return;
        }
        const status = await getAttendanceStatus(event.id);
        if (!isActive) return;
        if (event.is_free && status === 'none') {
          await rsvpToEvent(event.id);
          if (isActive) {
            setAttendance('going');
            void addEventToCalendar(event, 'going').catch((error: unknown) => {
              Alert.alert("Couldn't update your calendar", error instanceof Error ? error.message : 'Please try again.');
            });
          }
          return;
        }
        setAttendance(status);
        if (event.is_free && status === 'going') {
          void addEventToCalendar(event, 'going').catch((error: unknown) => {
            Alert.alert("Couldn't update your calendar", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      } catch (error) {
        if (isActive) {
          setAttendance('none');
          Alert.alert('Unable to load activity', error instanceof Error ? error.message : 'Please try again.');
        }
      }
    }

    void loadAttendance();
    return () => { isActive = false; };
  }, [activeEventId, event.id, event.is_free]);

  async function bookCurrentEvent() {
    if (booking) return;
    setBooking(true);
    try {
      await addEventToCalendar(event, 'booked');
      setAttendance('booked');
    } catch (error) {
      Alert.alert("Couldn't book", error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBooking(false);
    }
  }

  function chooseFreeActivity() {
    chooseFreeEvent();
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
          <Text style={styles.subtitle}>{isCompleted ? 'mission complete' : 'something new to try this week'}</Text>
        </View>
        <View style={styles.missionDivider} />
        <View style={styles.missionText}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>
          {recommendationLoading && !isCompleted ? <Text style={styles.aiStatus}>Finding your weekly activity...</Text> : null}
          {recommendationError ? <Text style={styles.aiError}>{recommendationError}</Text> : null}
          {recommendation?.eventId === null ? <Text style={styles.aiError}>{recommendation.reason}</Text> : null}
          {recommendation?.eventId === event.id ? <Text style={styles.reason}>Why this was picked: {recommendation.reason}</Text> : null}
        </View>
        {event.image_url ? <Image source={{ uri: event.image_url }} style={[styles.image, { width, height: width * 0.75 }]} resizeMode="cover" /> : null}
        <View style={styles.textSection}>
          <View style={styles.chips}>
            {chips.map((chip) => <Chip key={chip} label={chip} />)}
          </View>
          <View style={styles.details}>
            <DetailRow
              icon="◷"
              label={event.is_free ? 'Time' : 'Date'}
              value={event.is_free ? formatEventTime(event.start_time) : formatEventDate(event.start_time)}
            />
            <DetailRow icon="⌖" label="Where" value={event.address} />
          </View>
          <View style={styles.attendanceSection}>
            {isCompleted ? <Text style={styles.nextMission}>Mission complete ✓{'\n'}Wait next week for the next mission.</Text> : null}
            {!isCompleted && attendance === 'going' ? <AttendanceRow label="You're in 🎉" /> : null}
            {!isCompleted && attendance === 'booked' ? <AttendanceRow label="Booked 🎟️" /> : null}
            {!event.is_free && attendance === 'none' ? (
              <>
                <Button
                  label={booking ? 'Booking...' : Number.isFinite(event.price) && event.price > 0 ? `Book it · $${event.price}` : 'Book it'}
                  onPress={bookCurrentEvent}
                  disabled={booking}
                />
                <Button label="See a free event instead" onPress={chooseFreeActivity} variant="outline" />
              </>
            ) : null}
            {!isCompleted && (attendance === 'going' || attendance === 'booked') ? (
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
  aiStatus: { ...type.meta, color: colors.muted, marginTop: spacing.md },
  aiError: { ...type.meta, color: colors.danger, marginTop: spacing.md },
  reason: { ...type.body, color: colors.ink, marginTop: spacing.md },
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
  nextMission: { ...type.body, color: colors.ink, fontFamily: fonts.bold, marginBottom: spacing.md },
  statusIcon: { ...type.icon, color: colors.accent, fontFamily: fonts.bold },
  statusLabel: { ...type.status },
});