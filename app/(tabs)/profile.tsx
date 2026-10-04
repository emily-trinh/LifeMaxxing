import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatEventDate } from '../../lib/format';
import { Avatar } from '../../components/Avatar';
import { Chip } from '../../components/Chip';
import { colors, fonts, radius, spacing, type } from '../../constants/theme';
import { getFriends } from '../../lib/mockData';
import { useProfile } from '../../lib/ProfileContext';
import { getMyActivities } from '../../services/eventService';
import { getPostsByUser } from '../../services/postService';
import type { Event, Post } from '../../types';

type ProfileTab = 'posts' | 'activities' | 'friends';
const GRID_GAP = 1;

export default function ProfileScreen() {
	const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
	const { width } = useWindowDimensions();
	const { profile } = useProfile();
	const [userPosts, setUserPosts] = useState<Post[]>([]);
	const [activities, setActivities] = useState<{ event: Event; status: 'going' | 'booked' }[]>([]);
	const friends = getFriends();
	const thumbnailSize = Math.floor((width - GRID_GAP * 2) / 3);
	const postRows: Post[][] = [];
	for (let index = 0; index < userPosts.length; index += 3) {
		postRows.push(userPosts.slice(index, index + 3));
	}
	const interests = profile.preferences.interests.map((interest) => `${interest.charAt(0).toUpperCase()}${interest.slice(1)}`);
	const groupPreference = profile.preferences.group_mode === 'solo'
		? 'Solo only'
		: profile.preferences.group_mode === 'group'
			? 'Group only'
			: 'Solo or group';
	useFocusEffect(useCallback(() => {
		setUserPosts(getPostsByUser(profile.id));
		void getMyActivities().then(setActivities);
	}, [profile.id]));

	return (
		<SafeAreaView style={styles.screen} edges={['top']}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<Text style={styles.title}>Profile</Text>
					<Pressable onPress={() => router.push('/settings')} hitSlop={spacing.sm} accessibilityRole="button" accessibilityLabel="Settings">
						<Ionicons name="settings-outline" size={24} color={colors.text} />
					</Pressable>
				</View>

				<View style={styles.account}>
					<Avatar name={profile.username} url={profile.avatar_url} size={72} />
					<View style={styles.accountCopy}>
						<View style={styles.usernameRow}>
							<Text style={styles.username} numberOfLines={1}>{profile.username}</Text>
							<View style={styles.streakPill}>
								<Text style={styles.streakFlame}>{'\uD83D\uDD25'}</Text>
								<Text style={styles.streakNumber}>{profile.current_streak}</Text>
							</View>
						</View>
						<Text style={styles.accountMeta}>{profile.preferences.radius_km} km radius · ${profile.preferences.min_price} to ${profile.preferences.max_price}</Text>
					</View>
				</View>
				<View style={styles.chips}>
					{interests.map((interest) => <Chip key={interest} label={interest} />)}
					<Chip label={groupPreference} />
				</View>

				<View style={styles.stats}>
					<Stat value={userPosts.length} label="Posts" />
					<Stat value={friends.length} label="Friends" />
				</View>

				<View style={styles.tabs}>
					<Pressable onPress={() => setActiveTab('posts')} style={[styles.tab, activeTab === 'posts' ? styles.activeTab : styles.inactiveTab]}>
						<Text style={[styles.tabText, activeTab === 'posts' ? styles.activeTabText : styles.inactiveTabText]}>Posts</Text>
					</Pressable>
					<Pressable onPress={() => setActiveTab('activities')} style={[styles.tab, activeTab === 'activities' ? styles.activeTab : styles.inactiveTab]}>
						<Text style={[styles.tabText, activeTab === 'activities' ? styles.activeTabText : styles.inactiveTabText]}>Activities</Text>
					</Pressable>
					<Pressable onPress={() => setActiveTab('friends')} style={[styles.tab, activeTab === 'friends' ? styles.activeTab : styles.inactiveTab]}>
						<Text style={[styles.tabText, activeTab === 'friends' ? styles.activeTabText : styles.inactiveTabText]}>Friends</Text>
					</Pressable>
				</View>

				{activeTab === 'posts' ? (
					userPosts.length ? (
						<View style={styles.postGrid}>
							{postRows.map((row, rowIndex) => (
								<View key={`post-row-${rowIndex}`} style={styles.postRow}>
									{row.map((post, index) => (
										<Pressable
											key={post.id}
											onPress={() => router.push({ pathname: '/post/feed', params: { userId: profile.id, postId: post.id } })}
											style={[styles.thumbnail, { width: thumbnailSize, height: thumbnailSize, marginRight: index < 2 ? GRID_GAP : 0 }]}>
											<Image source={{ uri: post.media_url }} style={{ width: thumbnailSize, height: thumbnailSize }} resizeMode="cover" />
											{post.media_type === 'video' ? (
												<Ionicons name="play" size={16} color={colors.bg} style={styles.playIcon} />
											) : null}
										</Pressable>
									))}
									{Array.from({ length: 3 - row.length }, (_, index) => {
										const slotIndex = row.length + index;
										return <View key={`empty-${slotIndex}`} style={[styles.emptyThumbnail, { width: thumbnailSize, height: thumbnailSize, marginRight: slotIndex < 2 ? GRID_GAP : 0 }]} />;
									})}
								</View>
							))}
						</View>
					) : (
						<Text style={styles.empty}>No posts yet. Go do something worth posting.</Text>
					)
				) : activeTab === 'activities' ? (
					activities.length ? (
						<View>
							{activities.map(({ event, status }, index) => (
								<View key={event.id}>
									<Pressable onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })} style={styles.activityRow}>
										{event.image_url ? <Image source={{ uri: event.image_url }} style={styles.activityImage} resizeMode="cover" /> : <View style={styles.activityImage} />}
										<View style={styles.activityCopy}>
											<Text style={styles.activityTitle} numberOfLines={1}>{event.title}</Text>
											<Text style={styles.activityMeta} numberOfLines={2}>{formatEventDate(event.start_time)} · {event.address}</Text>
											<Text style={styles.activityStatus}>{status === 'booked' ? 'Booked 🎟️' : "You're in 🎉"}</Text>
										</View>
									</Pressable>
									{index < activities.length - 1 ? <View style={styles.friendDivider} /> : null}
								</View>
							))}
						</View>
					) : (
						<Text style={styles.empty}>Nothing booked yet. Check out Explore.</Text>
					)
				) : (
					friends.length ? (
						<View>
							{friends.map((friend, index) => (
								<View key={friend.id}>
									<View style={styles.friendRow}>
										<Avatar name={friend.username} url={friend.avatar_url} size={44} />
										<View style={styles.friendCopy}>
											<Text style={styles.friendName}>{friend.username}</Text>
											<Text style={styles.friendMeta}>{'\uD83D\uDD25'} {friend.current_streak} week streak</Text>
										</View>
									</View>
									{index < friends.length - 1 ? <View style={styles.friendDivider} /> : null}
								</View>
							))}
						</View>
					) : (
						<Text style={styles.empty}>No friends yet. Invite someone to join you.</Text>
					)
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

function Stat({ value, label }: { value: number; label: string }) {
	return (
		<View style={styles.stat}>
			<Text style={styles.statValue}>{value}</Text>
			<Text style={styles.statLabel}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.bg },
	scrollContent: { paddingBottom: spacing.xl },
	header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.md },
	title: { ...type.title },
	account: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
	accountCopy: { flex: 1 },
	usernameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
	username: { color: colors.text, fontFamily: fonts.bold, fontSize: 20, flexShrink: 1 },
	streakPill: { backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: spacing.xs, paddingHorizontal: spacing.md - spacing.xs - spacing.xs / 2, flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
	streakFlame: { fontSize: 14 },
	streakNumber: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
	accountMeta: { ...type.label, marginTop: spacing.xs },
	chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.md, marginTop: spacing.md },
	stats: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.lg },
	stat: { flex: 1, alignItems: 'center', gap: spacing.xs },
	statValue: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 },
	statLabel: { ...type.label },
	tabs: { flexDirection: 'row', marginHorizontal: spacing.md, marginBottom: spacing.sm },
	tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
	activeTab: { borderBottomWidth: 2, borderBottomColor: colors.ink },
	inactiveTab: { borderBottomWidth: 1, borderBottomColor: colors.border },
	tabText: { fontFamily: fonts.medium, fontSize: 15 },
	activeTabText: { color: colors.ink },
	inactiveTabText: { color: colors.muted },
	postGrid: {},
	postRow: { flexDirection: 'row', marginBottom: GRID_GAP },
	thumbnail: { position: 'relative' },
	emptyThumbnail: {},
	playIcon: { position: 'absolute', top: spacing.sm, right: spacing.sm },
	empty: { ...type.body, color: colors.muted, textAlign: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xl },
	friendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
	friendCopy: { flex: 1 },
	friendName: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
	friendMeta: { ...type.label, marginTop: spacing.xs },
	friendDivider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md },
	activityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
	activityImage: { width: spacing.xl * 2 + spacing.sm, height: spacing.xl * 2 + spacing.sm, borderRadius: radius.sm, backgroundColor: colors.surface },
	activityCopy: { flex: 1, flexShrink: 1 },
	activityTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
	activityMeta: { ...type.label, marginTop: spacing.xs },
	activityStatus: { color: colors.accent, fontFamily: fonts.medium, fontSize: 13, marginTop: spacing.xs },
});
