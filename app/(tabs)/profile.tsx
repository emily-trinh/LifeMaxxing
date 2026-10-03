import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { StreakBadge } from '../../components/StreakBadge';
import { colors, fonts, spacing } from '../../constants/theme';
import { currentUser } from '../../lib/mockData';

export default function ProfileScreen() { return <View style={styles.screen}><Text style={styles.heading}>@{currentUser.username}</Text><Text style={styles.muted}>{currentUser.interests.join(' · ')}</Text><StreakBadge streak={currentUser.current_streak} /><View style={styles.button}><Link href="/settings" asChild><Button label="Settings" onPress={() => undefined} variant="outline" /></Link></View></View>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.md }, heading: { color: colors.text, fontFamily: fonts.sansBold, fontSize: 27 }, muted: { color: colors.muted, fontFamily: fonts.sans, marginVertical: spacing.md }, button: { marginTop: spacing.lg } });