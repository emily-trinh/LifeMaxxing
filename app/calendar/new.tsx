import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { colors, fonts, radius, spacing, type } from '../../constants/theme';
import { getEntry, createPersonalEntry, deleteEntry, updatePersonalEntry } from '../../services/calendarService';
import type { CalendarEntry } from '../../types/activity';

const notesAccessoryId = 'calendarNotesDoneAccessory';
type PickerField = 'date' | 'start' | 'end';

function parseDateParam(value?: string): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    if (parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day) return parsed;
  }
  return new Date();
}

function nextFullHour(date: Date): Date {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  return next;
}

function makeInitialStart(dateParam?: string, hourParam?: string): Date {
  const date = parseDateParam(dateParam);
  const hour = hourParam === undefined ? NaN : Number(hourParam);
  if (Number.isInteger(hour) && hour >= 0 && hour <= 23) {
    date.setHours(hour, 0, 0, 0);
    return date;
  }
  return nextFullHour(date);
}

function combineDateAndTime(date: Date, time: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), 0, 0);
}

function dayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function formatDateValue(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

function formatTimeValue(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
}

export default function NewCalendarEntryScreen() {
  const { date: dateParam, hour: hourParam, id } = useLocalSearchParams<{ date?: string; hour?: string; id?: string }>();
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState(() => makeInitialStart(dateParam, hourParam));
  const [endsAt, setEndsAt] = useState(() => new Date(makeInitialStart(dateParam, hourParam).getTime() + 60 * 60 * 1000));
  const [allDay, setAllDay] = useState(false);
  const [notes, setNotes] = useState('');
  const [activePicker, setActivePicker] = useState<PickerField | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(Boolean(id));
  const editing = Boolean(id);
  const invalidTimeRange = !allDay && endsAt.getTime() <= startsAt.getTime();
  const saveStartsAt = allDay ? dayStart(startsAt) : startsAt;
  const saveEndsAt = allDay ? dayEnd(startsAt) : endsAt;
  const canSave = title.trim().length > 0
    && saveEndsAt.getTime() > saveStartsAt.getTime()
    && !saving
    && !deleting
    && !loadingEntry;

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoadingEntry(true);

    void getEntry(id)
      .then((entry: CalendarEntry | null) => {
        if (!active) return;
        if (!entry) {
          Alert.alert("Couldn't load event", 'This calendar entry could not be found.');
          router.back();
          return;
        }
        if (entry.kind !== 'personal') {
          Alert.alert('Bookings are managed from the event');
          router.back();
          return;
        }
        setTitle(entry.title);
        setStartsAt(new Date(entry.startsAt));
        setEndsAt(new Date(entry.endsAt));
        setAllDay(entry.allDay);
        setNotes(entry.notes ?? '');
      })
      .catch((error: unknown) => {
        if (!active) return;
        Alert.alert("Couldn't load event", error instanceof Error ? error.message : 'Please try again.');
        router.back();
      })
      .finally(() => {
        if (active) setLoadingEntry(false);
      });

    return () => { active = false; };
  }, [id]);

  function handlePickerChange(event: DateTimePickerEvent, pickedDate?: Date) {
    if (event.type === 'dismissed' || !pickedDate || !activePicker) {
      if (Platform.OS === 'android') setActivePicker(null);
      return;
    }

    if (activePicker === 'date') {
      const nextStart = combineDateAndTime(pickedDate, startsAt);
      let nextEnd = combineDateAndTime(pickedDate, endsAt);
      if (nextEnd.getTime() <= nextStart.getTime()) nextEnd = new Date(nextStart.getTime() + 60 * 60 * 1000);
      setStartsAt(nextStart);
      setEndsAt(nextEnd);
    } else if (activePicker === 'start') {
      const nextStart = combineDateAndTime(startsAt, pickedDate);
      setStartsAt(nextStart);
      if (nextStart.getTime() >= endsAt.getTime()) setEndsAt(new Date(nextStart.getTime() + 60 * 60 * 1000));
    } else {
      setEndsAt(combineDateAndTime(endsAt, pickedDate));
    }

    if (Platform.OS === 'android') setActivePicker(null);
  }

  function togglePicker(field: PickerField) {
    setActivePicker((current) => current === field ? null : field);
  }

  async function saveEntry() {
    if (!canSave) return;
    setSaving(true);
    try {
      const values = {
        title: title.trim(),
        startsAt: saveStartsAt,
        endsAt: saveEndsAt,
        allDay,
        notes: notes.trim() || null,
      };
      if (id) {
        await updatePersonalEntry(id, values);
      } else {
        await createPersonalEntry(values);
      }
      router.back();
    } catch (error) {
      Alert.alert("Couldn't save", error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function removeEntry() {
    if (!id || deleting) return;
    setDeleting(true);
    try {
      await deleteEntry(id);
      router.back();
    } catch (error) {
      Alert.alert("Couldn't delete", error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  function confirmDelete() {
    Alert.alert('Delete event?', title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void removeEntry(); } },
    ]);
  }

  function renderPicker(field: PickerField) {
    if (activePicker !== field) return null;
    const mode = field === 'date' ? 'date' : 'time';
    const value = field === 'date' ? startsAt : field === 'start' ? startsAt : endsAt;
    return (
      <View style={styles.pickerWrap}>
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          accentColor={colors.ink}
          onChange={handlePickerChange}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.flex}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.headerSide} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={24} color={colors.ink} />
              </Pressable>
              <Text style={styles.headerTitle}>{editing ? 'Edit event' : 'New event'}</Text>
              <Pressable onPress={() => void saveEntry()} disabled={!canSave} style={styles.saveButton} accessibilityRole="button">
                <Text style={[styles.saveText, !canSave && styles.disabledSaveText]}>{saving ? 'Saving...' : 'Save'}</Text>
              </Pressable>
            </View>
            <View style={styles.divider} />
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Title</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="What are you doing?"
                  placeholderTextColor={colors.muted}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  autoFocus={!editing}
                  editable={!loadingEntry}
                  style={styles.titleInput}
                />
              </View>
              <View style={styles.divider} />

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date</Text>
                <Pressable onPress={() => togglePicker('date')} style={styles.valueRow} accessibilityRole="button">
                  <Text style={styles.valueText}>{formatDateValue(startsAt)}</Text>
                  <Ionicons name="chevron-down" size={16} color={colors.muted} />
                </Pressable>
                {renderPicker('date')}
              </View>
              <View style={styles.divider} />

              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchTitle}>All day</Text>
                  <Text style={styles.switchDescription}>Hide the start and end times</Text>
                </View>
                <Switch
                  value={allDay}
                  onValueChange={(value) => {
                    setAllDay(value);
                    setActivePicker(null);
                  }}
                  thumbColor={colors.ink}
                  trackColor={{ false: colors.border, true: colors.ink }}
                />
              </View>
              <View style={styles.divider} />

              {!allDay ? (
                <>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Starts</Text>
                    <Pressable onPress={() => togglePicker('start')} style={styles.valueRow} accessibilityRole="button">
                      <Text style={styles.valueText}>{formatTimeValue(startsAt)}</Text>
                      <Ionicons name="chevron-down" size={16} color={colors.muted} />
                    </Pressable>
                    {renderPicker('start')}
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Ends</Text>
                    <Pressable onPress={() => togglePicker('end')} style={styles.valueRow} accessibilityRole="button">
                      <Text style={styles.valueText}>{formatTimeValue(endsAt)}</Text>
                      <Ionicons name="chevron-down" size={16} color={colors.muted} />
                    </Pressable>
                    {renderPicker('end')}
                  </View>
                  {invalidTimeRange ? <Text style={styles.validationText}>End time must be after start time.</Text> : null}
                  <View style={styles.divider} />
                </>
              ) : null}

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Notes</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  maxLength={500}
                  placeholder="Add notes (optional)"
                  placeholderTextColor={colors.muted}
                  textAlignVertical="top"
                  inputAccessoryViewID={notesAccessoryId}
                  style={styles.notesInput}
                />
                <Text style={styles.characterCount}>{notes.length}/500</Text>
              </View>

              {editing ? (
                <View style={styles.deleteWrap}>
                  <Button
                    label={deleting ? 'Deleting...' : 'Delete event'}
                    variant="outline"
                    labelColor={colors.danger}
                    borderColor={colors.danger}
                    onPress={confirmDelete}
                    disabled={deleting || saving || loadingEntry}
                  />
                </View>
              ) : null}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
        {Platform.OS === 'ios' ? (
          <InputAccessoryView nativeID={notesAccessoryId}>
            <View style={styles.accessory}>
              <Pressable onPress={Keyboard.dismiss} accessibilityRole="button">
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
          </InputAccessoryView>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: { minHeight: spacing.xl + spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  headerSide: { width: spacing.xl + spacing.sm, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { position: 'absolute', left: spacing.xl * 2, right: spacing.xl * 2, textAlign: 'center', color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  saveButton: { minWidth: spacing.xl + spacing.sm, minHeight: spacing.xl + spacing.sm, alignItems: 'flex-end', justifyContent: 'center' },
  saveText: { color: colors.ink, fontFamily: fonts.bold, fontSize: 16 },
  disabledSaveText: { color: colors.muted },
  divider: { height: 1, backgroundColor: colors.border },
  content: { paddingBottom: spacing.xl },
  fieldRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  fieldLabel: { ...type.label, color: colors.muted, marginBottom: spacing.xs },
  titleInput: { ...type.body, paddingVertical: spacing.xs },
  valueRow: { minHeight: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valueText: { color: colors.text, fontFamily: fonts.medium, fontSize: 16 },
  pickerWrap: { paddingTop: spacing.sm, alignItems: 'flex-start' },
  switchRow: { minHeight: spacing.xl + spacing.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchTitle: { color: colors.text, fontFamily: fonts.medium, fontSize: 15 },
  switchDescription: { ...type.meta, marginTop: spacing.xs },
  validationText: { color: colors.danger, fontFamily: fonts.regular, fontSize: 12, paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.sm },
  notesInput: { ...type.body, minHeight: spacing.xl * 3, paddingTop: spacing.xs },
  characterCount: { ...type.meta, textAlign: 'right', marginTop: spacing.xs },
  deleteWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  accessory: { flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  doneText: { color: colors.ink, fontFamily: fonts.bold, fontSize: 16 },
});