import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { getEvent, getProfile } from '../lib/mockData';
import type { Post } from '../types';
import { Avatar } from './Avatar';

export function PostCard({ post }: { post: Post }) {
	const profile = getProfile(post.user_id);
	const event = getEvent(post.event_id);
	const [liked, setLiked] = useState(false);
	const username = profile?.username ?? 'A community member';

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<Avatar name={username} url={profile?.avatar_url} size={36} />
				<View style={styles.identity}>
					<Text style={styles.username}>{username}</Text>
					<Text style={styles.event}>{event?.title ?? 'A recent activity'}</Text>
				</View>
			</View>
			<View style={styles.photoFrame}>
				<Image source={{ uri: post.media_url }} style={styles.image} />
			</View>
			<View style={styles.actions}>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
					onPress={() => setLiked((value) => !value)}
					hitSlop={8}>
					<Text style={[styles.heart, liked && styles.liked]}>{liked ? '\u2665' : '\u2661'}</Text>
				</Pressable>
			</View>
			<Text style={styles.caption}>
				<Text style={styles.captionUsername}>{username} </Text>
				{post.caption}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	card: { marginBottom: spacing.xl },
	header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
	identity: { marginLeft: spacing.sm },
	username: { color: colors.text, fontFamily: fonts.sansBold, fontSize: 14 },
	event: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12, marginTop: 2 },
	photoFrame: { width: '100%', aspectRatio: 4 / 5, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.border },
	image: { width: '100%', height: '100%' },
	actions: { flexDirection: 'row', alignItems: 'center', height: 42, marginTop: spacing.xs },
	heart: { color: colors.ink, fontSize: 26, lineHeight: 32 },
	liked: { color: colors.accent },
	caption: { color: colors.text, fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
	captionUsername: { color: colors.text, fontFamily: fonts.sansBold, fontSize: 14 },
});