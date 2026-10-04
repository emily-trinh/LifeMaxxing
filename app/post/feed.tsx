import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '../../components/PostCard';
import { colors, fonts, spacing, type } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getPostsByUser } from '../../services/postService';
import type { Post } from '../../types';

export default function PostFeedScreen() {
  const params = useLocalSearchParams<{ userId: string; postId: string }>();
  const userId = Array.isArray(params.userId) ? params.userId[0] ?? '' : params.userId ?? '';
  const postId = Array.isArray(params.postId) ? params.postId[0] ?? '' : params.postId ?? '';
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const yPositions = useRef<Record<string, number>>({});
  const hasScrolled = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setPosts([]);
      return;
    }

    let mounted = true;
    setReady(false);
    void getPostsByUser(userId)
      .then((loadedPosts) => {
        if (mounted) setPosts(loadedPosts);
      })
      .catch((error: unknown) => console.error(error));
    return () => {
      mounted = false;
    };
  }, [user, userId]);

  useEffect(() => {
    const fallback = setTimeout(() => {
      if (!hasScrolled.current) {
        const allMeasured = Object.keys(yPositions.current).length === posts.length;
        const targetY = allMeasured ? yPositions.current[postId] ?? 0 : 0;
        scrollViewRef.current?.scrollTo({ y: targetY, animated: false });
        hasScrolled.current = true;
      }
      setReady(true);
    }, 400);

    return () => clearTimeout(fallback);
  }, [posts.length, postId]);

  function handlePostLayout(post: Post, y: number) {
    yPositions.current[post.id] = y;
    if (hasScrolled.current || Object.keys(yPositions.current).length !== posts.length) return;

    scrollViewRef.current?.scrollTo({ y: yPositions.current[postId] ?? 0, animated: false });
    hasScrolled.current = true;
    setReady(true);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerSide} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Posts</Text>
        <View style={styles.headerSide} />
      </View>
      <View style={styles.divider} />
      {posts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No posts to show.</Text>
        </View>
      ) : (
        <ScrollView ref={scrollViewRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={{ opacity: ready ? 1 : 0 }}>
            {posts.map((post) => (
              <View key={post.id} onLayout={(event) => handlePostLayout(post, event.nativeEvent.layout.y)}>
                <PostCard post={post} />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  headerSide: { width: spacing.xl + spacing.sm, alignItems: 'flex-start' },
  headerTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  divider: { height: 1, backgroundColor: colors.border },
  scrollView: { flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { ...type.body, color: colors.muted, textAlign: 'center' },
});