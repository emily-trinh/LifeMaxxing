import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EventCard } from '../../components/EventCard';
import { colors, spacing, type } from '../../constants/theme';
import { mockEvents } from '../../lib/mockData';

export default function ExploreScreen() { return <ScrollView style={styles.screen} contentContainerStyle={styles.content}><View style={styles.headingBlock}><Text style={styles.heading}>Explore nearby</Text><Text style={styles.muted}>Fresh options matched to your week.</Text></View>{mockEvents.length ? mockEvents.map((event) => <Link key={event.id} href={`/event/${event.id}`} asChild><EventCard event={event} /></Link>) : <Text style={styles.empty}>No events nearby. Maybe start your own?</Text>}</ScrollView>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.bg }, content: { paddingBottom: spacing.xl }, headingBlock: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.lg }, heading: { ...type.title }, muted: { ...type.body, color: colors.muted, marginTop: spacing.xs }, empty: { ...type.body, color: colors.muted, paddingHorizontal: spacing.md } });