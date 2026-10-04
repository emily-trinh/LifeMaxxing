import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors, fonts, radius, spacing, type } from '../constants/theme';
import { formatLongDate, formatTimeRange } from '../lib/format';
import { removeEventFromCalendar } from '../services/calendarService';
import type { CalendarEntry } from '../types/activity';

type BookingSheetProps = {
  entry: CalendarEntry | null;
  onClose: () => void;
  onRemoved: () => void;
};

export function BookingSheet({ entry, onClose, onRemoved }: BookingSheetProps) {
  const [removing, setRemoving] = useState(false);
  const address = entry?.event?.address ?? '';

  async function openDirections() {
    if (!address) return;
    try {
      await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
    } catch (error) {
      Alert.alert("Couldn't open directions", error instanceof Error ? error.message : 'Please try again.');
    }
  }

  async function removeBooking() {
    if (!entry?.sourceEventId || removing) return;
    setRemoving(true);
    try {
      await removeEventFromCalendar(entry.sourceEventId);
      onClose();
      onRemoved();
    } catch (error) {
      Alert.alert("Couldn't remove from calendar", error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setRemoving(false);
    }
  }

  function confirmRemove() {
    if (!entry) return;
    Alert.alert('Remove from calendar?', entry.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { void removeBooking(); } },
    ]);
  }

  return (
    <Modal visible={entry !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          {entry ? (
            <>
              <Text style={styles.title}>{entry.title}</Text>
              <Text style={styles.meta}>
                {formatLongDate(entry.startsAt)}{entry.allDay ? ' · All day' : ` · ${formatTimeRange(entry.startsAt, entry.endsAt)}`}
              </Text>
              {address ? <Text style={styles.address}>{address}</Text> : null}
              <View style={styles.actions}>
                {address ? <Button label="Get directions" variant="outline" onPress={() => void openDirections()} /> : null}
                <Pressable onPress={confirmRemove} disabled={removing} style={styles.removeButton} accessibilityRole="button">
                  <Ionicons name="trash-outline" size={17} color={colors.danger} />
                  <Text style={styles.removeText}>{removing ? 'Removing...' : 'Remove from calendar'}</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.border },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 },
  meta: { ...type.label, color: colors.muted, marginTop: spacing.sm },
  address: { ...type.body, color: colors.muted, marginTop: spacing.sm },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  removeButton: { minHeight: spacing.xl + spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  removeText: { color: colors.danger, fontFamily: fonts.medium, fontSize: 15 },
});