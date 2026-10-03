import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../constants/theme';
import type { WeeklyPrompt } from '../types';

export function PromptCard({ prompt }: { prompt: WeeklyPrompt }) { return <View style={styles.card}><Text style={styles.eyebrow}>{prompt.category} · Weekly prompt</Text><Text style={styles.title}>{prompt.title}</Text><Text style={styles.description}>{prompt.description}</Text></View>; }
const styles = StyleSheet.create({ card: { backgroundColor: colors.primaryDark, borderRadius: 14, padding: spacing.lg }, eyebrow: { color: colors.accent, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' }, title: { color: colors.surface, fontSize: 24, fontWeight: '800', marginTop: spacing.sm }, description: { color: '#D8E9DF', fontSize: 16, lineHeight: 23, marginTop: spacing.sm } });