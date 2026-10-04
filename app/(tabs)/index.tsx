import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '../../components/PostCard';
import { PromptCard } from '../../components/PromptCard';
import { colors, fonts, radius, spacing, type } from '../../constants/theme';
import { currentUser, mockPosts } from '../../lib/mockData';
import { useMission } from '../../lib/MissionContext';

function FeedHeader() {
	const { activeEvent } = useMission();

	return (
		<View style={styles.header}>
			<View style={styles.titleRow}>
				<Text style={styles.title}>Lifemaxxing</Text>
				<Pressable accessibilityRole="button" accessibilityLabel={`${currentUser.current_streak} week streak`} onPress={() => router.push('/profile')} style={styles.streakPill}>
					<Text style={styles.flame}>{'\uD83D\uDD25'}</Text>
					<Text style={styles.streakNumber}>{currentUser.current_streak}</Text>
				</Pressable>
			</View>
			<PromptCard
				title={activeEvent.title}
				description={activeEvent.description}
				onPress={() => router.push('/prompt')}
			/>
		</View>
	);
}

export default function HomeScreen() {
	return (
		<SafeAreaView style={styles.screen} edges={['top']}>
			<FlatList
				data={mockPosts}
				keyExtractor={(post) => post.id}
				renderItem={({ item }) => <PostCard post={item} />}
				ListHeaderComponent={FeedHeader}
				ListEmptyComponent={<Text style={styles.empty}>Nothing here yet. Go touch some grass.</Text>}
				showsVerticalScrollIndicator={false}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.bg },
	header: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
	titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
	title: { ...type.title },
	streakPill: { backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: spacing.sm - spacing.xs / 2, paddingHorizontal: spacing.md - spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
	flame: { fontSize: 15 },
	streakNumber: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
	empty: { ...type.body, color: colors.muted, padding: spacing.md },
});