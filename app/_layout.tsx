import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { MissionProvider } from '../lib/MissionContext';

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
    <MissionProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="post/create" options={{ presentation: 'modal' }} />
      </Stack>
    </MissionProvider>
  );
}