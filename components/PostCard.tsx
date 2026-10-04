import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { colors, fonts, spacing, type } from '../constants/theme';
import { useProfile } from '../lib/ProfileContext';
import { getEvent as getDatabaseEvent } from '../services/events';
import type { Event, Post } from '../types';
import { Avatar } from './Avatar';

export function PostCard({ post }: { post: Post }) {
	const { profile: currentProfile, friends } = useProfile();
	const profile = post.user_id === currentProfile.id
		? currentProfile
		: friends.find((friend) => friend.id === post.user_id);
	const [event, setEvent] = useState<Event | null>(null);
	const { width } = useWindowDimensions();
	const username = profile?.username ?? 'A community member';

	useEffect(() => {
		let mounted = true;
		if (!post.event_id) {
			setEvent(null);
			return;
		}
		void getDatabaseEvent(post.event_id)
			.then((loadedEvent) => {
				if (mounted) setEvent(loadedEvent);
			})
			.catch((error: unknown) => {
				console.error('Unable to load post event:', error);
			});
		return () => {
			mounted = false;
		};
	}, [post.event_id]);

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
	caption: { ...type.body },
	captionUsername: { ...type.label, color: colors.text, fontFamily: fonts.bold },
	divider: { height: 1, backgroundColor: colors.border, marginTop: spacing.lg },
});