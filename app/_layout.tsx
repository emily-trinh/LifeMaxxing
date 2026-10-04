import 'react-native-url-polyfill/auto';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MissionProvider } from '../lib/MissionContext';
import { ProfileProvider } from '../lib/ProfileContext';


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

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            const inAuthGroup = segments[0] === '(auth)' || String(segments[0]) === 'auth';

            if (!nextSession && !inAuthGroup) {
                router.replace('/login');
                return;
            }

            if (nextSession && inAuthGroup) {
                router.replace('/(tabs)');
            }
        });

        return () => subscription.unsubscribe();
    }, [router, segments]);

    if (loading) {
        return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
    }

    const app = (
        <MissionProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
            <Stack.Screen name="post/create" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="post/feed" options={{ headerShown: false }} />
            <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
          </Stack>
        </MissionProvider>
    );

    const inAuthGroup = segments[0] === '(auth)' || String(segments[0]) === 'auth';
    if (!session && !inAuthGroup) return <View style={{ flex: 1 }} />;
    if (session && inAuthGroup) return <View style={{ flex: 1 }} />;

    return session ? <ProfileProvider>{app}</ProfileProvider> : app;
}

export default function RootLayout() {
    const [loaded] = useFonts({
      DMSans_400Regular,
      DMSans_500Medium,
      DMSans_700Bold,
      BricolageGrotesque_700Bold,
      BricolageGrotesque_800ExtraBold,
    });

    if (!loaded) return null;

    return (
        <AuthProvider>
            <StatusBar style="dark" />
            <AuthGate />
        </AuthProvider>
    );
}