import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { colors, spacing, type } from '../../constants/theme';

export default function LoginScreen() { return <View style={styles.container}><Text style={styles.title}>Lifemaxxing</Text><Text style={styles.subtitle}>Make room for a different kind of week.</Text><Button label="Continue with Google" onPress={() => router.replace('/(tabs)')} /></View>; }
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.bg }, title: { ...type.title }, subtitle: { ...type.body, color: colors.muted, marginVertical: spacing.lg } });