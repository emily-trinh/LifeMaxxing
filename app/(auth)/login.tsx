import { useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { colors, spacing, type } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
    const { signIn, signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const signInWithEmail = async () => {
        try {
            setLoading(true);
            await signIn(email.trim(), password);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Please try again.';
            const invalidCredentials = message.toLowerCase().includes('invalid login credentials');

            Alert.alert(
                'Sign in failed',
                invalidCredentials
                    ? 'The email or password is incorrect. If you created this account before email confirmation was disabled, create a new account or reset the password in Supabase.'
                    : message
            );
        } finally {
            setLoading(false);
        }
    };

    const signUpWithEmail = async () => {
        try {
            setLoading(true);
            await signUp(email.trim(), password);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Please try again.';
            Alert.alert('Sign up failed', message);
        } finally {
            setLoading(false);
        }
    };
    const disabled = loading || !email.trim() || password.length < 6;

    return (
        <SafeAreaView style={styles.screen}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    <Text style={styles.title}>Lifemaxxing</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                onChangeText={setEmail}
                placeholder="email@address.com"
                style={styles.input}
                value={email}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                secureTextEntry
                style={styles.input}
                value={password}
            />

            <View style={styles.actions}>
                <Button label={loading ? 'Signing in...' : 'Sign in'} onPress={signInWithEmail} disabled={disabled} />
                <Button label="Create account" onPress={signUpWithEmail} variant="outline" disabled={disabled} />
            </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    container: { flex: 1, justifyContent: 'center', padding: spacing.lg },
    title: { ...type.title, marginBottom: spacing.lg },
    label: { ...type.label, marginBottom: spacing.xs, marginTop: spacing.md },
    input: { color: colors.text, borderColor: colors.border, borderRadius: 0, borderBottomWidth: 1, fontFamily: type.body.fontFamily, fontSize: type.body.fontSize, paddingVertical: spacing.sm, paddingHorizontal: 0 },
    actions: { gap: spacing.sm, marginTop: spacing.lg },
});

