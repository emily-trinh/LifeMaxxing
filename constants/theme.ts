export const colors = {
  bg: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#111111',
  muted: '#6B6B6B',
  border: '#EAEAEA',
  ink: '#111111',
  accent: '#FF5A36',
  accentSoft: '#FFE6DF',
  prompt: '#FFF4B8',
  danger: '#D92D20',
};
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 4, md: 10, lg: 12 };
export const fonts = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
  display: 'BricolageGrotesque_800ExtraBold',
  displayMedium: 'BricolageGrotesque_700Bold',
};
export const type = {
  title: { fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.5, color: colors.text },
  heading: { fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.5, color: colors.text },
  promptTitle: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.3, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.text },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  button: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  icon: { fontFamily: fonts.regular, fontSize: 18, color: colors.text },
  heart: { fontFamily: fonts.regular, fontSize: 24, color: colors.ink },
  status: { fontFamily: fonts.medium, fontSize: 15, color: colors.accent },
};

export const confettiColors = ['#FF5A36', '#FFD84D', '#4ADE80', '#38BDF8', '#A78BFA', '#F472B6'];