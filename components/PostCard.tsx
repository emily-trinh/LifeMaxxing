import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, type } from '../constants/theme';
import { getEvent, getProfile } from '../lib/mockData';
import type { Post } from '../types';
import { Avatar } from './Avatar';

export function PostCard({ post }: { post: Post }) {
	const profile = getProfile(post.user_id);
	const event = getEvent(post.event_id);
	const { width } = useWindowDimensions();
	const [liked, setLiked] = useState(false);
	const username = profile?.username ?? 'A community member';

	return (
		<View style={styles.card}>
			<View style={styles.textRow}>
				<View style={styles.header}>
					<Avatar name={username} url={profile?.avatar_url} size={32} />
					<View style={styles.identity}>
						<Text style={styles.username}>{username}</Text>
						<Text style={styles.event}>{event?.title ?? 'A recent activity'}</Text>
					</View>
				</View>
			</View>
			<Image source={{ uri: post.media_url }} style={{ width, height: width }} resizeMode="cover" />
			<View style={[styles.textRow, styles.content]}>
				<View style={styles.actions}>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
					onPress={() => setLiked((value) => !value)}
					hitSlop={8}>
					<Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? colors.accent : colors.text} />
				</Pressable>
				</View>
				<Text style={styles.caption}>
					<Text style={styles.captionUsername}>{username} </Text>
					{post.caption}
				</Text>
			</View>
			<View style={styles.divider} />
		</View>
	);
}

const styles = StyleSheet.create({
	card: { marginBottom: spacing.md },
	textRow: { paddingHorizontal: spacing.md },
	header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingTop: spacing.sm },
	identity: { marginLeft: spacing.sm },
	username: { ...type.label, color: colors.text, fontFamily: fonts.bold },
	event: { ...type.meta, marginTop: spacing.xs / 2 },
	content: { paddingTop: spacing.xs },
	actions: { flexDirection: 'row', alignItems: 'center', height: spacing.xl, marginTop: spacing.xs },
	caption: { ...type.body },
	captionUsername: { ...type.label, color: colors.text, fontFamily: fonts.bold },
	divider: { height: 1, backgroundColor: colors.border, marginTop: spacing.lg },
});