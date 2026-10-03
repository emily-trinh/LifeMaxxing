import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '../../components/PostCard';
import { PromptCard } from '../../components/PromptCard';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { currentUser, mockPosts, mockWeeklyPrompt } from '../../lib/mockData';

function FeedHeader() {
	return (
		<View style={styles.header}>
			<View style={styles.titleRow}>
				<Text style={styles.title}>Lifemaxxing</Text>
				<View style={styles.streak}>
					<Text style={styles.flame}>{'\uD83D\uDD25'}</Text>
					<Text style={styles.streakNumber}>{currentUser.current_streak}</Text>
				</View>
			</View>
			<PromptCard
				title={mockWeeklyPrompt.title}
				description={mockWeeklyPrompt.description}
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
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.bg },
	content: { padding: spacing.md },
	header: { marginBottom: spacing.lg },
	titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
	title: { color: colors.text, fontFamily: fonts.sansBold, fontSize: 29 },
	streak: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
	flame: { fontSize: 15 },
	streakNumber: { color: colors.accent, fontFamily: fonts.sansBold, fontSize: 14 },
});