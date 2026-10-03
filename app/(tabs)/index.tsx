import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EventCard } from '../../components/EventCard';
import { PostCard } from '../../components/PostCard';
import { PromptCard } from '../../components/PromptCard';
import { StreakBadge } from '../../components/StreakBadge';
import { colors, spacing } from '../../constants/theme';
import { mockEvents, mockPosts, mockProfiles, mockWeeklyPrompt } from '../../lib/mockData';

export default function HomeScreen() { return <ScrollView style={styles.screen} contentContainerStyle={styles.content}><View style={styles.header}><View><Text style={styles.greeting}>Good morning, Maya</Text><Text style={styles.muted}>A small change starts here.</Text></View><StreakBadge streak={mockProfiles[0].current_streak} /></View><PromptCard prompt={mockWeeklyPrompt} /><Text style={styles.section}>Your next recommendation</Text><Link href="/event/event-3" asChild><View><EventCard event={mockEvents[2]} /></View></Link><Text style={styles.section}>Community lately</Text><PostCard post={mockPosts[0]} /></ScrollView>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.md }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }, greeting: { color: colors.text, fontSize: 25, fontWeight: '800' }, muted: { color: colors.mutedText, marginTop: spacing.xs }, section: { color: colors.text, fontSize: 19, fontWeight: '800', marginVertical: spacing.md } });