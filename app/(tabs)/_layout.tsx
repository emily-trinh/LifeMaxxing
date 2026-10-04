import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border, borderTopWidth: 1, elevation: 0 },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            index: focused ? 'home' : 'home-outline',
            prompt: focused ? 'sparkles' : 'sparkles-outline',
            explore: focused ? 'compass' : 'compass-outline',
            calendar: focused ? 'calendar' : 'calendar-outline',
            profile: focused ? 'person' : 'person-outline',
          } as const;
          return <Ionicons name={icons[route.name as keyof typeof icons]} color={color} size={size} />;
        },
      })}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="prompt" options={{ title: 'Activity' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}