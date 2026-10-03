import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { PromptCard } from '../../components/PromptCard';
import { colors, spacing } from '../../constants/theme';
import { mockWeeklyPrompt } from '../../lib/mockData';

export default function PromptScreen() { return <View style={styles.screen}><PromptCard prompt={mockWeeklyPrompt} /><Text style={styles.text}>Turn this week's prompt into a plan.</Text><Link href="/explore" asChild><Button onPress={() => undefined}>Find an activity</Button></Link></View>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background, padding: spacing.md, gap: spacing.md }, text: { color: colors.mutedText, fontSize: 16 } });