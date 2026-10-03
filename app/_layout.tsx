import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/theme';

export default function RootLayout() {
  return <><StatusBar style="dark" /><Stack screenOptions={{ headerTintColor: colors.primaryDark, headerTitleStyle: { fontWeight: '700' } }}><Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="(auth)/login" options={{ title: 'Log in' }} /><Stack.Screen name="event/[id]" options={{ title: 'Event details' }} /><Stack.Screen name="settings" options={{ title: 'Settings' }} /></Stack></>;
}