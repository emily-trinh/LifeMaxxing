import 'react-native-url-polyfill/auto';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { colors } from '../constants/theme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function AuthGate() {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)' || String(segments[0]) === 'auth';

        if (!session && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (session && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [loading, router, segments, session]);

    return (
        <Stack screenOptions={{ headerTintColor: colors.primaryDark, headerTitleStyle: { fontWeight: '700' } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/login" options={{ title: 'Log in' }} />
            <Stack.Screen name="event/[id]" options={{ title: 'Event details' }} />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar style="dark" />
            <AuthGate />
        </AuthProvider>
    );
}