import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookingSheet } from '../../components/BookingSheet';
import { colors, fonts, radius, spacing, type } from '../../constants/theme';
import { formatHourLabel, formatLongDate, formatTimeRange } from '../../lib/format';
import { getEntries } from '../../services/calendarService';
import type { CalendarEntry } from '../../types/activity';
import { useMission } from '../../lib/MissionContext';

const HOUR_HEIGHT = 64;
const TIMELINE_GUTTER = 56;
const DAY_MINUTES = 24 * 60;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface TimedBlock {
  entry: CalendarEntry;
  startMinutes: number;
  endMinutes: number;
  column: number;
  columns: number;
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateFromKey(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function monthGridDays(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  first.setDate(first.getDate() - first.getDay());
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  last.setDate(last.getDate() + 6 - last.getDay());
  const days: Date[] = [];
  for (const current = new Date(first); current <= last; current.setDate(current.getDate() + 1)) {
    days.push(new Date(current));
  }
  return days;
}

function entriesForDay(entries: CalendarEntry[], day: Date): CalendarEntry[] {
  const dayStart = startOfDay(day);
  const nextDay = new Date(dayStart);
  nextDay.setDate(nextDay.getDate() + 1);
  return entries.filter((entry) => new Date(entry.startsAt) < nextDay && new Date(entry.endsAt) >= dayStart);
}

function makeTimedBlocks(entries: CalendarEntry[], day: Date): TimedBlock[] {
  const dayStart = startOfDay(day).getTime();
  const nextDay = dayStart + 24 * 60 * 60 * 1000;
  const sorted = entries
    .filter((entry) => !entry.allDay)
    .map((entry) => {
      const start = new Date(entry.startsAt).getTime();
      const end = new Date(entry.endsAt).getTime();
      return {
        entry,
        startMinutes: Math.max(0, (start - dayStart) / 60000),
        endMinutes: Math.min(DAY_MINUTES, (end - dayStart) / 60000),
        actualStart: start,
        actualEnd: end,
      };
    })
    .filter((block) => block.actualEnd > dayStart && block.actualStart < nextDay && block.endMinutes > block.startMinutes)
    .sort((first, second) => first.startMinutes - second.startMinutes || first.endMinutes - second.endMinutes);

  const result: TimedBlock[] = [];
  let cluster: typeof sorted = [];
  let clusterEnd = -1;

  const flushCluster = () => {
    if (cluster.length === 0) return;
    const columnEnds: number[] = [];
    const assigned = cluster.map((block) => {
      let column = columnEnds.findIndex((end) => end <= block.startMinutes);
      if (column < 0) column = columnEnds.length;
      columnEnds[column] = block.endMinutes;
      return { ...block, column };
    });
    const columns = columnEnds.length;
    assigned.forEach((block) => result.push({ ...block, columns }));
    cluster = [];
    clusterEnd = -1;
  };

  sorted.forEach((block) => {
    if (cluster.length > 0 && block.startMinutes >= clusterEnd) flushCluster();
    cluster.push(block);
    clusterEnd = Math.max(clusterEnd, block.endMinutes);
  });
  flushCluster();
  return result;
}

export default function CalendarScreen() {
  const { simulatedDate } = useMission();
  const { width } = useWindowDimensions();
  const dayCellWidth = Math.floor(width / 7);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = simulatedDate;
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(simulatedDate));
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'month' | 'day'>('month');
  const [now, setNow] = useState(() => new Date(simulatedDate));
  const [selectedBooking, setSelectedBooking] = useState<CalendarEntry | null>(null);
  const animation = useRef(new Animated.Value(0)).current;
  const timelineRef = useRef<ScrollView>(null);
  const monthWeeks = [] as Date[][];
  const days = monthGridDays(visibleMonth);
  for (let index = 0; index < days.length; index += 7) monthWeeks.push(days.slice(index, index + 7));
  const monthTitle = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(visibleMonth);
  const selectedKey = localDateKey(selectedDay);
  const todayKey = localDateKey(now);
  const todayEntries = entriesForDay(entries, selectedDay);
  const allDayEntries = todayEntries.filter((entry) => entry.allDay);
  const timedBlocks = makeTimedBlocks(todayEntries, selectedDay);
  const isSelectedDayToday = selectedKey === todayKey;
  const weekdayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(selectedDay);

  useEffect(() => {
    const configuredDay = startOfDay(simulatedDate);
    setVisibleMonth(new Date(configuredDay.getFullYear(), configuredDay.getMonth(), 1));
    setSelectedDay(configuredDay);
    setNow(new Date(simulatedDate));
  }, [simulatedDate]);

  const loadVisibleEntries = useCallback(async () => {
    const gridStart = days[0];
    const gridEnd = days[days.length - 1];
    const rangeStart = startOfDay(gridStart);
    const rangeEnd = new Date(gridEnd.getFullYear(), gridEnd.getMonth(), gridEnd.getDate(), 23, 59, 59, 999);
    setLoading(true);
    try {
      setEntries(await getEntries(rangeStart, rangeEnd));
    } catch (error) {
      Alert.alert('Unable to load calendar', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [visibleMonth.getFullYear(), visibleMonth.getMonth()]);

  useFocusEffect(useCallback(() => {
    void loadVisibleEntries();
  }, [loadVisibleEntries]));

  useEffect(() => {
    if (mode !== 'day') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      returnToMonth();
      return true;
    });
    return () => subscription.remove();
  }, [mode]);

  useEffect(() => {
    if (mode !== 'day') return;
    const firstTimed = timedBlocks[0];
    const initialHour = isSelectedDayToday
      ? now.getHours()
      : firstTimed
        ? Math.floor(firstTimed.startMinutes / 60)
        : 7;
    const frame = requestAnimationFrame(() => timelineRef.current?.scrollTo({ y: initialHour * HOUR_HEIGHT, animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [mode, selectedKey, entries, isSelectedDayToday]);

  function openDay(day: Date) {
    const selected = startOfDay(day);
    setSelectedDay(selected);
    if (selected.getMonth() !== visibleMonth.getMonth() || selected.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
    setMode('day');
    animation.setValue(0);
    Animated.timing(animation, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }

  function returnToMonth() {
    setSelectedBooking(null);
    Animated.timing(animation, { toValue: 0, duration: 220, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setMode('month');
    });
  }

  function shiftMonth(delta: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  function showToday() {
    const today = startOfDay(simulatedDate);
    setSelectedDay(today);
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  function openCreate(hour?: number) {
    const params: { date: string; hour?: string } = { date: selectedKey };
    if (hour !== undefined) params.hour = String(hour);
    router.push({ pathname: '/calendar/new', params } as never);
  }

  function refreshAfterRemoval() {
    void loadVisibleEntries();
  }

  const monthOpacity = animation.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const dayOpacity = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const dayScale = animation.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.stage}>
        <Animated.View style={[styles.monthLayer, { opacity: monthOpacity }]} pointerEvents={mode === 'month' ? 'auto' : 'none'}>
          <View style={styles.headingBlock}>
            <Text style={styles.pageTitle}>Calendar</Text>
            <Text style={styles.subtitle}>your plans, in one place</Text>
          </View>
          <View style={styles.monthControls}>
            <Pressable onPress={() => shiftMonth(-1)} style={styles.monthArrow} accessibilityRole="button" accessibilityLabel="Previous month">
              <Ionicons name="chevron-back" size={21} color={colors.ink} />
            </Pressable>
            <Text style={styles.monthLabel}>{monthTitle}</Text>
            <Pressable onPress={() => shiftMonth(1)} style={styles.monthArrow} accessibilityRole="button" accessibilityLabel="Next month">
              <Ionicons name="chevron-forward" size={21} color={colors.ink} />
            </Pressable>
            <Pressable onPress={showToday} style={styles.todayButton} accessibilityRole="button">
              <Text style={styles.todayButtonText}>Today</Text>
            </Pressable>
          </View>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((weekday) => (
              <View key={weekday} style={[styles.weekdayCell, { width: dayCellWidth }]}>
                <Text style={styles.weekdayLabel}>{weekday}</Text>
              </View>
            ))}
          </View>
          <View>
            {monthWeeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.weekRow}>
                {week.map((day) => {
                  const dayKey = localDateKey(day);
                  const dayEntries = entriesForDay(entries, day);
                  const isToday = dayKey === todayKey;
                  const isSelected = dayKey === selectedKey;
                  const inMonth = day.getMonth() === visibleMonth.getMonth();
                  return (
                    <Pressable
                      key={dayKey}
                      onPress={() => openDay(day)}
                      style={[styles.dayCell, { width: dayCellWidth }, isSelected && !isToday && styles.selectedDayCell]}
                      accessibilityRole="button"
                      accessibilityLabel={`${formatLongDate(day)}, ${dayEntries.length} plans`}
                    >
                      <View style={[styles.dayNumberWrap, isToday && styles.todayNumberWrap]}>
                        <Text style={[styles.dayNumber, !inMonth && styles.outsideDayNumber, isToday && styles.todayNumber]}>{day.getDate()}</Text>
                      </View>
                      <View style={styles.dayDots}>
                        {dayEntries.slice(0, 3).map((entry) => (
                          <View key={entry.id} style={[styles.dayDot, { backgroundColor: entry.kind === 'booking' ? colors.accent : colors.ink }]} />
                        ))}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
          {loading ? <Text style={styles.loadingText}>Updating calendar...</Text> : null}
        </Animated.View>

        <Animated.View
          style={[styles.dayLayer, { opacity: dayOpacity, transform: [{ scale: dayScale }] }]}
          pointerEvents={mode === 'day' ? 'auto' : 'none'}
        >
          <View style={styles.dayHeader}>
            <View style={styles.dayHeaderRow}>
              <Pressable onPress={returnToMonth} style={styles.dayBack} accessibilityRole="button" accessibilityLabel="Back to month">
                <Ionicons name="chevron-back" size={22} color={colors.ink} />
                <Text style={styles.dayBackMonth}>{new Intl.DateTimeFormat('en-US', { month: 'long' }).format(selectedDay)}</Text>
              </Pressable>
              <Pressable onPress={() => openCreate()} style={styles.addButton} accessibilityRole="button" accessibilityLabel="Add calendar entry">
                <Ionicons name="add" size={24} color={colors.ink} />
              </Pressable>
            </View>
            <View style={styles.dayDateBlock}>
              <Text style={styles.dayDateTitle}>{weekdayName}, {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(selectedDay)}</Text>
              <Text style={styles.entryCount}>{todayEntries.length} {todayEntries.length === 1 ? 'plan' : 'plans'}</Text>
            </View>
            <View style={styles.headerDivider} />
          </View>

          {allDayEntries.length > 0 ? (
            <View style={styles.allDaySection}>
              <Text style={styles.allDayLabel}>All day</Text>
              <View style={styles.allDayList}>
                {allDayEntries.map((entry) => (
                  <Pressable key={entry.id} onPress={() => entry.kind === 'personal' ? router.push({ pathname: '/calendar/new', params: { id: entry.id } } as never) : setSelectedBooking(entry)} style={[styles.allDayBlock, entry.kind === 'booking' ? styles.bookingBlock : styles.personalBlock]}>
                    <Text numberOfLines={1} style={styles.allDayTitle}>{entry.title}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.timelineArea}>
            <ScrollView ref={timelineRef} showsVerticalScrollIndicator={false}>
              <View style={[styles.timeline, { width }]}>
                {Array.from({ length: 24 }, (_, hour) => (
                  <Pressable
                    key={`hour-${hour}`}
                    onPress={() => openCreate(hour)}
                    style={styles.hourRow}
                    accessibilityRole="button"
                    accessibilityLabel={`Add plan at ${formatHourLabel(hour)}`}
                  >
                    <Text numberOfLines={1} style={styles.hourLabel}>{formatHourLabel(hour)}</Text>
                    <View style={styles.hourRule} />
                  </Pressable>
                ))}
                {timedBlocks.map(({ entry, startMinutes, endMinutes, column, columns }) => {
                  const columnWidth = (width - TIMELINE_GUTTER - Math.max(0, columns - 1) * 2) / columns;
                  const blockHeight = Math.max(((endMinutes - startMinutes) / 60) * HOUR_HEIGHT, 28);
                  const top = (startMinutes / 60) * HOUR_HEIGHT;
                  return (
                    <Pressable
                      key={entry.id}
                      onPress={() => entry.kind === 'personal' ? router.push({ pathname: '/calendar/new', params: { id: entry.id } } as never) : setSelectedBooking(entry)}
                      style={[
                        styles.eventBlock,
                        entry.kind === 'booking' ? styles.bookingBlock : styles.personalBlock,
                        { top, left: TIMELINE_GUTTER + column * (columnWidth + 2), width: columnWidth, height: blockHeight },
                      ]}
                    >
                      <Text numberOfLines={2} style={styles.eventBlockTitle}>{entry.title}</Text>
                      {blockHeight >= 46 ? <Text numberOfLines={1} style={styles.eventBlockTime}>{formatTimeRange(entry.startsAt, entry.endsAt)}</Text> : null}
                    </Pressable>
                  );
                })}
                {isSelectedDayToday ? (
                  <View pointerEvents="none" style={[styles.currentTimeLine, { top: ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT }]}>
                    <View style={styles.currentTimeDot} />
                    <View style={styles.currentTimeRule} />
                  </View>
                ) : null}
              </View>
            </ScrollView>
            {todayEntries.length === 0 ? (
              <View pointerEvents="none" style={styles.emptyTimelineMessage}>
                <Text style={styles.emptyDayText}>Nothing planned. Add something with +.</Text>
              </View>
            ) : null}
          </View>
        </Animated.View>
      </View>

      <BookingSheet
        entry={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onRemoved={refreshAfterRemoval}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  stage: { flex: 1 },
  monthLayer: { flex: 1, backgroundColor: colors.bg },
  dayLayer: { ...StyleSheet.absoluteFill, backgroundColor: colors.bg },
  headingBlock: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  pageTitle: { ...type.title },
  subtitle: { ...type.label, color: colors.muted, marginTop: spacing.xs },
  monthControls: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  monthArrow: { width: 32, height: 36, justifyContent: 'center', alignItems: 'center' },
  monthLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 17, flex: 1, textAlign: 'center' },
  todayButton: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, justifyContent: 'center' },
  todayButtonText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
  weekdayRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  weekdayCell: { height: 32, alignItems: 'center', justifyContent: 'center' },
  weekdayLabel: { ...type.label, fontSize: 12 },
  weekRow: { flexDirection: 'row' },
  dayCell: { height: 56, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.bg, borderRadius: radius.md },
  selectedDayCell: { borderColor: colors.ink },
  dayNumberWrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  todayNumberWrap: { backgroundColor: colors.ink },
  dayNumber: { color: colors.text, fontFamily: fonts.medium, fontSize: 14 },
  outsideDayNumber: { color: colors.muted },
  todayNumber: { color: colors.bg, fontFamily: fonts.bold },
  dayDots: { height: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  dayDot: { width: 6, height: 6, borderRadius: 3 },
  loadingText: { ...type.meta, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  dayHeader: { backgroundColor: colors.bg },
  dayHeaderRow: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  dayBack: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dayBackMonth: { color: colors.text, fontFamily: fonts.medium, fontSize: 15 },
  addButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  dayDateBlock: { paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.md },
  dayDateTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 22 },
  entryCount: { ...type.label, color: colors.muted, marginTop: spacing.xs },
  headerDivider: { height: 1, backgroundColor: colors.border },
  allDaySection: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  allDayLabel: { ...type.label, width: TIMELINE_GUTTER - spacing.md, paddingTop: spacing.xs, flexShrink: 0 },
  allDayList: { flex: 1, gap: spacing.xs },
  allDayBlock: { minHeight: 28, borderRadius: radius.sm, borderLeftWidth: 3, paddingHorizontal: spacing.sm, justifyContent: 'center' },
  allDayTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 13 },
  bookingBlock: { backgroundColor: colors.accentSoft, borderLeftColor: colors.accent },
  personalBlock: { backgroundColor: colors.surface, borderLeftColor: colors.ink },
  timelineArea: { flex: 1 },
  timeline: { height: HOUR_HEIGHT * 24, position: 'relative' },
  hourRow: { height: HOUR_HEIGHT, flexDirection: 'row', alignItems: 'flex-start' },
  hourLabel: { width: TIMELINE_GUTTER, flexShrink: 0, color: colors.muted, fontFamily: fonts.regular, fontSize: 12, paddingLeft: spacing.md, paddingTop: 1 },
  hourRule: { flex: 1, height: HOUR_HEIGHT, borderTopWidth: 1, borderTopColor: colors.border },
  eventBlock: { position: 'absolute', zIndex: 2, borderRadius: radius.sm, borderLeftWidth: 3, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, overflow: 'hidden' },
  eventBlockTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 14, lineHeight: 18 },
  eventBlockTime: { ...type.meta, fontSize: 11, marginTop: 2 },
  currentTimeLine: { position: 'absolute', zIndex: 3, left: TIMELINE_GUTTER - 10, right: 0, height: 1, flexDirection: 'row', alignItems: 'center' },
  currentTimeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.ink },
  currentTimeRule: { flex: 1, height: 1, backgroundColor: colors.ink },
  emptyTimelineMessage: { ...StyleSheet.absoluteFill, left: TIMELINE_GUTTER, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  emptyDayText: { ...type.body, color: colors.muted, textAlign: 'center' },
});
