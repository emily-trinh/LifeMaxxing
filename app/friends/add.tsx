import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar } from '../../components/Avatar';
import { colors, fonts, radius, spacing, type } from '../../constants/theme';
import { useProfile } from '../../lib/ProfileContext';
import { addFriend, getSuggestions } from '../../services/friendService';
import type { Profile } from '../../types';

export default function AddFriendsScreen() {
  const { profile } = useProfile();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    void getSuggestions(profile.id, query)
      .then((nextSuggestions) => {
        if (mounted) setSuggestions(nextSuggestions);
      })
      .catch((error: unknown) => {
        if (mounted) {
          setSuggestions([]);
          Alert.alert("Couldn't load suggestions", error instanceof Error ? error.message : 'Please try again.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [profile.id, query]);

  async function handleAddFriend(friendId: string) {
    setPendingId(friendId);

    try {
      await addFriend(profile.id, friendId);
      setAddedIds((current) => [...current, friendId]);
      setSuggestions((current) => current.filter((person) => person.id !== friendId));
    } catch (error) {
      Alert.alert("Couldn't add friend", error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={spacing.sm}
          >
            <Ionicons name="chevron-back" size={24} color={colors.ink} />
          </Pressable>
          <Text style={styles.title}>Add friends</Text>
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by username"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.searchInput}
        />

        {loading ? (
          <Text style={styles.emptyText}>Looking for people…</Text>
        ) : suggestions.length === 0 ? (
          <Text style={styles.emptyText}>No people found.</Text>
        ) : (
          suggestions.map((person) => {
            const isAdded = addedIds.includes(person.id);
            const isPending = pendingId === person.id;

            return (
              <View key={person.id} style={styles.personRow}>
                <Avatar name={person.username} url={person.avatar_url} size={44} />
                <View style={styles.personCopy}>
                  <Text style={styles.personName}>{person.username}</Text>
                  <Text style={styles.personMeta}>{person.current_streak} week streak</Text>
                </View>
                <Pressable
                  onPress={() => void handleAddFriend(person.id)}
                  style={[styles.addButton, isAdded && styles.addButtonDone]}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${person.username} as a friend`}
                  disabled={isAdded || isPending}
                >
                  <Text style={[styles.addButtonText, isAdded && styles.addButtonDoneText]}>
                    {isAdded ? 'Added ✓' : isPending ? '...' : 'Add'}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backButton: { width: spacing.xl + spacing.sm, height: spacing.xl + spacing.sm, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.heading },
  searchInput: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  personCopy: { flex: 1 },
  personName: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  personMeta: { ...type.label, marginTop: spacing.xs },
  addButton: {
    minWidth: 72,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDone: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  addButtonText: { color: colors.ink, fontFamily: fonts.medium, fontSize: 13 },
  addButtonDoneText: { color: colors.accent },
  emptyText: { ...type.body, color: colors.muted, marginTop: spacing.sm },
});
