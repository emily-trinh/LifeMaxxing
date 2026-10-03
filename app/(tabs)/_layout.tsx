import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors, fonts } from '../../constants/theme';

const tabSymbols: Record<string, string> = {
  index: '\u2302',
  prompt: '\u2668',
  explore: '\u25ce',
  profile: '\u25cb',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11 },
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size, lineHeight: size }}>{tabSymbols[route.name]}</Text>
        ),
      })}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="prompt" options={{ title: 'Prompt' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}