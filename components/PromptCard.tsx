import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';

type PromptCardProps = { label?: string; title: string; description?: string; onPress?: () => void };

export function PromptCard({ label = "THIS WEEK'S PROMPT", title, description, onPress }: PromptCardProps) {
	return (
		<Pressable onPress={onPress} disabled={!onPress} style={styles.card}>
			<Text style={styles.label}>{label}</Text>
			<Text style={styles.title}>{title}</Text>
			{description ? <Text style={styles.description}>{description}</Text> : null}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: { alignSelf: 'stretch', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
	label: { color: colors.muted, fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 0.6 },
	title: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 23, lineHeight: 30, marginTop: spacing.sm },
	description: { color: colors.muted, fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, marginTop: spacing.sm },
});