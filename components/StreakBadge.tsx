import { StyleSheet, Text } from 'react-native';
import { type } from '../constants/theme';

export function StreakBadge({ streak }: { streak: number }) { return <Text style={styles.label}>{'\uD83D\uDD25'} {streak} week streak</Text>; }
const styles = StyleSheet.create({ label: { ...type.label, fontFamily: type.body.fontFamily } });