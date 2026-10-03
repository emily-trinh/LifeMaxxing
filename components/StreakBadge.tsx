import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../constants/theme';

export function StreakBadge({ streak }: { streak: number }) { return <View style={styles.badge}><Text style={styles.number}>{streak}</Text><Text style={styles.label}>week streak</Text></View>; }
const styles = StyleSheet.create({ badge: { backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'center' }, number: { color: colors.text, fontSize: 22, fontWeight: '800' }, label: { color: colors.text, fontSize: 11, fontWeight: '700' } });