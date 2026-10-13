export const palette = {
  saffron500: '#E0802E',
  saffron100: '#FDEBDB',
  indigo700: '#2D2A6E',
  indigo500: '#4B47B8',
  indigo100: '#E7E6F8',
  violet500: '#7C4DCC',
  violet100: '#EFE7FB',
  teal700: '#137567',
  teal500: '#1F9E8E',
  teal100: '#DDF3F0',
  rose500: '#D9485F',
  rose100: '#FBE3E7',
  sky500: '#2A7FC9',
  sky100: '#E1EFFB',
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
  primarySurface: palette.indigo100,
  userBubble: palette.indigo500,
  onUserBubble: palette.white,
  aiBubble: palette.white,
  humanBubble: palette.teal100,
  humanAccent: palette.teal700,
  systemSurface: palette.gray200,
  systemText: palette.gray600,
  danger: palette.rose500,
  dangerSurface: palette.rose100,
  accent: palette.saffron500,
  accentSurface: palette.saffron100,
} as const;

/** Accent pairs used to visually distinguish recommendation types. */
export const accents = {
  violet: { foreground: palette.violet500, background: palette.violet100 },
  indigo: { foreground: palette.indigo500, background: palette.indigo100 },
  teal: { foreground: palette.teal700, background: palette.teal100 },
  sky: { foreground: palette.sky500, background: palette.sky100 },
  saffron: { foreground: palette.saffron500, background: palette.saffron100 },
} as const;

export type Accent = (typeof accents)[keyof typeof accents];

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
  xs: 4,
  sm: 6,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const typography = {
  caption: { fontSize: 12, lineHeight: 16 },
  captionStrong: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  title: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
} as const;
