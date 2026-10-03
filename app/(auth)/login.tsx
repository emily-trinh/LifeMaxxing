import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { colors, fonts, spacing } from '../../constants/theme';

export default function LoginScreen() { return <View style={styles.container}><Text style={styles.title}>Lifemaxxing</Text><Text style={styles.subtitle}>Make room for a different kind of week.</Text><Button label="Continue with Google" onPress={() => router.replace('/(tabs)')} /></View>; }
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.bg }, title: { color: colors.text, fontFamily: fonts.sansBold, fontSize: 32 }, subtitle: { color: colors.muted, fontFamily: fonts.sans, fontSize: 16, marginVertical: spacing.lg } });