import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { EventCard } from '../../components/EventCard';
import { colors, fonts, spacing } from '../../constants/theme';
import { mockEvents } from '../../lib/mockData';

export default function ExploreScreen() { return <ScrollView style={styles.screen} contentContainerStyle={styles.content}><Text style={styles.heading}>Explore nearby</Text><Text style={styles.muted}>Fresh options matched to your week.</Text>{mockEvents.map((event) => <Link key={event.id} href={`/event/${event.id}`} asChild><EventCard event={event} /></Link>)}</ScrollView>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.bg }, content: { padding: spacing.md }, heading: { color: colors.text, fontFamily: fonts.sansBold, fontSize: 27 }, muted: { color: colors.muted, fontFamily: fonts.sans, marginTop: spacing.xs, marginBottom: spacing.lg } });