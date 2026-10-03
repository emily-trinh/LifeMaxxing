import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../constants/theme';

export default function LoginScreen() { return <View style={styles.container}><Text style={styles.title}>Lifemaxxing</Text><Text style={styles.subtitle}>Make room for a different kind of week.</Text><Button onPress={() => router.replace('/(tabs)')}>Continue with Google</Button></View>; }
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background }, title: { color: colors.primaryDark, fontSize: 36, fontWeight: '800' }, subtitle: { color: colors.mutedText, fontSize: 17, marginVertical: spacing.lg } });