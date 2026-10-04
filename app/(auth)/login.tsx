import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="email@address.com"
                style={styles.input}
                value={email}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
                autoCapitalize="none"
                autoComplete="password"
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                secureTextEntry
                style={styles.input}
                value={password}
            />

            <TouchableOpacity
                disabled={disabled}
                onPress={signInWithEmail}
                style={[styles.button, disabled && styles.buttonDisabled]}
            >
                <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                disabled={disabled}
                onPress={signUpWithEmail}
                style={[styles.button, styles.secondaryButton, disabled && styles.buttonDisabled]}
            >
                <Text style={styles.secondaryButtonText}>Create account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        color: '#17212b',
        fontSize: 30,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        color: '#86939e',
        fontSize: 16,
        marginBottom: 24,
    },
    label: {
        color: '#52606d',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        borderColor: '#86939e',
        borderRadius: 6,
        borderWidth: 1,
        fontSize: 16,
        padding: 12,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#2089dc',
        borderRadius: 6,
        marginTop: 20,
        padding: 14,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderColor: '#2089dc',
        borderWidth: 1,
        marginTop: 12,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: '#2089dc',
        fontSize: 16,
        fontWeight: '600',
    },
});
