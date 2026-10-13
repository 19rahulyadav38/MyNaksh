export const palette = {
  saffron500: '#F2994A',
  saffron100: '#FDEBDB',
  indigo700: '#2D2A6E',
  indigo500: '#4B47B8',
  indigo100: '#E7E6F8',
  teal500: '#1F9E8E',
  teal100: '#DDF3F0',
  rose500: '#D9485F',
  rose100: '#FBE3E7',
  amber500: '#E0A100',
  amber100: '#FCF2D2',
  gray900: '#1B1B1F',
  gray600: '#5E5E6B',
  gray400: '#9A9AA6',
  gray200: '#E4E4EA',
  gray100: '#F3F3F6',
  white: '#FFFFFF',
} as const;

export const colors = {
  background: palette.gray100,
  surface: palette.white,
  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textMuted: palette.gray400,
  border: palette.gray200,
  primary: palette.indigo500,
  onPrimary: palette.white,
  userBubble: palette.indigo500,
  aiBubble: palette.white,
  humanBubble: palette.teal100,
  systemText: palette.gray600,
  danger: palette.rose500,
  dangerSurface: palette.rose100,
  accent: palette.saffron500,
  accentSurface: palette.saffron100,
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const typography = {
  caption: { fontSize: 12, lineHeight: 16 },
  body: { fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  title: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
} as const;
