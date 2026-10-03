import { Tabs } from 'expo-router';
import { colors } from '../../constants/theme';

export default function TabsLayout() { return <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary, headerTintColor: colors.primaryDark }}><Tabs.Screen name="index" options={{ title: 'Home', tabBarLabel: 'Home' }} /><Tabs.Screen name="prompt" options={{ title: 'Prompt', tabBarLabel: 'Prompt' }} /><Tabs.Screen name="explore" options={{ title: 'Explore', tabBarLabel: 'Explore' }} /><Tabs.Screen name="profile" options={{ title: 'Profile', tabBarLabel: 'Profile' }} /></Tabs>; }