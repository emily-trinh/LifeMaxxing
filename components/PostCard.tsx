import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../constants/theme';
import type { Post } from '../types';

export function PostCard({ post }: { post: Post }) { return <View style={styles.card}><Image source={{ uri: post.media_url }} style={styles.image} /><Text style={styles.caption}>{post.caption}</Text><Text style={styles.meta}>Shared by {post.user_id}</Text></View>; }
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }, image: { width: '100%', height: 190 }, caption: { color: colors.text, fontSize: 16, fontWeight: '600', paddingHorizontal: spacing.md, paddingTop: spacing.md }, meta: { color: colors.mutedText, fontSize: 12, padding: spacing.md } });