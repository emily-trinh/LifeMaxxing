import { Platform } from 'react-native';

export const colors = {
  background: '#F7F8F2',
  surface: '#FFFFFF',
  text: '#17211B',
  mutedText: '#66736A',
  primary: '#1E7A5C',
  primaryDark: '#14543F',
  accent: '#F4B942',
  border: '#DCE4DD',
  danger: '#C84C4C',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const theme = {
  colors,
  spacing,
  radius: { sm: 8, md: 14, lg: 22 },
  typography: { body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }) },
};