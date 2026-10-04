import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '../../constants/theme';

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
  title: { ...type.title },
  eventId: { ...type.body, color: colors.muted, marginTop: spacing.md },
});