import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../../constants/theme';

export default function CreatePostScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Create post</Text>
      <Text style={styles.eventId}>{eventId ?? 'No event selected'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.md, paddingTop: spacing.xl },
  title: { color: colors.text, fontFamily: fonts.serifBold, fontSize: 30 },
  eventId: { color: colors.muted, fontFamily: fonts.sans, fontSize: 15, marginTop: spacing.md },
});