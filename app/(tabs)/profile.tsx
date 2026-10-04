import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { StreakBadge } from '../../components/StreakBadge';
import { colors, spacing } from '../../constants/theme';
import { mockProfiles } from '../../lib/mockData';

export default function ProfileScreen() { const profile = mockProfiles[0]; return <View style={styles.screen}><Text style={styles.heading}>@{profile.username}</Text><Text style={styles.muted}>{profile.preferences.interests.join(' · ')}</Text><StreakBadge streak={profile.current_streak} /><View style={styles.button}><Link href="/settings" asChild><Button onPress={() => undefined} variant="secondary">Settings</Button></Link></View></View>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background, padding: spacing.md }, heading: { color: colors.text, fontSize: 28, fontWeight: '800' }, muted: { color: colors.mutedText, marginVertical: spacing.md }, button: { marginTop: spacing.lg } });