import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { colors, fonts, radius, spacing, type } from '../constants/theme';
import { useProfile } from '../lib/ProfileContext';
import type { GroupMode } from '../types';

const interestOptions = ['hiking', 'food', 'cycling', 'music', 'art', 'cooking', 'wellness', 'books', 'film', 'climbing', 'gardening', 'photography', 'travel', 'volunteering', 'dancing', 'games'];
const groupOptions: { label: string; value: GroupMode }[] = [
	{ label: 'Solo', value: 'solo' },
	{ label: 'Group', value: 'group' },
	{ label: 'Either', value: 'either' },
];

export default function SettingsScreen() {
	const { profile, updateProfile } = useProfile();
	const [radiusKm, setRadiusKm] = useState(profile.radius_km);
	const [minPrice, setMinPrice] = useState(profile.min_price);
	const [maxPrice, setMaxPrice] = useState(profile.max_price);
	const [interests, setInterests] = useState(profile.interests);
	const [groupMode, setGroupMode] = useState<GroupMode>(profile.group_mode);
	const [saved, setSaved] = useState(false);
	const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const unchanged = radiusKm === profile.radius_km
		&& minPrice === profile.min_price
		&& maxPrice === profile.max_price
		&& groupMode === profile.group_mode
		&& interests.length === profile.interests.length
		&& interests.every((interest) => profile.interests.includes(interest));

	function toggleInterest(interest: string) {
		setInterests((current) => current.includes(interest)
			? current.filter((item) => item !== interest)
			: [...current, interest]);
	}

	function saveChanges() {
		updateProfile({ radius_km: radiusKm, min_price: minPrice, max_price: maxPrice, interests, group_mode: groupMode });
		setSaved(true);
		saveTimer.current = setTimeout(() => router.back(), 1200);
	}

	return (
		<SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()} style={styles.headerSide} accessibilityRole="button" accessibilityLabel="Go back">
					<Ionicons name="chevron-back" size={24} color={colors.ink} />
				</Pressable>
				<Text style={styles.headerTitle}>Settings</Text>
				<View style={styles.headerSide} />
			</View>
			<View style={styles.divider} />
			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<View style={styles.section}>
					<View style={styles.sectionHeading}>
						<Text style={styles.sectionLabel}>Activity radius</Text>
						<Text style={styles.sectionValue}>{radiusKm} km</Text>
					</View>
					<Slider
						value={radiusKm}
						onValueChange={setRadiusKm}
						minimumValue={1}
						maximumValue={50}
						step={1}
						minimumTrackTintColor={colors.ink}
						maximumTrackTintColor={colors.border}
						thumbTintColor={colors.ink}
					/>
				</View>

				<View style={styles.section}>
					<View style={styles.sectionHeading}>
						<Text style={styles.sectionLabel}>Price range</Text>
						<Text style={styles.sectionValue}>{maxPrice === 0 ? 'Free only' : `$${minPrice} to $${maxPrice}`}</Text>
					</View>
					<Text style={styles.sliderLabel}>Min</Text>
					<Slider
						value={minPrice}
						onValueChange={(value) => {
							setMinPrice(value);
							if (value > maxPrice) setMaxPrice(value);
						}}
						minimumValue={0}
						maximumValue={200}
						step={5}
						minimumTrackTintColor={colors.ink}
						maximumTrackTintColor={colors.border}
						thumbTintColor={colors.ink}
					/>
					<Text style={styles.sliderLabel}>Max</Text>
					<Slider
						value={maxPrice}
						onValueChange={(value) => {
							setMaxPrice(value);
							if (value < minPrice) setMinPrice(value);
						}}
						minimumValue={0}
						maximumValue={200}
						step={5}
						minimumTrackTintColor={colors.ink}
						maximumTrackTintColor={colors.border}
						thumbTintColor={colors.ink}
					/>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Interests</Text>
					<View style={styles.chips}>
						{Array.from(new Set([...interestOptions, ...interests])).map((interest) => (
							<Chip
								key={interest}
								label={`${interest.charAt(0).toUpperCase()}${interest.slice(1)}`}
								selected={interests.includes(interest)}
								onPress={() => toggleInterest(interest)}
							/>
						))}
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Who do you want to do activities with?</Text>
					<View style={styles.groupSelector}>
						{groupOptions.map((option) => {
							const selected = groupMode === option.value;
							return (
								<Pressable key={option.value} onPress={() => setGroupMode(option.value)} style={[styles.groupOption, selected && styles.selectedGroupOption]}>
									<Text style={[styles.groupLabel, selected && styles.selectedGroupLabel]}>{option.label}</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				<View style={styles.saveButton}>
					<Button label={saved ? 'Saved ✓' : 'Save changes'} onPress={saveChanges} disabled={unchanged || saved} />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.bg },
	header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
	headerSide: { width: spacing.xl, alignItems: 'flex-start' },
	headerTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
	divider: { height: 1, backgroundColor: colors.border },
	content: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xl + spacing.lg },
	section: { paddingBottom: spacing.lg, marginBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
	sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	sectionLabel: { ...type.label },
	sectionValue: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
	sliderLabel: { ...type.label, marginTop: spacing.sm },
	chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
	groupSelector: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden', marginTop: spacing.md },
	groupOption: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, backgroundColor: colors.bg },
	selectedGroupOption: { backgroundColor: colors.ink },
	groupLabel: { ...type.label, color: colors.text },
	selectedGroupLabel: { color: colors.bg },
	saveButton: { paddingTop: spacing.xs },
});