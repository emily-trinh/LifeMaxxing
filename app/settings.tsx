import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { colors, spacing } from '../constants/theme';

export default function SettingsScreen() { return <View style={styles.screen}><Text style={styles.heading}>Settings</Text><Text style={styles.item}>Preferences and account settings will live here.</Text><Link href="/ai-test" asChild><Button onPress={() => undefined} variant="secondary">Open AI test</Button></Link></View>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background, padding: spacing.md, gap: spacing.md }, heading: { color: colors.text, fontSize: 28, fontWeight: '800' }, item: { color: colors.mutedText, fontSize: 16 } });