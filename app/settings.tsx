import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '../constants/theme';

export default function SettingsScreen() { return <View style={styles.screen}><Text style={styles.heading}>Settings</Text><Text style={styles.item}>Preferences and account settings will live here.</Text></View>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.md }, heading: { ...type.title, marginBottom: spacing.lg }, item: { ...type.body, color: colors.muted } });