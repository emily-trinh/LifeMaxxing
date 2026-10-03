import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../constants/theme';

type AvatarProps = { name: string; url?: string | null; size: number };

export function Avatar({ name, url, size }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const style = [styles.avatar, { width: size, height: size, borderRadius: size / 2 }];

  if (url) return <Image source={{ uri: url }} style={style} accessibilityLabel={`${name}'s avatar`} />;

  return (
    <View style={[style, styles.fallback]}>
      <Text style={[styles.initial, { fontSize: size * 0.48 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { overflow: 'hidden' },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink },
  initial: { color: colors.card, fontFamily: fonts.sansMedium },
});