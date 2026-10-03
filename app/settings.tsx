import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../constants/theme';

export default function SettingsScreen() { return <View style={styles.screen}><Text style={styles.heading}>Settings</Text><Text style={styles.item}>Preferences and account settings will live here.</Text></View>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background, padding: spacing.md }, heading: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.lg }, item: { color: colors.mutedText, fontSize: 16 } });