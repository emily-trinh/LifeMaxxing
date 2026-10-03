import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';

export function StreakBadge({ streak }: { streak: number }) { return <View style={styles.badge}><Text style={styles.number}>\uD83D\uDD25 {streak}</Text><Text style={styles.label}>week streak</Text></View>; }
const styles = StyleSheet.create({ badge: { alignSelf: 'flex-start', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'center' }, number: { color: colors.accent, fontFamily: fonts.sansBold, fontSize: 18 }, label: { color: colors.muted, fontFamily: fonts.sansMedium, fontSize: 11 } });