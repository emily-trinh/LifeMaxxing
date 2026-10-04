import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { BookingSheet } from '../../components/BookingSheet';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { colors, fonts, radius, spacing, type } from '../../constants/theme';
import { useProfile } from '../../lib/ProfileContext';
import { useMission } from '../../lib/MissionContext';
import { formatLongDate, formatTimeRange } from '../../lib/format';
import { getMyBookings } from '../../services/calendarService';
import { getFriends, removeFriend } from '../../services/friendService';
import { getPostsByUser } from '../../services/postService';
import type { Post, Profile } from '../../types';
import type { CalendarEntry } from '../../types/activity';

type ProfileTab = 'posts' | 'activities' | 'friends';
const GRID_GAP = 1;

export default function ProfileScreen() {
	const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
	const { width } = useWindowDimensions();
	const { profile } = useProfile();
	const { simulatedDate } = useMission();
	const [userPosts, setUserPosts] = useState<Post[]>([]);
	const [bookings, setBookings] = useState<CalendarEntry[]>([]);
	const [loadingBookings, setLoadingBookings] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState<CalendarEntry | null>(null);
	const [friends, setFriends] = useState<Profile[]>([]);
	const [loadingFriends, setLoadingFriends] = useState(false);
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
		let mounted = true;
		setLoadingFriends(true);
		setLoadingBookings(true);

		void getPostsByUser(profile.id).then(setUserPosts).catch((error: unknown) => console.error(error));
		void getMyBookings()
			.then((nextBookings) => {
				if (mounted) setBookings(nextBookings);
			})
			.catch((error: unknown) => {
				if (mounted) {
					setBookings([]);
					Alert.alert('Unable to load activities', error instanceof Error ? error.message : 'Please try again.');
				}
			})
			.finally(() => {
				if (mounted) setLoadingBookings(false);
			});
		void getFriends(profile.id)
			.then((nextFriends) => {
				if (mounted) setFriends(nextFriends);
			})
			.catch((error: unknown) => {
				console.error(error);
				if (mounted) setFriends([]);
			})
			.finally(() => {
				if (mounted) setLoadingFriends(false);
			});

		return () => {
			mounted = false;
		};
	}, [profile.id]));

	const configuredDayStart = new Date(simulatedDate);
	configuredDayStart.setHours(0, 0, 0, 0);
	const upcomingBookings = bookings.filter((entry) => new Date(entry.startsAt).getTime() >= configuredDayStart.getTime());

	function refreshBookings() {
		void getMyBookings()
			.then(setBookings)
			.catch((error: unknown) => Alert.alert('Unable to refresh activities', error instanceof Error ? error.message : 'Please try again.'));
	}

	async function handleRemoveFriend(friend: Profile) {
		Alert.alert('Remove friend?', `${friend.username} won't be notified.`, [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Remove',
				style: 'destructive',
				onPress: async () => {
					const previousFriends = friends;
					setFriends((current) => current.filter((entry) => entry.id !== friend.id));
					try {
						await removeFriend(profile.id, friend.id);
					} catch (error) {
						setFriends(previousFriends);
						Alert.alert("Couldn't remove friend", error instanceof Error ? error.message : 'Please try again.');
					}
				},
			},
		]);
	}

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
					loadingBookings ? (
						<Text style={styles.empty}>Loading activities...</Text>
					) : upcomingBookings.length ? (
						<View>
							<Text style={styles.activitySectionLabel}>Upcoming</Text>
							{upcomingBookings.map((entry, index) => (
								<BookingRow key={entry.id} entry={entry} last={index === upcomingBookings.length - 1} onPress={() => setSelectedBooking(entry)} />
							))}
						</View>
					) : (
						<Text style={styles.empty}>Nothing booked yet. Check out Explore.</Text>
					)
				) : (
					<View>
						<View style={styles.addFriendsWrap}>
							<Button label="Add friends" variant="outline" onPress={() => router.push('/friends/add')} />
						</View>
						{loadingFriends ? (
							<Text style={styles.empty}>Loading friends...</Text>
						) : friends.length ? (
							<View>
								{friends.map((friend, index) => (
									<View key={friend.id}>
										<View style={styles.friendRow}>
											<Avatar name={friend.username} url={friend.avatar_url} size={44} />
											<View style={styles.friendCopy}>
												<Text style={styles.friendName} numberOfLines={1}>{friend.username}</Text>
												<Text style={styles.friendMeta} numberOfLines={1}>{'\uD83D\uDD25'} {friend.current_streak} week streak</Text>
											</View>
											<Pressable
												onPress={() => handleRemoveFriend(friend)}
												style={styles.removeButton}
												accessibilityRole="button"
												accessibilityLabel={`Remove ${friend.username} as a friend`}
											>
												<Text style={styles.removeButtonText}>Remove</Text>
											</Pressable>
										</View>
										{index < friends.length - 1 ? <View style={styles.friendDivider} /> : null}
									</View>
								))}
							</View>
						) : (
							<Text style={styles.empty}>No friends yet. Tap Add friends to find people.</Text>
						)}
					</View>
				)}
			</ScrollView>
			<BookingSheet
				entry={selectedBooking}
				onClose={() => setSelectedBooking(null)}
				onRemoved={refreshBookings}
			/>
		</SafeAreaView>
	);
}

function BookingRow({ entry, last, onPress }: { entry: CalendarEntry; last: boolean; onPress: () => void }) {
	const venue = entry.event?.venueName || entry.event?.address;
	const time = entry.allDay ? 'All day' : formatTimeRange(entry.startsAt, entry.endsAt);
	const subtitle = [formatLongDate(entry.startsAt), time, venue].filter(Boolean).join(' · ');

	return (
		<View>
			<Pressable onPress={onPress} style={styles.activityRow} accessibilityRole="button">
				{entry.event?.imageUrl ? (
					<Image source={{ uri: entry.event.imageUrl }} style={styles.activityImage} resizeMode="cover" />
				) : (
					<View style={[styles.activityImage, styles.activityImagePlaceholder]}>
						<Ionicons name="calendar-outline" size={24} color={colors.muted} />
					</View>
				)}
				<View style={styles.activityCopy}>
					<Text style={styles.activityTitle} numberOfLines={1}>{entry.title}</Text>
					<Text style={styles.activityMeta} numberOfLines={1}>{subtitle}</Text>
					<Text style={styles.activityStatus}>{entry.status === 'booked' ? 'Booked 🎟️' : "You're in 🎉"}</Text>
				</View>
			</Pressable>
			{!last ? <View style={styles.friendDivider} /> : null}
		</View>
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
	friendMeta: { ...type.label, marginTop: spacing.xs, color: colors.muted },
	friendDivider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md },
	addFriendsWrap: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
	removeButton: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 6, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
	removeButtonText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14 },
	activityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
	activityImage: { width: 72, height: 72, borderRadius: radius.sm, backgroundColor: colors.surface },
	activityImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
	activityCopy: { flex: 1, flexShrink: 1 },
	activityTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
	activityMeta: { ...type.label, color: colors.muted, marginTop: spacing.xs },
	activityStatus: { color: colors.accent, fontFamily: fonts.medium, fontSize: 13, marginTop: spacing.xs },
	activitySectionLabel: { ...type.label, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xs },
});
