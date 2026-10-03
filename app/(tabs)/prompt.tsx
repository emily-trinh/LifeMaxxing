import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { PromptCard } from '../../components/PromptCard';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { getEvent, mockEvents, mockWeeklyPrompt } from '../../lib/mockData';
import { formatEventDate } from '../../lib/format';
import type { Event } from '../../types';

const promptEvent = mockWeeklyPrompt.event_id ? getEvent(mockWeeklyPrompt.event_id) : undefined;

export default function PromptScreen() {
  const [activeEvent, setActiveEvent] = useState<Event | undefined>(promptEvent);
  const event = activeEvent ?? mockEvents[0];
  const chips = [
    event.category,
    event.is_free ? 'Free' : `$${event.price}`,
    ...(event.is_outdoor ? ['Outdoor'] : []),
    event.is_group_activity ? 'Group' : 'Solo',
  ];

  function chooseFreeActivity() {
    const alternatives = mockEvents.filter((item) => item.is_free && item.id !== event.id);
    if (alternatives.length === 0) return;
    setActiveEvent(alternatives[Math.floor(Math.random() * alternatives.length)]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>This week</Text>
        <PromptCard title={mockWeeklyPrompt.title} description={mockWeeklyPrompt.description} />

        {event.image_url ? <Image source={{ uri: event.image_url }} style={styles.image} /> : null}

        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.chips}>
          {chips.map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.details}>
          <DetailRow icon="◷" label="Date" value={formatEventDate(event.start_time)} />
          <DetailRow icon="⌖" label="Where" value={event.address} />
          <DetailRow icon="♧" label="Spots" value={String(event.capacity)} />
        </View>

        <View style={styles.buttons}>
          <Button
            label="Mark as done"
            onPress={() => router.push({ pathname: '/post/create', params: { eventId: event.id } })}
          />
          <Button label="Give me a free activity instead" onPress={chooseFreeActivity} variant="outline" />
          {event.id !== promptEvent?.id ? (
            <Pressable onPress={() => setActiveEvent(promptEvent)} hitSlop={spacing.sm}>
              <Text style={styles.resetButton}>Back to this week's prompt</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  screenTitle: { color: colors.text, fontFamily: fonts.serifBold, fontSize: 34, marginBottom: spacing.md },
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg, overflow: 'hidden', marginTop: spacing.md, backgroundColor: colors.border },
  eventTitle: { color: colors.text, fontFamily: fonts.serifBold, fontSize: 26, lineHeight: 34, marginTop: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  chipText: { color: colors.text, fontFamily: fonts.sans, fontSize: 13 },
  description: { color: colors.text, fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, marginTop: spacing.md },
  details: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  detailRow: { flexDirection: 'row', alignItems: 'center', minHeight: spacing.xl + spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  detailIcon: { width: spacing.lg, color: colors.muted, fontFamily: fonts.sans, fontSize: 18, textAlign: 'center' },
  detailLabel: { width: spacing.xl, color: colors.muted, fontFamily: fonts.sans, fontSize: 13 },
  detailValue: { flex: 1, color: colors.text, fontFamily: fonts.sans, fontSize: 14 },
  buttons: { gap: spacing.sm, marginTop: spacing.lg },
  resetButton: { color: colors.muted, fontFamily: fonts.sansMedium, fontSize: 14, textAlign: 'center', paddingVertical: spacing.sm },
});