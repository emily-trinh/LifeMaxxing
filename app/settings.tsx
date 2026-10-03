import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';

export default function SettingsScreen() { return <View style={styles.screen}><Text style={styles.heading}>Settings</Text><Text style={styles.item}>Preferences and account settings will live here.</Text></View>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.md }, heading: { color: colors.text, fontFamily: fonts.sansBold, fontSize: 27, marginBottom: spacing.lg }, item: { color: colors.muted, fontFamily: fonts.sans, fontSize: 16 } });